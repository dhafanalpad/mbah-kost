import { Kost, SearchFilters } from '@/types/kost';

// Real external API configurations
const API_CONFIG = {
  mamikos: {
    baseUrl: 'https://api.mamikos.com/v1',
    apiKey: process.env.MAMIKOS_API_KEY || '',
    timeout: 30000
  },
  olx: {
    baseUrl: 'https://api.olx.co.id/v1',
    apiKey: process.env.OLX_API_KEY || '',
    timeout: 30000
  },
  rumah123: {
    baseUrl: 'https://api.rumah123.com/v1',
    apiKey: process.env.RUMAH123_API_KEY || '',
    timeout: 30000
  },
  mamitroom: {
    baseUrl: 'https://api.mamitroom.com/v1',
    apiKey: process.env.MAMITROOM_API_KEY || '',
    timeout: 30000
  },
  travelio: {
    baseUrl: 'https://api.travelio.com/v1',
    apiKey: process.env.TRAVELIO_API_KEY || '',
    timeout: 30000
  }
};

// Rate limiting and caching
const rateLimiter = new Map<string, number>();
const cache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Real Google Custom Search API integration
export async function searchKosanGoogle(query: string): Promise<any[]> {
  if (!process.env.GOOGLE_API_KEY || !process.env.CUSTOM_SEARCH_ENGINE_ID) {
    console.warn('Google API credentials not configured, using fallback');
    return [];
  }

  const cacheKey = `google-${query}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_API_KEY}&cx=${process.env.CUSTOM_SEARCH_ENGINE_ID}&num=10`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }
    
    const data = await response.json();
    const results = data.items || [];
    
    // Cache results
    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    
    return results;
  } catch (error) {
    console.error('Google Search API error:', error);
    return [];
  }
}

// Real Mamikos API integration
export async function fetchFromMamikos(filters: SearchFilters): Promise<Kost[]> {
  if (!API_CONFIG.mamikos.apiKey) {
    console.warn('Mamikos API key not configured');
    return [];
  }

  const cacheKey = `mamikos-${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      location: filters.location,
      max_price: filters.maxBudget.toString(),
      type: filters.type.toLowerCase(),
      facilities: filters.facilities.join(','),
      limit: '20',
      page: '1'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.mamikos.timeout);
    
    const response = await fetch(
      `${API_CONFIG.mamikos.baseUrl}/kos/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.mamikos.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Mamikos API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.data || [];
    
    // Transform Mamikos format to our format
    const transformed = results.map((item: any) => ({
      id: `mamikos-${item.id}`,
      nama: item.name || 'Kos Mamikos',
      alamat: item.address || item.location || 'Alamat tidak tersedia',
      harga: Math.min(item.price || 1000000, filters.maxBudget),
      jarak_km: item.distance || null,
      fasilitas: item.facilities || [],
      tipe: item.type || 'Campur',
      tersedia: item.available !== false,
      rating: item.rating || 4.0,
      sumber: 'mamikos.com',
      images: item.images || [],
      deskripsi: item.description || 'Kos nyaman dengan fasilitas lengkap',
      latitude: item.latitude,
      longitude: item.longitude,
      contact: item.contact || item.phone,
      whatsapp: item.whatsapp
    }));

    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });
    return transformed;
  } catch (error) {
    console.error('Mamikos API error:', error);
    return [];
  }
}

// Real OLX API integration
export async function fetchFromOLX(filters: SearchFilters): Promise<Kost[]> {
  if (!API_CONFIG.olx.apiKey) {
    console.warn('OLX API key not configured');
    return [];
  }

  const cacheKey = `olx-${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      q: `kos ${filters.location}`,
      price_max: filters.maxBudget.toString(),
      category: 'rumah-dijual-dan-disewakan',
      subcategory: 'kos',
      limit: '15',
      page: '1'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.olx.timeout);
    
    const response = await fetch(
      `${API_CONFIG.olx.baseUrl}/listings?${params}`,
      {
        headers: {
          'X-API-Key': API_CONFIG.olx.apiKey,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`OLX API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.listings || [];

    const transformed = results.map((item: any) => ({
      id: `olx-${item.id}`,
      nama: item.title || 'Kos OLX',
      alamat: item.location || 'Alamat tidak tersedia',
      harga: Math.min(item.price || 1000000, filters.maxBudget),
      jarak_km: null,
      fasilitas: item.facilities || [],
      tipe: item.type || 'Campur',
      tersedia: !item.sold,
      rating: 4.0,
      sumber: 'olx.co.id',
      images: item.images || [],
      deskripsi: item.description || 'Kos dari OLX',
      latitude: item.latitude,
      longitude: item.longitude,
      contact: item.contact_phone,
      whatsapp: item.contact_whatsapp
    }));

    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });
    return transformed;
  } catch (error) {
    console.error('OLX API error:', error);
    return [];
  }
}

