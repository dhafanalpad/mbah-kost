'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, DollarSign, Wifi, Car, Bath, Utensils, Zap } from 'lucide-react';
import { SearchFilters } from '@/types/kost';
import { useLanguage } from '@/hooks/useLanguage';

interface SearchInterfaceProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
}

const facilities = [
  { id: 'WiFi', icon: Wifi, label: 'WiFi' },
  { id: 'AC', icon: Zap, label: 'AC' },
  { id: 'Kamar Mandi Dalam', icon: Bath, label: 'Kamar Mandi Dalam' },
  { id: 'Parkir Motor', icon: Car, label: 'Parkir Motor' },
  { id: 'Dapur Bersama', icon: Utensils, label: 'Dapur Bersama' },
];

export function SearchInterface({ onSearch, isLoading }: SearchInterfaceProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    maxBudget: 1000000,
    facilities: [],
    type: 'Semua'
  });
  const { t } = useLanguage();

  const handleFacilityChange = (facilityId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      facilities: checked 
        ? [...prev.facilities, facilityId]
        : prev.facilities.filter(f => f !== facilityId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          {t('search.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('search.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{t('search.location')}</span>
          </Label>
          <Input
            id="location"
            type="text"
            placeholder={t('search.locationPlaceholder')}
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="pl-10"
            required
          />
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label htmlFor="budget" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span>{t('search.maxBudget')}</span>
          </Label>
          <Select 
            value={filters.maxBudget.toString()} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, maxBudget: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="500000">Rp 500.000</SelectItem>
              <SelectItem value="750000">Rp 750.000</SelectItem>
              <SelectItem value="1000000">Rp 1.000.000</SelectItem>
              <SelectItem value="1500000">Rp 1.500.000</SelectItem>
              <SelectItem value="2000000">Rp 2.000.000</SelectItem>
              <SelectItem value="3000000">Rp 3.000.000+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>{t('search.type')}</Label>
        <Select 
          value={filters.type} 
          onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semua">{t('search.typeAll')}</SelectItem>
            <SelectItem value="Putra">{t('search.typeMale')}</SelectItem>
            <SelectItem value="Putri">{t('search.typeFemale')}</SelectItem>
            <SelectItem value="Campur">{t('search.typeMixed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Facilities */}
      <div className="space-y-3">
        <Label>{t('search.facilities')}</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {facilities.map((facility) => {
            const Icon = facility.icon;
            return (
              <div key={facility.id} className="flex items-center space-x-2">
                <Checkbox
                  id={facility.id}
                  checked={filters.facilities.includes(facility.id)}
                  onCheckedChange={(checked) => 
                    handleFacilityChange(facility.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={facility.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{facility.label}</span>
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Button */}
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white py-3"
        disabled={isLoading}
      >
        <Search className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? t('common.searching') : t('search.button')}
      </Button>
    </form>
  );
}