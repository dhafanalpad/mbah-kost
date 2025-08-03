'use client';

import { useEffect, useRef } from 'react';
import { Kost } from '@/types/kost';
import { useLanguage } from '@/hooks/useLanguage';

interface MapViewProps {
  kosts: Kost[];
}

export function MapView({ kosts }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // For now, show a placeholder since we don't have Google Maps API setup
    // In a real implementation, you would initialize Google Maps here
  }, [kosts]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {t('map.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('map.description')}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            {kosts.length} {t('map.locations')}
          </div>
        </div>
      </div>
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 space-y-2">
        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <span className="text-lg font-bold">+</span>
        </button>
        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
          <span className="text-lg font-bold">−</span>
        </button>
      </div>
    </div>
  );
}