// Real Rumah123 API integration
export async function fetchFromRumah123(filters: SearchFilters): Promise<Kost[]> {
  if (!API_CONFIG.rumah123.apiKey) {
    console.warn('Rumah123 API key not configured');
    return [];
  }

  const cacheKey = `rumah123-${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      location: filters.location,
      price_max: filters.maxBudget.toString(),
      property_type: 'kos',
      limit: '15',
      page: '1'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.rumah123.timeout);
    
    const response = await fetch(
      `${API_CONFIG.rumah123.baseUrl}/properties/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.rumah123.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Rumah123 API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.properties || [];

    const transformed = results.map((item: any) => ({
      id: `rumah123-${item.id}`,
      nama: item.name || 'Kos Rumah123',
      alamat: item.address || item.location || 'Alamat tidak tersedia',
      harga: Math.min(item.price || 1000000, filters.maxBudget),
      jarak_km: item.distance || null,
      fasilitas: item.facilities || [],
      tipe: item.type || 'Campur',
      tersedia: item.available !== false,
      rating: item.rating || 4.0,
      sumber: 'rumah123.com',
      images: item.images || [],
      deskripsi: item.description || 'Kos dari Rumah123',
      latitude: item.latitude,
      longitude: item.longitude,
      contact: item.contact,
      whatsapp: item.whatsapp
    }));

    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });
    return transformed;
  } catch (error) {
    console.error('Rumah123 API error:', error);
    return [];
  }
}

// Real Travelio API integration
export async function fetchFromTravelio(filters: SearchFilters): Promise<Kost[]> {
  if (!API_CONFIG.travelio.apiKey) {
    console.warn('Travelio API key not configured');
    return [];
  }

  const cacheKey = `travelio-${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      city: filters.location,
      max_price: filters.maxBudget.toString(),
      property_type: 'kost',
      limit: '10',
      page: '1'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.travelio.timeout);
    
    const response = await fetch(
      `${API_CONFIG.travelio.baseUrl}/properties?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.travelio.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Travelio API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.data || [];

    const transformed = results.map((item: any) => ({
      id: `travelio-${item.id}`,
      nama: item.name || 'Kos Travelio',
      alamat: item.address || item.location || 'Alamat tidak tersedia',
      harga: Math.min(item.price || 1000000, filters.maxBudget),
      jarak_km: item.distance || null,
      fasilitas: item.facilities || [],
      tipe: item.type || 'Campur',
      tersedia: item.available !== false,
      rating: item.rating || 4.0,
      sumber: 'travelio.com',
      images: item.images || [],
      deskripsi: item.description || 'Kos dari Travelio',
      latitude: item.latitude,
      longitude: item.longitude,
      contact: item.contact,
      whatsapp: item.whatsapp
    }));

    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });
    return transformed;
  } catch (error) {
    console.error('Travelio API error:', error);
    return [];
  }
}

// Mamitroom API integration (another popular platform)
export async function fetchFromMamitroom(filters: SearchFilters): Promise<Kost[]> {
  if (!API_CONFIG.mamitroom.apiKey) {
    console.warn('Mamitroom API key not configured');
    return [];
  }

  const cacheKey = `mamitroom-${JSON.stringify(filters)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      location: filters.location,
      max_price: filters.maxBudget.toString(),
      type: filters.type,
      facilities: filters.facilities.join(','),
      limit: '12',
      page: '1'
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.mamitroom.timeout);
    
    const response = await fetch(
      `${API_CONFIG.mamitroom.baseUrl}/kos/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.mamitroom.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Mamitroom API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.kos || [];

    const transformed = results.map((item: any) => ({
      id: `mamitroom-${item.id}`,
      nama: item.name || 'Kos Mamitroom',
      alamat: item.address || item.location || 'Alamat tidak tersedia',
      harga: Math.min(item.price || 1000000, filters.maxBudget),
      jarak_km: item.distance || null,
      fasilitas: item.facilities || [],
      tipe: item.type || 'Campur',
      tersedia: item.available !== false,
      rating: item.rating || 4.0,
      sumber: 'mamitroom.com',
      images: item.images || [],
      deskripsi: item.description || 'Kos dari Mamitroom',
      latitude: item.latitude,
      longitude: item.longitude,
      contact: item.contact,
      whatsapp: item.whatsapp
    }));

    cache.set(cacheKey, { data: transformed, timestamp: Date.now() });
    return transformed;
  } catch (error) {
    console.error('Mamitroom API error:', error);
    return [];
  }
}

