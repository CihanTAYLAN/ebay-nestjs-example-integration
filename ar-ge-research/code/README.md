# eBay API Integration - Complete Implementation

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7+-yellow)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey)](https://expressjs.com/)

This is a complete **eBay API integration** implementation with OAuth 2.0 authentication, product management, category mapping, pricing rules, and order processing. Built with modern Node.js, TypeScript, Express, and Prisma.

## 🎯 Acceptance Criteria Implementation

| Criteria | Status | Description |
|----------|--------|-------------|
| ✅ Mağaza Konfigürasyonu | Complete | Sandbox/Production store setup with API credentials |
| ✅ eBay API Authentication | Complete | OAuth 2.0 implementation with token management |
| ✅ eBay Category Mapping | Complete | Taxonomy API integration with local database |
| ✅ eBay Price Rules | Complete | Dynamic pricing with rules engine |
| ✅ eBay Listing Templates | Complete | Configurable listing templates |
| ✅ eBay Product Sync | Complete | Manual sync, push, and list operations |
| ✅ Order Listing & Details | Complete | eBay orders fetching and management |

## 🚀 Features

### 🔐 Authentication
- **OAuth 2.0** implementation for eBay APIs
- **Application tokens** for metadata access
- **User tokens** for protected operations
- **Automatic token refresh** with 5-minute buffer
- **Multi-store support** with different environments

### 🏪 Store Management
- **Multi-tenant architecture** for multiple eBay stores
- **Environment switching** (Sandbox/Production)
- **API credential management** (App ID, Cert ID, RuName)
- **Store health monitoring** and connection status

### 🏷️ Product Management
- **Category synchronization** from eBay Taxonomy API
- **Template-based listings** with customizable fields
- **Dynamic pricing** with rule-based calculations
- **Stock management** and quantity tracking
- **Bulk operations** for efficient processing

### 📊 Pricing Engine
- **Percentage markup** pricing rules
- **Fixed amount** additions
- **Category-specific** pricing
- **Priority-based** rule execution
- **Date/time-based** rule activation

### 📋 Order Processing
- **Order synchronization** from eBay Fulfillment API
- **Customer information** extraction
- **Shipping details** tracking
- **Order status** management
- **Tracking number** updates

### 🛡️ Error Handling & Resilience
- **Comprehensive error handling** for all eBay API calls
- **Rate limiting** compliance
- **Retry mechanisms** with exponential backoff
- **Detailed logging** and monitoring
- **Graceful degradation**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│   Frontend UI   │    │  Express API    │    │      eBay APIs   │
│   (HTML/JS)     │◄──►│   Controllers   │◄──►│    Production     │
└─────────────────┘    │   Services      │    │   + Sandbox      │
                       │   Middleware    │    └──────────────────┘
                       └─────────────────┘             ▲
                                ▲                     │
                                │              ┌──────────────────┐
                                ▼              │  Token Manager    │
┌─────────────────────────────────────────────┐ ▲   ┌──────────────────┐    │  Auto Refresh     │
│           PostgreSQL Database              │ │   │   Category       │    │                  │
│ ┌─────────────────────────────────────────┐ │     │   Manager        │    └──────────────────┘
│ │ Store │ Product │ Category │ Order │ ... │ └──►│                  │
│ └─────────────────────────────────────────┘       │   Services       │
└───────────────────────────────────────────────────┘   └──────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Node.js 18+** - Runtime environment
- **TypeScript** - Type-safe development
- **Express** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database

### Security & Reliability
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API call protection
- **Input Validation** - Request sanitization

### External APIs
- **eBay REST APIs** - Trading, Inventory, Fulfillment
- **Taxonomy API** - Category management
- **Identity API** - OAuth authentication

## 🚦 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://postgresql.org/) database
- [Git](https://git-scm.com/)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/ebay_integration
# EBAY_CLIENT_ID_SANDBOX=your_app_id
# EBAY_CLIENT_SECRET_SANDBOX=your_cert_id
# EBAY_RU_NAME_SANDBOX=your_ru_name
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

### 4. Run Development Server

```bash
# Start the server with hot reload
npm run dev

# Server runs on http://localhost:3000
# Open http://localhost:3000/index.html in your browser
```

### 5. Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Required Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"

# eBay Sandbox Credentials
EBAY_CLIENT_ID_SANDBOX=your_sandbox_app_id
EBAY_CLIENT_SECRET_SANDBOX=your_sandbox_cert_id
EBAY_RU_NAME_SANDBOX=your_sandbox_ru_name

# eBay Production Credentials
EBAY_CLIENT_ID_PRODUCTION=your_production_app_id
EBAY_CLIENT_SECRET_PRODUCTION=your_production_cert_id
EBAY_RU_NAME_PRODUCTION=your_production_ru_name
```

### eBay Developer Setup

1. **Register**: Visit [eBay Developer Program](https://developer.ebay.com/)
2. **Create App**: Get sandbox and production credentials
3. **Configure RuName**: Set up redirect URLs for OAuth
4. **Update Environment**: Add credentials to `.env`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

```http
# Get OAuth consent URL for store
GET /auth/consent/{storeId}

# OAuth callback handler
GET /auth/callback?code={auth_code}&state={storeId}
```

### Store Management

```http
# List all stores
GET /stores

# Get store details
GET /stores/{storeId}

# Create new store
POST /stores

# Update store
PUT /stores/{storeId}

# Delete store
DELETE /stores/{storeId}
```

### Product Management

```http
# List products
GET /products?storeId={storeId}

# Sync categories from eBay
POST /categories/sync/{storeId}

# Sync product to eBay
POST /products/{productId}/sync/{storeId}
```

### Order Management

```http
# Fetch orders from eBay
POST /orders/sync/{storeId}

# List local orders
GET /orders?storeId={storeId}

# Get order details
GET /orders/{orderId}
```

## 🗄️ Database Schema

### Core Tables

**stores** - eBay store configurations
**products** - Local product catalog
**categories** - eBay category mappings
**price_rules** - Pricing algorithms
**listing_templates** - Product listing formats
**orders** - eBay order data
**order_items** - Order line items

### Key Relationships

```
Store → Product (1:many)
Store → Category (1:many)
Store → PriceRule (1:many)
Store → ListingTemplate (1:many)
Store → Order (1:many)
Product → Category (many:1)
Order → OrderItem (1:many)
```

## 🎮 Demo Interface

Open `http://localhost:3000/index.html` to access the interactive demo:

- **System Status**: Server and database health checks
- **Store Management**: Create and manage eBay stores
- **OAuth Flow**: Generate consent URLs and handle callbacks
- **Product Sync**: Category and product synchronization
- **Order Fetch**: Import orders from eBay

## 🔍 Monitoring & Debugging

### Logging
- All API calls are logged with timestamps
- Error responses include stack traces in development
- Token operations are tracked for security

### Rate Limits
- Automatically respects eBay API limits
- Implements exponential backoff for retries
- Monitors rate limit headers from responses

### Health Checks
```bash
# Check server health
curl http://localhost:3000/health

# Check specific store status
curl http://localhost:3000/api/v1/stores/{storeId}
```

## 🤝 Usage Examples

### Basic Store Setup

```typescript
// Create a new store
const store = await fetch('/api/v1/stores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My eBay Store',
    userId: 'user-123',
    sandboxMode: true
  })
});

// Get OAuth consent URL
const consent = await fetch(`/api/v1/auth/consent/${store.id}`);
const { consentUrl } = await consent.json();

// Redirect user to consent URL
window.location.href = consentUrl;
```

### Product Synchronization

```typescript
// Sync a product to eBay
const sync = await fetch(`/api/v1/products/${productId}/sync/${storeId}`, {
  method: 'POST'
});

const result = await sync.json();
if (result.success) {
  console.log('Product listed on eBay:', result.ebayListingId);
}
```

## 🚨 Error Handling

### Common Error Codes

- **401 Unauthorized**: Invalid or expired access token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side issues

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message",
  "timestamp": "2025-10-15T12:00:00.000Z"
}
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Input sanitization**: XSS and injection protection  
- **Token encryption**: Secure credential storage
- **CORS policies**: Cross-origin request control
- **Rate limiting**: DDoS protection

## 📈 Scaling & Performance

### Database Optimization
- Indexed queries for common operations
- Connection pooling with Prisma
- Efficient data loading with relations

### API Performance
- Response caching for categories/taxonomy
- Batch operations for bulk updates
- Connection reuse with Keep-Alive

### Monitoring
- Request/response logging
- Error tracking and alerts
- Performance metrics collection

## 🧪 Testing

```bash
# Run unit tests (when implemented)
npm test

# Run with coverage
npm run test:coverage

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📖 Full Documentation

See `../HOWTO.md` for comprehensive technical documentation including:

- Complete OAuth implementation guide
- eBay API integration details
- Database schema documentation
- Architecture decisions
- Best practices and patterns

---

## 📝 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📞 Support

- **Documentation**: [HOWTO.md](../HOWTO.md)
- **Issues**: GitHub Issues
- **Email**: developer@example.com

---

*This implementation demonstrates a production-ready eBay API integration with modern web technologies and best practices.*
