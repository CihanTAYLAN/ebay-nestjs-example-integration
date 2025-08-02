# eBay OAuth2 Entegrasyonu Rehberi

Bu rehber, eBay OAuth2 flow'u ile nasıl authentication yapacağınızı açıklar.

## 🔐 OAuth2 Flow

### 1. Authorization URL Alma

**GET** `http://localhost:3000/api/auth/login`

```json
{
  "authUrl": "https://auth.sandbox.ebay.com/oauth2/authorize?client_id=YOUR_APP_ID&redirect_uri=YOUR_RU_NAME&response_type=code&state=&scope=https://api.ebay.com/oauth/api_scope%20https://api.ebay.com/oauth/api_scope/sell.inventory%20https://api.ebay.com/oauth/api_scope/sell.fulfillment",
  "message": "Visit this URL to authorize the application with eBay"
}
```

### 2. eBay'de Authorization

1. Yukarıdaki `authUrl`'i tarayıcınızda açın
2. eBay hesabınızla giriş yapın
3. Uygulamaya izin verin
4. eBay sizi callback URL'ine yönlendirecek

### 3. Callback Handling

eBay, authorization sonrası sizi şu URL'e yönlendirir:

```
http://localhost:3000/api/auth/callback?code=AUTHORIZATION_CODE&state=STATE
```

Bu endpoint otomatik olarak:

- Authorization code'u access token ile değiştirir
- Token'ları saklar
- Response döner

**Response:**

```json
{
  "success": true,
  "message": "Successfully authenticated with eBay",
  "tokens": {
    "access_token": "v^1.1#i^1#...",
    "refresh_token": "v^1.1#i^1#...",
    "expires_in": 7200,
    "token_type": "Bearer",
    "created_at": 1704067200000
  }
}
```

## 🚀 Kullanım Adımları

### Adım 1: Authorization URL'i Alın

```bash
curl -X GET http://localhost:3000/api/auth/login
```

### Adım 2: Tarayıcıda Authorization

Dönen `authUrl`'i tarayıcınızda açın ve eBay'de authorize edin.

### Adım 3: Authentication Durumunu Kontrol Edin

```bash
curl -X GET http://localhost:3000/api/auth/status
```

**Response:**

```json
{
  "authenticated": true,
  "tokenValid": true,
  "tokens": {
    "access_token": "v^1.1#i^1#I2MjYzNzQ...",
    "expires_in": 7200,
    "token_type": "Bearer",
    "created_at": 1704067200000
  }
}
```

### Adım 4: eBay API'lerini Kullanın

Artık tüm eBay endpoint'lerini kullanabilirsiniz:

```bash
# Inventory item oluştur
curl -X POST http://localhost:3000/api/ebay/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TEST-001",
    "title": "Test Product",
    "description": "Test description",
    "brand": "TestBrand",
    "condition": "NEW",
    "quantity": 10
  }'
```

## 🔄 Token Yenileme

Token'lar otomatik olarak yenilenir, ancak manuel olarak da yenileyebilirsiniz:

```bash
curl -X GET http://localhost:3000/api/auth/refresh
```

## 📋 API Endpoints

### Authentication Endpoints

| Method | Endpoint             | Açıklama                                   |
| ------ | -------------------- | ------------------------------------------ |
| GET    | `/api/auth/login`    | Authorization URL'i al                     |
| GET    | `/api/auth/callback` | OAuth2 callback (eBay tarafından çağrılır) |
| GET    | `/api/auth/status`   | Authentication durumunu kontrol et         |
| GET    | `/api/auth/refresh`  | Access token'ı yenile                      |

### eBay API Endpoints

| Method | Endpoint                               | Açıklama               |
| ------ | -------------------------------------- | ---------------------- |
| POST   | `/api/ebay/inventory`                  | Inventory item oluştur |
| POST   | `/api/ebay/products`                   | Product offer oluştur  |
| POST   | `/api/ebay/products/{offerId}/publish` | Listing yayınla        |
| PATCH  | `/api/ebay/products/{offerId}/price`   | Fiyat güncelle         |
| GET    | `/api/ebay/products/{offerId}/status`  | Listing durumu         |
| GET    | `/api/ebay/orders`                     | Siparişleri listele    |
| GET    | `/api/ebay/orders/{orderId}`           | Sipariş detayı         |