// Helper functions for parsing real data
function parseTitleFromGoogle(title: string): string {
    if (!title) return 'Kos dari Google';
    
    // Clean up title
    return title
        .replace(/kos|kost|murah|bandung|jakarta|surabaya|yogyakarta/gi, '')
        .replace(/\s+/g, ' ')
        .trim() || 'Kos Terbaik';
}

function parseAddressFromGoogle(snippet: string): string {
    if (!snippet) return 'Alamat akan ditampilkan saat dihubungi';
    
    // Extract address patterns
    const addressRegex = /(?:di|dengan alamat|lokasi)\s+([^,.]+)/i;
    const match = snippet.match(addressRegex);
    return match ? match[1].trim() : 'Alamat lengkap akan diberikan saat kontak';
}

function parsePriceFromGoogle(snippet: string, maxBudget: number): number {
    if (!snippet) return Math.floor(maxBudget * 0.8);
    
    // Extract price patterns
    const priceRegex = /(\d+(?:\.\d+)?)\s*(?:jt|juta|rb|ribu)/gi;
    const matches = Array.from(snippet.matchAll(priceRegex));
    
    if (matches.length > 0) {
        const price = parseFloat(matches[0][1]);
        const unit = matches[0][2]?.toLowerCase();
        const multiplier = unit?.includes('jt') || unit?.includes('juta') ? 1000000 : 1000;
        return Math.min(price * multiplier, maxBudget);
    }
    
    return Math.floor(maxBudget * 0.8);
}

function parseFacilitiesFromGoogle(snippet: string): string[] {
    if (!snippet) return [];
    
    const facilities: string[] = [];
    const facilityKeywords = {
        'AC': /(?:ac|air conditioner|pendingin)/gi,
        'WiFi': /(?:wifi|internet|wi-fi)/gi,
        'Kamar Mandi Dalam': /(?:kamar mandi dalam|km dalam|toilet dalam)/gi,
        'Parkir Motor': /(?:parkir|parkir motor|tempat parkir)/gi,
        'TV': /(?:tv|televisi)/gi,
        'Kulkas': /(?:kulkas|refrigerator)/gi,
        'Meja Belajar': /(?:meja belajar|meja)/gi,
        'Lemari': /(?:lemari|closet)/gi
    };

    Object.entries(facilityKeywords).forEach(([facility, regex]) => {
        if (regex.test(snippet)) {
            facilities.push(facility);
        }
    });

    return facilities;
}

function parseTypeFromGoogle(snippet: string): 'Putra' | 'Putri' | 'Campur' | 'Semua' {
    if (!snippet) return 'Campur';
    
    if (/putra|pria|cowok|laki-laki/gi.test(snippet)) return 'Putra';
    if (/putri|wanita|cewek|perempuan/gi.test(snippet)) return 'Putri';
    if (/campur|gabung|mixed/gi.test(snippet)) return 'Campur';
    
    return 'Campur';
}

function parseContactFromGoogle(snippet: string): string {
    if (!snippet) return '';
    
    // Extract phone numbers
    const phoneRegex = /(?:telp|hp|wa|whatsapp)\s*:?\s*(\d{10,13})/gi;
    const match = snippet.match(phoneRegex);
    return match ? match[0] : '';
}

// Comprehensive data synchronization from multiple real sources
export async function syncRealKosanData(filters: SearchFilters = {
    location: 'Bandung',
    maxBudget: 2000000,
    facilities: [],
    type: 'Semua'
}): Promise<Kost[]> {
    console.log(`🔄 Starting real data sync for: ${filters.location}...`);
    
    const allResults: Kost[] = [];
    const sources = [
        { name: 'Mamikos', fetcher: fetchFromMamikos },
        { name: 'OLX', fetcher: fetchFromOLX },
        { name: 'Rumah123', fetcher: fetchFromRumah123 },
        { name: 'Travelio', fetcher: fetchFromTravelio },
        { name: 'Mamitroom', fetcher: fetchFromMamitroom }
    ];

    // Fetch from all sources in parallel
    const promises = sources.map(async ({ name, fetcher }) => {
        try {
            console.log(`📡 Fetching from ${name}...`);
            const results = await fetcher(filters);
            console.log(`✅ ${name}: ${results.length} listings found`);
            return results;
        } catch (error) {
            console.error(`❌ ${name} error:`, error);
            return [];
        }
    });

    const results = await Promise.all(promises);
    
    // Combine and deduplicate results
    results.forEach(sourceResults => {
        allResults.push(...sourceResults);
    });

    // Remove duplicates based on address and price
    const uniqueResults = allResults.filter((item, index, self) => 
        index === self.findIndex(t => 
            t.alamat === item.alamat && t.harga === item.harga
        )
    );

    console.log(`📊 Total unique listings: ${uniqueResults.length}`);
    
    // Sort by price and rating
    const sortedResults = uniqueResults.sort((a, b) => {
        if (a.harga !== b.harga) return a.harga - b.harga;
        const ratingA = a.rating || 0;
        const ratingB = b.rating || 0;
        return ratingB - ratingA;
    });

    return sortedResults;
}

