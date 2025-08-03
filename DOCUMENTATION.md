# Mbah Kost: Complete Technical Documentation

## Overview

Mbah Kost is an AI-powered Indonesian kost (boarding house) finder that integrates seamlessly with external platforms like Mamikos, OLX, and Rumah123. This documentation covers all technical aspects, from architecture to deployment.

## Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
├─────────────────────────────────────────────────────────────┤
│                    Next.js Frontend                         │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                                │
├─────────────────────────────────────────────────────────────┤
│              Google Gemini AI Service                       │
├─────────────────────────────────────────────────────────────┤
│              External Platform Integration                  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14 | React framework with SSR |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | ShadCN UI | Accessible component library |
| **AI Engine** | Google Gemini Flash 2.0 | Natural language processing |
| **Database** | Local JSON | Fast, reliable data storage |
| **Maps** | Google Maps API | Location visualization |
| **Deployment** | Vercel | Serverless hosting |

## Core Features

### 1. AI-Powered Search
- **Natural Language Processing**: Understands queries like "kos murah dekat ITB"
- **Context Awareness**: Considers budget, location, facilities, and type
- **Multi-language Support**: Bahasa Indonesia and English
- **Fallback Mechanisms**: Uses mock data when external APIs fail

### 2. External Source Integration
- **Platform Support**: Mamikos, OLX, Rumah123, Airbnb, Traveloka
- **URL Generation**: Realistic, platform-specific links
- **Contact Integration**: Direct WhatsApp and platform messaging
- **Source Attribution**: Clear indication of data origin

### 3. "Lihat Sumber" Functionality

#### URL Generation System
```typescript
interface SourceUrlGenerator {
  mamikos: (name: string) => string;
  olx: (name: string) => string;
  rumah123: (name: string) => string;
  airbnb: (name: string) => string;
  traveloka: (name: string) => string;
}
```

#### Implementation Details
```typescript
// Example URL generation for Mamikos
const generateMamikosUrl = (kosName: string) => {
  const slug = kosName.toLowerCase().replace(/\s+/g, '-');
  return `https://www.mamikos.com/kos/${encodeURIComponent(slug)}`;
};

// Example URL generation for OLX
const generateOlxUrl = (kosName: string) => {
  const slug = kosName.toLowerCase().replace(/\s+/g, '-');
  const randomId = Math.floor(Math.random() * 1000000);
  return `https://www.olx.co.id/item/${slug}-iid-${randomId}`;
};
```

## API Documentation

### Core Endpoints

#### GET /api/kosts
Retrieves all kost listings with optional filtering.

**Query Parameters:**
- `location` (string): City or area name
- `maxBudget` (number): Maximum price in IDR
- `type` (string): Putra/Putri/Campur
- `facilities` (array): Required facilities

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ai-123456789",
      "nama": "Kos Putri Dago",
      "alamat": "Jl. Dago No. 123, Bandung",
      "harga": 1200000,
      "fasilitas": ["WiFi", "AC", "Kamar Mandi Dalam"],
      "tipe": "Putri",
      "sourceUrl": "https://www.mamikos.com/kos/kos-putri-dago",
      "kontak": "6281234567890"
    }
  ]
}
```

#### POST /api/search
Advanced search with AI-powered filtering.

**Request Body:**
```json
{
  "query": "kos murah dekat ITB buat cewek",
  "location": "Bandung",
  "maxBudget": 1000000,
  "type": "Putri",
  "facilities": ["WiFi", "AC"]
}
```

