'use client';

import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage}>
      <Languages className="w-4 h-4 mr-2" />
      {language === 'id' ? 'ID' : 'EN'}
    </Button>
  );
}