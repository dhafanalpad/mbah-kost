'use client';

import { useState, useEffect } from 'react';
import { SearchInterface } from '@/components/SearchInterface';
import { ChatInterface } from '@/components/ChatInterface';
import { KostResults } from '@/components/KostResults';
import { MapView } from '@/components/MapView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { MessageCircle, Search, Map, Home as HomeIcon, RefreshCw } from 'lucide-react';
import { Kost, SearchFilters } from '@/types/kost';
import { useLanguage } from '@/hooks/useLanguage';

export default function Home() {
  const [kosts, setKosts] = useState<Kost[]>([]);
  const [filteredKosts, setFilteredKosts] = useState<Kost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [lastSearchFilters, setLastSearchFilters] = useState<SearchFilters | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    loadKosts();
  }, []);

  const loadKosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kosts');
      const data = await response.json();
      setKosts(data);
      setFilteredKosts(data);
    } catch (error) {
      console.error('Error loading kosts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    setLastSearchFilters(filters);
    
    try {
      const queryParams = new URLSearchParams({
        location: filters.location,
        maxBudget: filters.maxBudget.toString(),
        facilities: filters.facilities.join(','),
        type: filters.type
      });

      const response = await fetch(`/api/search?${queryParams}`);
      const results = await response.json();
      
      setFilteredKosts(results);
      setActiveTab('results');
    } catch (error) {
      console.error('Error searching kosts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/sync', { method: 'POST' });
      await loadKosts();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Mbah Kost
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('header.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={isLoading}
              className="hidden sm:flex"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tabs.search')}</span>
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center space-x-2">
              <HomeIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tabs.results')}</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tabs.map')}</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tabs.chat')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card className="p-6">
              <SearchInterface onSearch={handleSearch} isLoading={isLoading} />
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <KostResults 
              kosts={filteredKosts} 
              isLoading={isLoading}
              searchFilters={lastSearchFilters}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card className="p-6 h-[600px]">
              <MapView kosts={filteredKosts} />
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="p-6 h-[600px]">
              <ChatInterface kosts={kosts} onSearch={handleSearch} />
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Mbah Kost by Kangpcode. {t('footer.rights')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {t('footer.powered')} Google ADK & Gemini Flash 2.0
          </p>
        </div>
      </footer>
    </div>
  );
}