export interface Kost {
  id: string;
  nama: string;
  alamat: string;
  harga: number;
  jarak_km?: number;
  fasilitas: string[];
  tipe: 'Semua' | 'Putra' | 'Putri' | 'Campur';
  tersedia: boolean;
  sumber: string;
  sourceUrl?: string;
  latitude?: number;
  longitude?: number;
  thumbnail?: string;
  images?: string[];
  rating?: number;
  kontak?: string;
  deskripsi?: string;
  whatsapp?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  dekat_kampus?: string[];
  dekat_mall?: string[];
  dekat_transport?: string[];
  biaya_tambahan?: string[];
  peraturan?: string[];
  keunggulan?: string[];
}

export interface SearchFilters {
  location: string;
  maxBudget: number;
  facilities: string[];
  type: 'Semua' | 'Putra' | 'Putri' | 'Campur';
  maxDistance?: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  isTyping?: boolean;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}