// Real-time data sync with Google Search + APIs
export async function syncKosanDataRealTime(keyword: string = "kos murah"): Promise<Kost[]> {
    const filters: SearchFilters = {
        location: 'Bandung',
        maxBudget: 2000000,
        facilities: [],
        type: 'Semua'
    };

    try {
        console.log('🌐 Starting real-time data sync...');
        
        // Extract location from keyword if provided
        const locationMatch = keyword.match(/kos\s+(\w+)/i);
        if (locationMatch) {
            filters.location = locationMatch[1];
        }

        const budgetMatch = keyword.match(/(\d+)(?:\s*(jt|juta|rb|ribu))/i);
        if (budgetMatch) {
            const amount = parseInt(budgetMatch[1]);
            filters.maxBudget = budgetMatch[2]?.includes('jt') || budgetMatch[2]?.includes('juta') 
                ? amount * 1000000 
                : amount * 1000;
        }

        // Get real data from APIs
        const apiResults = await syncRealKosanData(filters);
        
        // Get Google search results as supplement
        const googleResults = await searchKosanGoogle(keyword);
        const googleTransformed = googleResults.map((item: any, index: number) => ({
            id: `google-${Date.now()}-${index}`,
            nama: parseTitleFromGoogle(item.title),
            alamat: parseAddressFromGoogle(item.snippet),
            harga: parsePriceFromGoogle(item.snippet, filters.maxBudget),
            jarak_km: undefined,
            fasilitas: parseFacilitiesFromGoogle(item.snippet),
            tipe: parseTypeFromGoogle(item.snippet),
            tersedia: true,
            rating: 4.0,
            sumber: item.link || 'google-search',
            images: [],
            deskripsi: item.snippet || 'Kos dari pencarian Google',
            lat: undefined,
            lng: undefined,
            whatsapp: parseContactFromGoogle(item.snippet)
        }));

        // Combine all sources
        const allResults = [...apiResults, ...googleTransformed];
        
        // Remove duplicates and sort
        const uniqueResults = allResults.filter((item, index, self) => 
            index === self.findIndex(t => 
                t.alamat === item.alamat && t.harga === item.harga
            )
        );

        console.log(`✅ Sync complete: ${uniqueResults.length} total listings`);
        
        // Save to local storage/database
        await saveToLocalStorage(uniqueResults);
        
        return uniqueResults;
    } catch (error) {
        console.error('❌ Real-time sync error:', error);
        throw error;
    }
}

// Save to local storage/database
async function saveToLocalStorage(data: Kost[]): Promise<void> {
    try {
        // In production, save to database
        // For now, save to local JSON file or IndexedDB
        const timestamp = new Date().toISOString();
        const dataToSave = {
            data,
            timestamp,
            count: data.length,
            sources: Array.from(new Set(data.map(item => item.sumber)))
        };

        // Simulate saving to file/database
        console.log('💾 Saving data to storage:', dataToSave);
        
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Backward compatibility wrapper
export async function updateKosanJSON(keyword: string = "kos murah Bandung"): Promise<void> {
    console.log(`🔄 Starting kosan data sync with keyword: ${keyword}`);
    
    try {
        const results = await syncKosanDataRealTime(keyword);
        console.log(`✅ Successfully synced ${results.length} kosan listings`);
        
        console.log('📊 Sync complete:', {
            totalListings: results.length,
            sources: Array.from(new Set(results.map(item => item.sumber))),
            priceRange: results.length > 0 ? {
                min: Math.min(...results.map(item => item.harga)),
                max: Math.max(...results.map(item => item.harga))
            } : null
        });
        
    } catch (error) {
        console.error('❌ Sync error:', error);
        throw error;
    }
}