#### GET /api/sources
Retrieves available external source platforms.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Mamikos",
      "url": "https://www.mamikos.com",
      "icon": "🏠"
    },
    {
      "name": "OLX",
      "url": "https://www.olx.co.id",
      "icon": "📱"
    }
  ]
}
```

### AI Chat Integration

#### POST /api/chat
Process natural language queries with AI responses.

**Request Body:**
```json
{
  "message": "Mbah, cari kos di Jakarta budget 1.5 juta",
  "sessionId": "user-session-123"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Wah, ada nih dek kos yang cocok! Di Jakarta Selatan...",
  "filters": {
    "location": "Jakarta",
    "maxBudget": 1500000,
    "type": "Semua"
  }
}
```

## Configuration

### Environment Variables

#### Required
```bash
GOOGLE_API_KEY=your-google-api-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Optional
```bash
# External Platform Integration
MAMIKOS_API_KEY=your-mamikos-key
OLX_API_KEY=your-olx-key
RUMAH123_API_KEY=your-rumah123-key

# Performance & Security
NEXT_PUBLIC_THEME_DEFAULT=system
SECRET_ENCRYPTION_KEY=your-32-character-secret-key
```

### Local Development

#### Setup Steps
1. **Clone Repository**
   ```bash
   git clone https://github.com/kangpcode/mbah-kost.git
   cd mbah-kost
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Application runs on http://localhost:3000
   ```

## Database Schema

### Kost Data Structure
```typescript
interface Kost {
  id: string;
  nama: string;
  alamat: string;
  harga: number;
  fasilitas: string[];
  tipe: 'Putra' | 'Putri' | 'Campur';
  sumber: string;
  sourceUrl?: string;
  kontak?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  deskripsi?: string;
}
```

### Search Filters
```typescript
interface SearchFilters {
  location: string;
  maxBudget: number;
  facilities: string[];
  type: 'Semua' | 'Putra' | 'Putri' | 'Campur';
  maxDistance?: number;
}
```

## SEO Optimization

### Technical SEO
- **Schema Markup**: JSON-LD structured data
- **Meta Tags**: Dynamic title and description generation
- **Sitemap**: Automatic generation of SEO-friendly URLs
- **Robots.txt**: Proper crawling instructions

### Content Optimization
- **Keywords**: Targeted for Indonesian kost market
- **Local SEO**: Optimized for major Indonesian cities
- **Rich Snippets**: Enhanced search result display

## Performance Optimization

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Strategies
- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Route-based automatic splitting
- **Caching Strategy**: Intelligent caching with stale-while-revalidate
- **Bundle Analysis**: Regular bundle size monitoring

## Security Considerations

### Input Validation
- **XSS Protection**: Comprehensive input sanitization
- **SQL Injection**: Not applicable (JSON database)
- **Rate Limiting**: API endpoint protection

### Data Protection
- **Encryption**: Sensitive data encryption at rest
- **HTTPS Enforcement**: All external links use HTTPS
- **Privacy Compliance**: GDPR-compliant data handling

## Monitoring & Analytics

### Performance Monitoring
- **Real User Monitoring**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error logging
- **Usage Analytics**: User interaction tracking

### Health Checks
- **API Status**: External service availability monitoring
- **Database Health**: Local JSON file integrity checks
- **Performance Metrics**: Regular performance audits

## Troubleshooting

### Common Issues

#### "Lihat Sumber" Not Working
```bash
# Check URL generation
console.log(kost.sourceUrl);

# Verify external platform availability
curl -I https://www.mamikos.com
```

#### AI Responses Not Loading
```bash
# Check Google API key validity
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-pro
```

#### Local Database Issues
```bash
# Verify JSON file integrity
node -e "console.log(require('./db/kosan.json'))"
```

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=mbah-kost:* npm run dev
```

## Contributing

### Development Workflow
1. **Fork Repository**
2. **Create Feature Branch**: `git checkout -b feature/external-source-integration`
3. **Write Tests**: Ensure comprehensive test coverage
4. **Submit Pull Request**: Include detailed description of changes

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Semantic commit messages

## Support & Community

### Getting Help
- **Documentation**: This comprehensive guide
- **Issues**: GitHub issue tracker
- **Discussions**: GitHub discussions forum
- **Discord**: Community support server

### Commercial Support
- **Enterprise Support**: Available for business deployments
- **Custom Integrations**: Platform-specific customizations
- **Training Sessions**: Team onboarding and best practices

---

*This documentation is continuously updated. Last updated: August 2025*
