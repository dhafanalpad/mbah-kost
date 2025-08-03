import { NextRequest, NextResponse } from 'next/server';
import { googleAIService } from '@/lib/google-ai';
import { SearchFilters } from '@/types/kost';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location') || '';
  const maxBudget = parseInt(searchParams.get('maxBudget') || '1000000');
  const facilities = searchParams.get('facilities')?.split(',').filter(Boolean) || [];
  const typeParam = searchParams.get('type') || 'Semua';
  const type: 'Semua' | 'Putra' | 'Putri' | 'Campur' = 
    typeParam as 'Semua' | 'Putra' | 'Putri' | 'Campur';

  try {
    const filters: SearchFilters = {
      location,
      maxBudget,
      facilities,
      type
    };

    // Use Google AI service for real search
    const results = await googleAIService.searchKosts(filters);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Real search error:', error);
    return NextResponse.json({ error: 'Failed to search kosts' }, { status: 500 });
  }
}

// Also add POST endpoint for chat-based search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Extract search filters from chat message
    const filters = await googleAIService.extractSearchFiltersFromChat(message);
    
    if (filters) {
      const results = await googleAIService.searchKosts(filters);
      return NextResponse.json({ results, filters });
    } else {
      // Handle general chat queries
      const response = await googleAIService.processChatMessage(message);
      return NextResponse.json({ message: response, type: 'chat' });
    }
  } catch (error) {
    console.error('Chat search error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}