'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  DollarSign, 
  Star, 
  Phone, 
  Navigation,
  Heart,
  ExternalLink,
  Wifi,
  Car,
  Bath,
  Utensils,
  Zap
} from 'lucide-react';
import { Kost, SearchFilters } from '@/types/kost';
import { useLanguage } from '@/hooks/useLanguage';

interface KostResultsProps {
  kosts: Kost[];
  isLoading: boolean;
  searchFilters?: SearchFilters | null;
}

export function KostResults({ kosts, isLoading, searchFilters }: KostResultsProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { t } = useLanguage();

  const toggleFavorite = (kostId: string) => {
    setFavorites(prev => 
      prev.includes(kostId) 
        ? prev.filter(id => id !== kostId)
        : [...prev, kostId]
    );
  };

  const getFacilityIcon = (facility: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'WiFi': Wifi,
      'AC': Zap,
      'Kamar Mandi Dalam': Bath,
      'Parkir Motor': Car,
      'Dapur Bersama': Utensils,
    };
    return icons[facility] || Wifi;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (kosts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">{t('results.noResults')}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('results.noResultsDesc')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      {searchFilters && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                {t('results.searchSummary')}
              </h3>
              <Badge variant="secondary">
                {kosts.length} {t('results.found')}
              </Badge>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>{t('search.location')}:</strong> {searchFilters.location}</p>
              <p><strong>{t('search.maxBudget')}:</strong> Rp {searchFilters.maxBudget.toLocaleString('id-ID')}</p>
              <p><strong>{t('search.type')}:</strong> {searchFilters.type}</p>
              {searchFilters.facilities.length > 0 && (
                <p><strong>{t('search.facilities')}:</strong> {searchFilters.facilities.join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {kosts.map((kost) => {
          const isFavorite = favorites.includes(kost.id);
          
          return (
            <Card key={kost.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {kost.nama}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="line-clamp-1">{kost.alamat}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(kost.id)}
                    className="shrink-0"
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                    />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price and Type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span className="font-semibold">
                      Rp {kost.harga.toLocaleString('id-ID')}/bulan
                    </span>
                  </div>
                  <Badge 
                    variant={kost.tipe === 'Putri' ? 'secondary' : kost.tipe === 'Putra' ? 'default' : 'outline'}
                  >
                    {kost.tipe}
                  </Badge>
                </div>

                {/* Distance and Rating */}
                <div className="flex items-center justify-between text-sm">
                  {kost.jarak_km && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Navigation className="w-4 h-4 mr-1" />
                      <span>{kost.jarak_km.toFixed(1)} km</span>
                    </div>
                  )}
                  {kost.rating && (
                    <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      <span>{kost.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Facilities */}
                {kost.fasilitas.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      {kost.fasilitas.slice(0, 4).map((facility) => {
                        const Icon = getFacilityIcon(facility);
                        return (
                          <Badge key={facility} variant="outline" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {facility}
                          </Badge>
                        );
                      })}
                      {kost.fasilitas.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{kost.fasilitas.length - 4} lainnya
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  {kost.kontak && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`https://wa.me/${kost.kontak?.replace(/\D/g, '')}`, '_blank')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {t('results.contact')}
                    </Button>
                  )}
                  {kost.sourceUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(kost.sourceUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('results.viewSource')}
                    </Button>
                  )}
                </div>

                {/* Availability Status */}
                <div className="flex items-center justify-between pt-2">
                  <Badge variant={kost.tersedia ? 'default' : 'destructive'}>
                    {kost.tersedia ? t('results.available') : t('results.unavailable')}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('results.source')}: {kost.sumber === 'lokal' ? 'Database' : kost.sumber}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}