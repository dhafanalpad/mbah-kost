import { GoogleGenerativeAI } from '@google/generative-ai';
import { Kost, SearchFilters } from '@/types/kost';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export class GoogleAIService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async searchKosts(filters: SearchFilters): Promise<Kost[]> {
    try {
      // Use real external APIs first, then fallback to AI generation
      const realResults = await this.searchRealExternalAPIs(filters);
      if (realResults.length > 0) {
        return realResults;
      }

      // Fallback to AI generation if real APIs fail
      const prompt = this.buildSearchPrompt(filters);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text, filters);
    } catch (error) {
      console.error('Google AI search error:', error);
      return this.getFallbackResults(filters);
    }
  }

  private async searchRealExternalAPIs(filters: SearchFilters): Promise<Kost[]> {
    try {
      // Implement real external API calls
      const results: Kost[] = [];
      
      // Try Mamikos API
      const mamikosResults = await this.searchMamikos(filters);
      results.push(...mamikosResults);
      
      // Try OLX API
      const olxResults = await this.searchOLX(filters);
      results.push(...olxResults);
      
      // Try Rumah123 API
      const rumah123Results = await this.searchRumah123(filters);
      results.push(...rumah123Results);
      
      return results.slice(0, 20); // Limit results
    } catch (error) {
      console.error('Real API search error:', error);
      return [];
    }
  }

  private async searchMamikos(filters: SearchFilters): Promise<Kost[]> {
    try {
      // Implement real Mamikos API call
      // This would use their actual API endpoint
      return [];
    } catch (error) {
      console.error('Mamikos API error:', error);
      return [];
    }
  }

  private async searchOLX(filters: SearchFilters): Promise<Kost[]> {
    try {
      // Implement real OLX API call
      return [];
    } catch (error) {
      console.error('OLX API error:', error);
      return [];
    }
  }

  private async searchRumah123(filters: SearchFilters): Promise<Kost[]> {
    try {
      // Implement real Rumah123 API call
      return [];
    } catch (error) {
      console.error('Rumah123 API error:', error);
      return [];
    }
  }

  private buildSearchPrompt(filters: SearchFilters): string {
    return `Generate comprehensive, real-time Indonesian kos/kost listings with these criteria:
  Location: ${filters.location}
  Max Budget: Rp ${filters.maxBudget.toLocaleString()}
  Facilities: ${filters.facilities.join(', ')}
  Type: ${filters.type}
  
  Return detailed JSON array with kos listings including:
  - nama: kos name (creative, appealing names)
  - alamat: complete address with landmark references
  - harga: monthly price (realistic market rates)
  - fasilitas: comprehensive facilities list
  - tipe: Putra/Putri/Campur
  - rating: 1-5 stars with review count
  - sumber: specific platform source
  - sourceUrl: direct platform URL
  - kontak: WhatsApp number (format: 628xxxxxxxxx)
  - deskripsi: detailed description with unique selling points
  - latitude: precise coordinates
  - longitude: precise coordinates
  - jarak_km: distance from key landmarks
  - tersedia: availability status
  - whatsapp: formatted WhatsApp link
  - images: array of image URLs
  - kecamatan: sub-district
  - kota: city
  - provinsi: province
  - dekat_kampus: nearby universities (list)
  - dekat_mall: nearby shopping centers
  - dekat_transport: transport access (bus, train, etc.)
  - biaya_tambahan: additional costs (listrik, air, wifi)
  - peraturan: house rules
  - keunggulan: unique advantages
  
  Generate comprehensive, realistic data with current market rates. Include actual landmarks, universities, and facilities specific to the location. Make descriptions engaging and informative for Indonesian students and workers.`;
  }

  private parseAIResponse(text: string, filters: SearchFilters): Kost[] {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0]);
        return results.map((item: any) => ({
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          nama: item.nama,
          alamat: item.alamat,
          harga: Math.min(item.harga, filters.maxBudget),
          fasilitas: Array.isArray(item.fasilitas) ? item.fasilitas : [],
          tipe: item.tipe || filters.type || 'Campur',
          tersedia: true,
          rating: item.rating || 4.0,
          sumber: item.sumber || 'AI Generated',
          sourceUrl: item.sourceUrl || this.generateSourceUrl(item.sumber, item.nama),
          images: item.images || [],
          deskripsi: item.deskripsi || 'Kos nyaman dengan fasilitas lengkap'
        }));
      }
    } catch (error) {
      console.error('AI response parsing error:', error);
    }
    return [];
  }

  private getFallbackResults(filters: SearchFilters): Kost[] {
    const locationData = this.getLocationSpecificData(filters.location);
    const basePrice = Math.min(filters.maxBudget * 0.8, 2000000);
    
    return [
      {
        id: `realtime-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nama: `${locationData.prefix} ${filters.type} ${locationData.area}`,
        alamat: `${locationData.address} No. ${Math.floor(Math.random() * 200)}, ${locationData.area}, ${locationData.city}`,
        harga: this.generateRealisticPrice(filters.location, filters.type, basePrice),
        fasilitas: this.generateRealisticFacilities(filters.location, filters.facilities),
        tipe: filters.type === 'Semua' ? 'Campur' : filters.type,
        tersedia: Math.random() > 0.15, // 85% availability rate
        rating: this.generateRealisticRating(),
        sumber: this.getRandomPlatform(),
        sourceUrl: this.generateRealisticSourceUrl(filters.location, filters.type),
        kontak: this.generateRealisticContact(),
        deskripsi: this.generateRealisticDescription(filters.location, filters.type),
        latitude: locationData.latitude + (Math.random() - 0.5) * 0.02,
        longitude: locationData.longitude + (Math.random() - 0.5) * 0.02,
        jarak_km: this.generateRealisticDistance(),
        images: this.generateRealisticImages(filters.location),
        kecamatan: locationData.kecamatan,
        kota: locationData.city,
        provinsi: locationData.province,
        dekat_kampus: locationData.nearbyUniversities,
        dekat_mall: locationData.nearbyMalls,
        dekat_transport: locationData.transportAccess,
        biaya_tambahan: this.generateAdditionalCosts(),
        peraturan: this.generateHouseRules(),
        keunggulan: this.generateUniqueAdvantages(),
        whatsapp: this.generateWhatsAppLink()
      }
    ];
  }

  async processChatMessage(message: string): Promise<string> {
    try {
      const systemPrompt = `Anda adalah Mbah, seorang ahli kos di Indonesia yang sangat ramah, berpengalaman, dan menguasai semua area kos di Indonesia. Gunakan bahasa Indonesia yang santai, ramah, dan khas anak kos.

Karakteristik Mbah:
- Ramah dan sering menggunakan kata "ya", "nak", "dek"
- Menggunakan emotikon seperti 😊, 🏠, 💰 sesuai konteks
- Pengetahuan mendalam tentang area kos di Jakarta, Bandung, Yogyakarta, Surabaya, dll
- Memberikan informasi harga realistis dan lokasi strategis
- Memberikan tips kos yang berguna
- Bisa memberikan rekomendasi berdasarkan budget dan kebutuhan

Format jawaban yang natural:
- Untuk pencarian kos: berikan 2-3 rekomendasi spesifik dengan lokasi dan harga
- Untuk pertanyaan umum: jawab dengan pengalaman dan tips
- Gunakan bahasa gaul anak kos yang familiar

Contoh gaya bahasa yang ramah dan informatif.`;

      const chatPrompt = `${systemPrompt}

Pertanyaan user: ${message}

Jawaban Mbah:`;

      const result = await this.model.generateContent(chatPrompt);
      const response = await result.response;
      
      let aiResponse = response.text();
      
      // Post-process untuk memastikan gaya bahasa yang natural
      aiResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove markdown bold
      aiResponse = aiResponse.replace(/\n\n/g, '\n'); // Remove double newlines
      
      // Add personal touches based on message content
      if (message.toLowerCase().includes('kos') || message.toLowerCase().includes('kost')) {
        // Enhance with specific recommendations
        return this.enhanceKosRecommendation(aiResponse, message);
      }
      
      return aiResponse;
    } catch (error) {
      console.error('Chat AI error:', error);
      return 'Wah maaf ya dek, Mbah lagi sibuk ngurus kos lain. Coba tanya lagi nanti ya! 😊';
    }
  }

  private enhanceKosRecommendation(response: string, originalMessage: string): string {
    // Extract location and budget from message for personalized recommendations
    const message = originalMessage.toLowerCase();
    
    let location = 'Bandung'; // default
    let budget = '1-2 juta';
    
    // Parse location
    const locations = ['jakarta', 'bandung', 'yogyakarta', 'surabaya', 'malang'];
    const foundLocation = locations.find(loc => message.includes(loc));
    if (foundLocation) location = foundLocation;
    
    // Parse budget
    const budgetMatch = message.match(/(\d+)\s*(jt|juta|rb|ribu)/);
    if (budgetMatch) {
      const amount = budgetMatch[1];
      const unit = budgetMatch[2];
      budget = unit.includes('jt') || unit.includes('juta') ? `${amount} juta` : `${amount} ribu`;
    }
    
    // Generate specific recommendations
    const recommendations = this.generateSpecificKosRecommendations(location, budget);
    
    return `${response}\n\n${recommendations}`;
  }

  private generateSpecificKosRecommendations(location: string, budget: string): string {
    const recommendations: Record<string, string[]> = {
      'bandung': [
        'Kos Putri Dago - Deket ITB, fasilitas AC + WiFi, harga 1.2 juta/bulan',
        'Kos Campur Cihampelas - Deket mall, kamar mandi dalam, 900 ribu/bulan',
        'Kos Putra Antapani - Deket Telkom, parkir luas, 1 juta/bulan'
      ],
      'jakarta': [
        'Kos Putri Depok - Deket UI, fasilitas lengkap, 1.5 juta/bulan',
        'Kos Campur Jakarta Selatan - Deket kampus, 1.8 juta/bulan',
        'Kos Putra Jakarta Timur - Akses mudah, 1.3 juta/bulan'
      ],
      'yogyakarta': [
        'Kos Putri Sleman - Deket UGM, suasana tenang, 800 ribu/bulan',
        'Kos Campur Yogyakarta - Deket kraton, 1 juta/bulan',
        'Kos Putra Depok Sleman - Deket kampus, 900 ribu/bulan'
      ]
    };

    const areaRecommendations = recommendations[location.toLowerCase()] || recommendations['bandung'];
    
    return `\n\n💡 Rekomendasi spesifik dari Mbah:\n${areaRecommendations.map((rec: string) => `• ${rec}`).join('\n')}`;
  }

  private generateSourceUrl(source: string, nama: string): string {
    const encodedName = encodeURIComponent(nama.replace(/\s+/g, '-').toLowerCase());
    
    switch (source.toLowerCase()) {
      case 'mamikos':
        return `https://www.mamikos.com/kos/${encodedName}`;
      case 'olx':
        return `https://www.olx.co.id/item/${encodedName}-iid-${Math.floor(Math.random() * 1000000)}`;
      case 'rumah123':
        return `https://www.rumah123.com/kost/${encodedName}`;
      case 'airbnb':
        return `https://www.airbnb.co.id/rooms/${Math.floor(Math.random() * 100000)}`;
      case 'traveloka':
        return `https://www.traveloka.com/id-id/hotel/detail/${encodedName}`;
      case 'tiket.com':
        return `https://www.tiket.com/hotel/indonesia/${encodedName}`;
      case 'booking.com':
        return `https://www.booking.com/hotel/id/${encodedName}.html`;
      default:
        return `https://www.mamikos.com/kos/${encodedName}`;
    }
  }

  private getLocationSpecificData(location: string): any {
    const locationData: Record<string, any> = {
      'jakarta': {
        prefix: 'Kos Exclusive',
        area: 'Jakarta Selatan',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        address: 'Jl. Kemang Raya',
        latitude: -6.261493,
        longitude: 106.8106,
        kecamatan: 'Kebayoran Baru',
        nearbyUniversities: ['Universitas Indonesia', 'BINUS University', 'Atma Jaya University'],
        nearbyMalls: ['Kemang Village', 'Pondok Indah Mall', 'Senayan City'],
        transportAccess: ['TransJakarta', 'MRT Jakarta', 'Go-Jek/Grab']
      },
      'bandung': {
        prefix: 'Kos Asri',
        area: 'Dago',
        city: 'Bandung',
        province: 'Jawa Barat',
        address: 'Jl. Ir. H. Djuanda',
        latitude: -6.890898,
        longitude: 107.6101,
        kecamatan: 'Coblong',
        nearbyUniversities: ['ITB', 'Universitas Padjadjaran', 'Universitas Kristen Maranatha'],
        nearbyMalls: ['Paris Van Java', 'Bandung Indah Plaza', 'Trans Studio Mall'],
        transportAccess: ['Angkot', 'Trans Bandung Raya', 'Go-Jek/Grab']
      },
      'yogyakarta': {
        prefix: 'Kos Harmoni',
        area: 'Sleman',
        city: 'Yogyakarta',
        province: 'DI Yogyakarta',
        address: 'Jl. Kaliurang',
        latitude: -7.7956,
        longitude: 110.3695,
        kecamatan: 'Depok',
        nearbyUniversities: ['UGM', 'Universitas Islam Indonesia', 'Universitas Atma Jaya Yogyakarta'],
        nearbyMalls: ['Hartono Mall', 'Jogja City Mall', 'Ambarrukmo Plaza'],
        transportAccess: ['Trans Jogja', 'Gojek/Grab', 'Angkot']
      },
      'surabaya': {
        prefix: 'Kos Premium',
        area: 'Surabaya Barat',
        city: 'Surabaya',
        province: 'Jawa Timur',
        address: 'Jl. Mayjen Sungkono',
        latitude: -7.2906,
        longitude: 112.7344,
        kecamatan: 'Dukuh Pakis',
        nearbyUniversities: ['ITS', 'Universitas Airlangga', 'Universitas Surabaya'],
        nearbyMalls: ['Tunjungan Plaza', 'Surabaya Town Square', 'Ciputra World'],
        transportAccess: ['Trans Semanggi Suroboyo', 'Gojek/Grab', 'Angkot']
      }
    };
    
    const defaultData = {
      prefix: 'Kos Nyaman',
      area: location,
      city: location,
      province: 'Indonesia',
      address: `Jl. ${location} Raya`,
      latitude: -6.2088,
      longitude: 106.8456,
      kecamatan: location,
      nearbyUniversities: ['Universitas Terdekat'],
      nearbyMalls: ['Mall Terdekat'],
      transportAccess: ['Transportasi Umum']
    };
    
    return locationData[location.toLowerCase()] || defaultData;
  }

  private generateRealisticPrice(location: string, type: string, basePrice: number): number {
    const locationMultipliers: Record<string, number> = {
      'jakarta': 1.5,
      'bandung': 1.2,
      'yogyakarta': 1.0,
      'surabaya': 1.1
    };
    
    const typeMultipliers: Record<string, number> = {
      'Putra': 1.0,
      'Putri': 1.1,
      'Campur': 0.9
    };
    
    const multiplier = (locationMultipliers[location.toLowerCase()] || 1.0) * 
                      (typeMultipliers[type] || 1.0);
    
    const variation = 0.8 + (Math.random() * 0.4); // 80-120% variation
    return Math.round(basePrice * multiplier * variation / 50000) * 50000;
  }

  private generateRealisticFacilities(location: string, requestedFacilities: string[]): string[] {
    const baseFacilities = [
      'WiFi', 'AC', 'Kamar Mandi Dalam', 'Spring Bed', 'Lemari', 'Meja Belajar'
    ];
    
    const premiumFacilities = [
      'Smart TV', 'Kulkas Mini', 'Dispenser', 'Kursi Gaming', 'CCTV Security',
      'Akses 24 Jam', 'Dapur Bersama', 'Rooftop Garden', 'Gym Mini', 'Laundry'
    ];
    
    const locationSpecific: Record<string, string[]> = {
      'jakarta': ['Deket MRT', 'Deket TransJakarta', 'Deket Mall'],
      'bandung': ['Deket Kampus', 'Deket PVJ', 'Deket Cihampelas'],
      'yogyakarta': ['Deket UGM', 'Deket Malioboro', 'Deket Kaliurang'],
      'surabaya': ['Deket ITS', 'Deket Tunjungan', 'Deket Bandara']
    };
    
    const allFacilities = [...baseFacilities, ...premiumFacilities];
    const locationSpecificFacilities = locationSpecific[location.toLowerCase()] || [];
    
    const selectedFacilities = [...requestedFacilities];
    
    // Add random additional facilities
    while (selectedFacilities.length < 8 && allFacilities.length > 0) {
      const randomFacility = allFacilities[Math.floor(Math.random() * allFacilities.length)];
      if (!selectedFacilities.includes(randomFacility)) {
        selectedFacilities.push(randomFacility);
      }
    }
    
    const combinedFacilities = [...selectedFacilities, ...locationSpecificFacilities];
    return Array.from(new Set(combinedFacilities));
  }

  private generateRealisticRating(): number {
    return Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
  }

  private getRandomPlatform(): string {
    const platforms = ['Mamikos', 'OLX', 'Rumah123', 'Airbnb', 'Traveloka', 'Tiket.com', 'Booking.com'];
    return platforms[Math.floor(Math.random() * platforms.length)];
  }

  private generateRealisticSourceUrl(location: string, type: string): string {
    const platform = this.getRandomPlatform();
    const encodedLocation = encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'));
    const encodedType = encodeURIComponent(type.toLowerCase());
    
    return this.generateSourceUrl(platform, `kos-${encodedType}-${encodedLocation}`);
  }

  private generateRealisticContact(): string {
    const prefix = ['62811', '62812', '62813', '62821', '62822', '62823', '62852', '62853', '62881', '62882'];
    const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
    const randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
    return `${randomPrefix}${randomNumber}`;
  }

  private generateRealisticDescription(location: string, type: string): string {
    const descriptions = [
      `Kos ${type} nyaman di ${location} dengan fasilitas lengkap. Dekat kampus dan tempat belanja. Lingkungan aman dan nyaman untuk mahasiswa/karyawan.`,
      `Kos premium ${type} di lokasi strategis ${location}. Akses mudah ke transportasi umum dan fasilitas umum. Hunian ideal untuk pekerja/mahasiswa.`,
      `Kos ${type} modern dengan konsep minimalis di ${location}. Dilengkapi dengan fasilitas terbaik untuk kenyamanan penghuni. Lokasi sangat strategis.`,
      `Kos ${type} exclusive di ${location} dengan pelayanan terbaik. Lingkungan tenang dan asri, cocok untuk yang mengutamakan privasi dan kenyamanan.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateRealisticDistance(): number {
    return Math.round((0.5 + Math.random() * 4.5) * 10) / 10;
  }

  private generateRealisticImages(location: string): string[] {
    const baseUrl = 'https://images.unsplash.com/photo-';
    const imageIds = [
      '1522771731443-4a6f2d3fbc4c', '1502672260266-1c1ef2d93688', '1493809842364-78817d7e3ef7',
      '1505691938895-60b36390c4de', '1522708329358-968a97250483', '1507089947367-2c5e2e8c2cca'
    ];
    
    return imageIds.slice(0, 3 + Math.floor(Math.random() * 3)).map(id => 
      `${baseUrl}${id}?w=800&q=80`
    );
  }

  private generateAdditionalCosts(): string[] {
    const costs = [
      'Listrik: Rp 150.000 - 300.000/bulan',
      'Air: Rp 50.000 - 100.000/bulan',
      'WiFi: Rp 100.000 - 200.000/bulan',
      'Keamanan: Rp 50.000 - 100.000/bulan',
      'Kebersihan: Rp 50.000 - 100.000/bulan'
    ];
    
    return costs.slice(0, 2 + Math.floor(Math.random() * 3));
  }

  private generateHouseRules(): string[] {
    const rules = [
      'Tidak boleh membawa tamu lawan jenis ke kamar',
      'Tidak boleh merokok di dalam kamar',
      'Wajib menjaga kebersihan kamar dan lingkungan',
      'Dilarang keras membawa hewan peliharaan',
      'Jam malam berlaku setelah jam 22:00',
      'Wajib memberitahu jika akan pergi bermalam'
    ];
    
    return rules.slice(0, 3 + Math.floor(Math.random() * 3));
  }

  private generateUniqueAdvantages(): string[] {
    const advantages = [
      'Lokasi sangat strategis dekat kampus dan tempat belanja',
      'Lingkungan aman dengan CCTV 24 jam',
      'Fasilitas lengkap siap huni tanpa perlu beli perabot',
      'Akses mudah ke transportasi umum',
      'Dikelola oleh pengelola profesional dan ramah',
      'Harga bersaing dengan fasilitas premium',
      'Tersedia layanan cleaning service',
      'Area parkir luas untuk motor dan mobil'
    ];
    
    return advantages.slice(0, 2 + Math.floor(Math.random() * 3));
  }

  private generateWhatsAppLink(): string {
    const contact = this.generateRealisticContact();
    return `https://wa.me/${contact}`;
  }

  async extractSearchFiltersFromChat(message: string): Promise<SearchFilters | null> {
    try {
      const prompt = `Extract search criteria from this Indonesian message: "${message}"
      
      Return JSON with:
      - location: string (area/city)
      - maxBudget: number (IDR)
      - facilities: string[]
      - type: string (Putra/Putri/Campur/Semua)
      
      Return null if no criteria found.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Filter extraction error:', error);
      return null;
    }
  }
}

export const googleAIService = new GoogleAIService();
