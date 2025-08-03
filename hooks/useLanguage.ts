'use client';

import { useState, useEffect } from 'react';

const translations = {
  id: {
    header: {
      subtitle: 'Asisten AI Pencari Kost Terpercaya'
    },
    tabs: {
      search: 'Cari',
      results: 'Hasil',
      map: 'Peta',
      chat: 'Chat'
    },
    search: {
      title: 'Cari Kost Impian Anda',
      subtitle: 'Temukan kost yang sesuai dengan kebutuhan dan budget Anda',
      location: 'Lokasi',
      locationPlaceholder: 'Contoh: Bandung, Jakarta, dekat Telkom University',
      maxBudget: 'Budget Maksimal',
      type: 'Tipe Kost',
      typeAll: 'Semua',
      typeMale: 'Putra',
      typeFemale: 'Putri',
      typeMixed: 'Campur',
      facilities: 'Fasilitas',
      button: 'Cari Kost'
    },
    chat: {
      title: 'Chat dengan Mbah Ai',
      subtitle: 'Tanya apa saja tentang kost yang Anda cari',
      placeholder: 'Ketik pesan Anda...'
    },
    results: {
      noResults: 'Tidak Ada Hasil',
      noResultsDesc: 'Coba ubah kriteria pencarian atau gunakan chat dengan Mbah Ai',
      searchSummary: 'Ringkasan Pencarian',
      found: 'ditemukan',
      contact: 'Kontak',
      viewSource: 'Lihat Sumber',
      available: 'Tersedia',
      unavailable: 'Tidak Tersedia',
      source: 'Sumber'
    },
    map: {
      title: 'Peta Lokasi Kost',
      description: 'Lihat lokasi kost di peta untuk membantu Anda memilih',
      locations: 'lokasi ditampilkan'
    },
    footer: {
      rights: 'Hak Cipta Dilindungi.',
      powered: 'Didukung oleh'
    },
    common: {
      searching: 'Mencari...',
      refresh: 'Perbarui Data'
    }
  },
  en: {
    header: {
      subtitle: 'Trusted AI Kost Finder Assistant'
    },
    tabs: {
      search: 'Search',
      results: 'Results',
      map: 'Map',
      chat: 'Chat'
    },
    search: {
      title: 'Find Your Dream Kost',
      subtitle: 'Discover kosts that match your needs and budget',
      location: 'Location',
      locationPlaceholder: 'Example: Bandung, Jakarta, near Telkom University',
      maxBudget: 'Maximum Budget',
      type: 'Kost Type',
      typeAll: 'All',
      typeMale: 'Male',
      typeFemale: 'Female',
      typeMixed: 'Mixed',
      facilities: 'Facilities',
      button: 'Search Kost'
    },
    chat: {
      title: 'Chat with Mbah Ai',
      subtitle: 'Ask anything about the kost you are looking for',
      placeholder: 'Type your message...'
    },
    results: {
      noResults: 'No Results Found',
      noResultsDesc: 'Try changing your search criteria or use chat with Mbah Ai',
      searchSummary: 'Search Summary',
      found: 'found',
      contact: 'Contact',
      viewSource: 'View Source',
      available: 'Available',
      unavailable: 'Unavailable',
      source: 'Source'
    },
    map: {
      title: 'Kost Location Map',
      description: 'View kost locations on map to help you choose',
      locations: 'locations shown'
    },
    footer: {
      rights: 'All Rights Reserved.',
      powered: 'Powered by'
    },
    common: {
      searching: 'Searching...',
      refresh: 'Refresh Data'
    }
  }
};

export function useLanguage() {
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'id' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'id' ? 'en' : 'id';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { language, toggleLanguage, t };
}