## ⚙️ Environment Variables

`.env` dosyasında aşağıdaki değerleri ayarlayın:

```env
# eBay API Configuration
EBAY_APP_ID=your_ebay_app_id_here
EBAY_CERT_ID=your_ebay_cert_id_here
EBAY_RU_NAME=http://localhost:3000/api/auth/callback
EBAY_SANDBOX=true
EBAY_MERCHANT_LOCATION=your_merchant_location_key_here

# Application Configuration
PORT=3000
NODE_ENV=development
```

**Önemli:** `EBAY_RU_NAME` mutlaka `http://localhost:3000/api/auth/callback` olmalı ve eBay Developer Console'da da aynı URL kayıtlı olmalı.

## 🔧 eBay Developer Console Ayarları

1. [eBay Developers](https://developer.ebay.com/) sitesine gidin
2. Uygulamanızı oluşturun
3. **Redirect URI** olarak `http://localhost:3000/api/auth/callback` ekleyin
4. **Scopes** olarak şunları seçin:
   - `https://api.ebay.com/oauth/api_scope`
   - `https://api.ebay.com/oauth/api_scope/sell.inventory`
   - `https://api.ebay.com/oauth/api_scope/sell.fulfillment`

## 🧪 Test Senaryosu

### Tam Workflow Testi:

```bash
# 1. Authorization URL al
curl -X GET http://localhost:3000/api/auth/login

# 2. Dönen URL'i tarayıcıda aç ve authorize et

# 3. Authentication durumunu kontrol et
curl -X GET http://localhost:3000/api/auth/status

# 4. Inventory item oluştur
curl -X POST http://localhost:3000/api/ebay/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "OAUTH-TEST-001",
    "title": "OAuth Test Product",
    "description": "Test product for OAuth flow",
    "brand": "TestBrand",
    "condition": "NEW",
    "quantity": 5
  }'

# 5. Product offer oluştur
curl -X POST http://localhost:3000/api/ebay/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "OAUTH-TEST-001",
    "title": "OAuth Test Product",
    "description": "Test product for OAuth flow",
    "price": 99.99,
    "quantity": 5,
    "brand": "TestBrand",
    "condition": "NEW",
    "categoryId": "9355"
  }'
```

## 🚨 Troubleshooting

### Yaygın Hatalar:

1. **"Not authenticated. Please authorize first"**

   - `/api/auth/login` endpoint'ini çağırın
   - Dönen URL'de authorization yapın

2. **"Invalid redirect_uri"**

   - eBay Developer Console'da redirect URI'yi kontrol edin
   - `EBAY_RU_NAME` environment variable'ını kontrol edin

3. **"Token expired"**

   - Token otomatik yenilenir
   - Manuel yenilemek için `/api/auth/refresh` çağırın

4. **"Invalid scope"**
   - eBay Developer Console'da scope'ları kontrol edin
   - Gerekli izinlerin verildiğinden emin olun

## 🔒 Güvenlik

- Token'lar memory'de saklanır (production'da database kullanın)
- HTTPS kullanın (production'da)
- Token'ları log'lamayın
- Refresh token'ları güvenli saklayın

## 📱 Frontend Entegrasyonu

Frontend uygulamanızda:

```javascript
// 1. Authorization URL al
const authResponse = await fetch('/api/auth/login');
const { authUrl } = await authResponse.json();

// 2. Kullanıcıyı yönlendir
window.location.href = authUrl;

// 3. Callback sonrası authentication durumunu kontrol et
const statusResponse = await fetch('/api/auth/status');
const { authenticated } = await statusResponse.json();

if (authenticated) {
  // eBay API'lerini kullanabilirsiniz
}
```

---

Bu OAuth2 flow ile artık manuel authorization code girmek yerine, tam otomatik eBay entegrasyonu yapabilirsiniz! 🎉
