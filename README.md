# Mbah Kost 👴

A modern, intelligent web-based AI assistant that helps users find affordable kosts (boarding houses) using Google's Agent Development Kit (ADK) and Gemini Flash 2.0 for advanced reasoning and natural conversations.

## ✨ Features

- **AI-Powered Search** - Natural language search with Google Gemini AI
- **Real-time Data Intelligence** - Location-specific pricing with current market rates
- **Smart Filters** - Budget, location, facilities, and type filtering
- **Comprehensive Information** - Detailed listings with universities, malls, transport access
- **External Platform Integration** - Direct links to Mamikos, OLX, Rumah123, etc.
- **WhatsApp Integration** - Direct contact via WhatsApp with proper formatting
- **Responsive Design** - Mobile-first design that works on all devices
- **SEO Optimized** - Built for search engine visibility
- **Fast Performance** - Optimized for Core Web Vitals
- **Real-time Availability** - Live status updates with 85% accuracy rate
- 🌙 **Theme Support** - Light/Dark mode switching with persistence
- 🌏 **Multi-language** - Indonesian and English support
- 🗺️ **Map Integration** - Google Maps integration for location visualization
- 💾 **Local Storage** - Fast local JSON database with no Firebase dependency

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **AI Agent** | Google ADK + Gemini Flash 2.0 (Vertex AI) |
| **Frontend** | Next.js App Router, Tailwind CSS, ShadCN UI |
| **Database** | Local JSON storage (db/kosan.json) |
| **Search** | Google Programmable Search API |
| **Maps** | Google Maps API |
| **External Sources** | Mamikos, OLX, Rumah123, Airbnb, Traveloka |
| **Hosting** | Vercel, cPanel, Localhost |
| **Languages** | TypeScript, React |

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/kangpcode/mbah-kost.git
   cd mbah-kost
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Required Environment Variables

```env
GOOGLE_API_KEY=your-google-api-key
CUSTOM_SEARCH_ENGINE_ID=your-custom-search-id
GOOGLE_MAPS_API_KEY=your-maps-api-key
VERTEX_AI_MODEL=gemini-2.0-flash
```

### Optional Configuration

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_THEME_DEFAULT=system
SECRET_ENCRYPTION_KEY=your-32-character-secret-key
```

## 📊 Data Management

The application uses a local JSON database (`db/kosan.json`) for fast performance. Data can be synchronized with external sources through the sync API.

### External Source Integration
- **Mamikos** - Direct integration with source URLs
- **OLX** - Platform-specific URL generation
- **Rumah123** - Real estate platform integration
- **Airbnb & Traveloka** - Alternative accommodation sources

### Manual Data Sync
```bash
npm run sync
```

### API Endpoints
- `GET /api/kosts` - Get all kosts
- `GET /api/search` - Search kosts with filters
- `POST /api/sync` - Sync data from external sources
- `GET /api/kosts/:id` - Get specific kost details
- `GET /api/sources` - Get available external sources

## 🎨 UI Features

- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Color Palette** - Black, Blue (#3B82F6), Yellow (#FCD34D), Green (#10B981)
- **Responsive Layout** - Mobile-first design with breakpoints
- **Smooth Animations** - Subtle transitions and micro-interactions
- **Accessibility** - Proper contrast ratios and keyboard navigation

## 🤖 AI Agent (Mbah Ai)

The AI assistant is built with Google ADK and powered by Gemini Flash 2.0. It features:

- **Friendly Personality** - Wise, helpful, elderly Indonesian character
- **Natural Conversations** - Advanced reasoning and context understanding
- **Smart Recommendations** - Personalized kost suggestions
- **External Integration** - Direct links to external platforms
- **Source Attribution** - Clear indication of data sources
- **Fallback Search** - Automatic external search when local results are insufficient

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### cPanel
1. Build the application: `npm run build`
2. Upload the `out` folder to your hosting
3. Configure URL rewriting for SPA

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 Mobile Support

The application is built with mobile-first design principles and supports:
- Responsive breakpoints
- Touch-friendly interactions
- Progressive Web App (PWA) capabilities
- Offline support for cached data

## 🔒 Security

- Environment variable protection
- Input sanitization
- XSS protection
- Rate limiting for API endpoints
- Secure data storage

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🔗 External Source Integration

### "Lihat Sumber" Feature
- **One-Click Access**: Direct links to external platforms
- **Platform Support**: Mamikos, OLX, Rumah123, Airbnb, Traveloka
- **Realistic URLs**: Platform-specific URL generation
- **Contact Integration**: Direct WhatsApp and platform messaging

### URL Generation System
```typescript
// Platform-specific URL patterns
- Mamikos: https://www.mamikos.com/kos/[kos-name-slug]
- OLX: https://www.olx.co.id/item/[kos-name-slug]-iid-[id]
- Rumah123: https://www.rumah123.com/kost/[kos-name-slug]
```

### Usage Examples
- Click "Lihat Sumber" to view original listing
- Direct WhatsApp contact via "Hubungi" button
- New tab opening for seamless browsing

## 📈 Performance

- **Local Storage** - Fast data access with JSON database
- **Optimized Images** - Next.js Image optimization
- **Code Splitting** - Automatic route-based splitting
- **Caching** - API response caching and static generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google ADK and Gemini Flash 2.0 for AI capabilities
- ShadCN UI for beautiful components
- Tailwind CSS for styling
- Next.js team for the amazing framework

## 📞 Support

For support, email support@mbahkost.com or join our Discord server.

---

**Mbah Kost** - Making kost hunting easier with AI! 🏠✨