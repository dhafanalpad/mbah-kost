'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage, Kost, SearchFilters } from '@/types/kost';
import { googleAIService } from '@/lib/google-ai';
import { useLanguage } from '@/hooks/useLanguage';

interface ChatInterfaceProps {
  kosts: Kost[];
  onSearch: (filters: SearchFilters) => void;
}

export function ChatInterface({ kosts, onSearch }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Halo! Saya Mbah Ai, asisten pencari kost yang berpengalaman. Saya siap membantu Anda menemukan kost yang sesuai dengan kebutuhan dan budget Anda. Ceritakan saja apa yang Anda cari!',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Use AI service for intelligent response
      const aiResponse = await generateAIResponse(input, kosts);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Extract search filters using AI service
      try {
        const searchFilters = await googleAIService.extractSearchFiltersFromChat(input);
        if (searchFilters) {
          onSearch(searchFilters);
        }
      } catch (error) {
        console.error('Search filter extraction error:', error);
        // Fallback to manual extraction
        const manualFilters = extractSearchFromMessage(input);
        if (manualFilters) {
          onSearch(manualFilters);
        }
      }
      
    } catch (error) {
      console.error('Chat response error:', error);
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Maaf ya dek, Mbah lagi koneksi putus nih. Coba lagi sebentar yuk! 🙏',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userInput: string, availableKosts: Kost[]): Promise<string> => {
    try {
      // Use Google AI service for intelligent responses
      const aiResponse = await googleAIService.processChatMessage(userInput);
      return aiResponse;
    } catch (error) {
      console.error('AI Response error:', error);
      
      // Fallback to basic filtering if AI service fails
      const input = userInput.toLowerCase();
      
      // Parse budget
      const budgetMatch = input.match(/(\d+)(?:k|rb|ribu|jt|juta)/);
      let budget = 1000000;
      if (budgetMatch) {
        const num = parseInt(budgetMatch[1]);
        budget = input.includes('jt') || input.includes('juta') ? num * 1000000 : num * 1000;
      }

      // Parse location
      const locationKeywords = ['bandung', 'jakarta', 'surabaya', 'yogya', 'malang', 'telkom', 'itb', 'ui', 'ugm'];
      const location = locationKeywords.find(loc => input.includes(loc)) || 'bandung';

      // Parse facilities
      const facilities: string[] = [];
      if (input.includes('wifi') || input.includes('internet')) facilities.push('WiFi');
      if (input.includes('ac') || input.includes('pendingin')) facilities.push('AC');
      if (input.includes('kamar mandi') || input.includes('toilet')) facilities.push('Kamar Mandi Dalam');
      if (input.includes('parkir') || input.includes('motor')) facilities.push('Parkir Motor');

      // Parse type
      let type: 'Putra' | 'Putri' | 'Campur' | 'Semua' = 'Semua';
      if (input.includes('putra') || input.includes('cowok') || input.includes('laki')) type = 'Putra';
      if (input.includes('putri') || input.includes('cewek') || input.includes('perempuan')) type = 'Putri';
      if (input.includes('campur') || input.includes('mixed')) type = 'Campur';

      // Filter kosts based on criteria
      const filteredKosts = availableKosts.filter(kost => 
        kost.harga <= budget &&
        (type === 'Semua' || kost.tipe === type) &&
        facilities.every(f => kost.fasilitas.includes(f))
      );

      if (filteredKosts.length > 0) {
        const kostList = filteredKosts.slice(0, 3).map(kost => 
          `• ${kost.nama} - Rp ${kost.harga.toLocaleString('id-ID')}/bulan (${kost.alamat})`
        ).join('\n');

        return `Nih Mbah nemuin ${filteredKosts.length} kos yang cocok untuk kamu:\n\n${kostList}\n\nMau lihat yang mana dulu? Atau masih kurang cocok? Kasih tau aja kebutuhan kamu yang lebih spesifik!`;
      }

      return `Wah maaf ya dek, Mbah belum nemuin kos yang cocok dengan kriteria kamu. Coba kurangi syarat atau ubah budgetnya yuk! Atau kamu bisa kasih tau lokasi dan fasilitas yang kamu inginkan dengan lebih detail.`;
    }
  };

  const extractSearchFromMessage = (input: string): SearchFilters | null => {
    const inputLower = input.toLowerCase();
    
    // Parse budget
    const budgetMatch = inputLower.match(/(\d+)(?:k|rb|ribu|jt|juta)/);
    let maxBudget = 2000000;
    if (budgetMatch) {
      const num = parseInt(budgetMatch[1]);
      maxBudget = inputLower.includes('jt') || inputLower.includes('juta') ? num * 1000000 : num * 1000;
    }

    const locationKeywords = ['bandung', 'jakarta', 'surabaya', 'yogya', 'malang', 'telkom', 'itb', 'ui', 'ugm', 'binus', 'binus'];
    const location = locationKeywords.find(loc => inputLower.includes(loc)) || 'bandung';

    const facilities: string[] = [];
    if (inputLower.includes('wifi') || inputLower.includes('internet')) facilities.push('WiFi');
    if (inputLower.includes('ac') || inputLower.includes('pendingin') || inputLower.includes('air conditioner')) facilities.push('AC');
    if (inputLower.includes('kamar mandi') || inputLower.includes('toilet') || inputLower.includes('km')) facilities.push('Kamar Mandi Dalam');
    if (inputLower.includes('parkir') || inputLower.includes('motor') || inputLower.includes('mobil')) facilities.push('Parkir Motor');
    if (inputLower.includes('tv') || inputLower.includes('televisi')) facilities.push('TV');
    if (inputLower.includes('kulkas') || inputLower.includes('refrigerator')) facilities.push('Kulkas');
    if (inputLower.includes('meja') || inputLower.includes('belajar')) facilities.push('Meja Belajar');
    if (inputLower.includes('lemari') || inputLower.includes('closet')) facilities.push('Lemari');

    let type: 'Semua' | 'Putra' | 'Putri' | 'Campur' = 'Semua';
    if (inputLower.includes('putra') || inputLower.includes('cowok') || inputLower.includes('pria') || inputLower.includes('laki')) type = 'Putra';
    if (inputLower.includes('putri') || inputLower.includes('cewek') || inputLower.includes('wanita') || inputLower.includes('perempuan')) type = 'Putri';
    if (inputLower.includes('campur') || inputLower.includes('mixed') || inputLower.includes('gabung')) type = 'Campur';

    // Return null if no search criteria detected
    const hasSearchCriteria = inputLower.includes('kos') || inputLower.includes('kost') || 
                             inputLower.includes('cari') || inputLower.includes('butuh') ||
                             budgetMatch !== null || facilities.length > 0;
    
    return hasSearchCriteria ? { location, maxBudget, facilities, type } : null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          {t('chat.title')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('chat.subtitle')}
        </p>
      </div>

      <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className={message.type === 'ai' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}>
                  {message.type === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white ml-auto'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('chat.placeholder')}
          className="flex-1"
          disabled={isTyping}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!input.trim() || isTyping}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}