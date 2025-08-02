# eBay Integration API Documentation

## Genel Bakış

Bu API, eBay marketplace entegrasyonu için geliştirilmiş bir NestJS uygulamasıdır. eBay API v9.2.0 kütüphanesini kullanarak ürün ekleme, fiyat güncelleme, listing yayınlama ve sipariş yönetimi işlemlerini gerçekleştirir.

## Özellikler

- ✅ Inventory item oluşturma
- ✅ Ürün offer'ı oluşturma
- ✅ Listing yayınlama
- ✅ Fiyat güncelleme
- ✅ Listing durumu kontrolü
- ✅ Sipariş listeleme ve detay görüntüleme
- ✅ OAuth2 token yönetimi
- ✅ Swagger API dokümantasyonu
- ✅ Validation ve error handling

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Environment Variables

`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# eBay API Configuration
EBAY_APP_ID=your_ebay_app_id_here
EBAY_CERT_ID=your_ebay_cert_id_here
EBAY_RU_NAME=your_ebay_ru_name_here
EBAY_AUTH_CODE=your_ebay_auth_code_here
EBAY_SANDBOX=true
EBAY_MERCHANT_LOCATION=your_merchant_location_key_here

# Application Configuration
PORT=3000
NODE_ENV=development

# eBay Marketplace Configuration
EBAY_MARKETPLACE_ID=EBAY_US
EBAY_CURRENCY=USD
EBAY_COUNTRY_CODE=US
```

### 3. Uygulamayı Başlatın

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## API Endpoints

### Base URL

- Development: `http://localhost:3000/api`
- Swagger Docs: `http://localhost:3000/api/docs`

### Authentication

Tüm endpoint'ler eBay OAuth2 token authentication kullanır. Token otomatik olarak yenilenir.

## Endpoint'ler

### 1. Inventory Item Oluşturma

**POST** `/api/ebay/inventory`

Inventory item oluşturur. Bu, ürün offer'ı oluşturmadan önce gerekli olan adımdır.

#### Request Body:

```json
{
  "sku": "PRODUCT-001",
  "title": "iPhone 14 Pro Max",
  "description": "Brand new iPhone 14 Pro Max 256GB",
  "brand": "Apple",
  "condition": "NEW",
  "quantity": 10,
  "images": [
    {
      "imageUrl": "https://example.com/image1.jpg"
    }
  ],
  "specifications": [
    {
      "name": "Storage",
      "value": "256GB"
    }
  ],
  "weight": 0.5,
  "dimensions": "6.33 x 3.05 x 0.31 inches"
}
```

#### Response:

```json
{
  "sku": "PRODUCT-001",
  "status": "CREATED",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

### 2. Ürün Offer'ı Oluşturma

**POST** `/api/ebay/products`

Inventory item'dan ürün offer'ı oluşturur.

#### Request Body:

```json
{
  "sku": "PRODUCT-001",
  "title": "iPhone 14 Pro Max",
  "description": "Brand new iPhone 14 Pro Max 256GB",
  "price": 999.99,
  "quantity": 10,
  "brand": "Apple",
  "condition": "NEW",
  "categoryId": "9355"
}
```

#### Response:

```json
{
  "offerId": "12345678901234567890",
  "sku": "PRODUCT-001",
  "marketplaceId": "EBAY_US",
  "status": "CREATED"
}
```

### 3. Listing Yayınlama

**POST** `/api/ebay/products/{offerId}/publish`

Oluşturulan offer'ı eBay'de yayınlar.

#### Parameters:

- `offerId` (path): eBay offer ID

#### Request Body (Optional):

```json
{
  "duration": 7
}
```

#### Response:

```json
{
  "listingId": "listing-123456",
  "offerId": "12345678901234567890",
  "status": "PUBLISHED",
  "ebayItemId": "123456789012",
  "listingUrl": "https://www.ebay.com/itm/123456789012"
}
```

### 4. Fiyat Güncelleme

**PATCH** `/api/ebay/products/{offerId}/price`

Mevcut offer'ın fiyatını günceller.

#### Parameters:

- `offerId` (path): eBay offer ID

#### Request Body:

```json
{
  "price": 899.99
}
```

### 5. Listing Durumu Kontrolü

**GET** `/api/ebay/products/{offerId}/status`

Listing'in mevcut durumunu kontrol eder.

#### Parameters:

- `offerId` (path): eBay offer ID

#### Response:

```json
{
  "listingId": "listing-123456",
  "offerId": "12345678901234567890",
  "status": "ACTIVE",
  "ebayItemId": "123456789012",
  "listingUrl": "https://www.ebay.com/itm/123456789012"
}
```

### 6. Siparişleri Listeleme

**GET** `/api/ebay/orders`

eBay siparişlerini listeler.

#### Query Parameters:

- `limit` (optional): Getirilecek sipariş sayısı (varsayılan: 50)

#### Response:

```json
[
  {
    "orderId": "order-123456",
    "orderStatus": "FULFILLED",
    "creationDate": "2024-01-01T12:00:00.000Z",
    "buyerUsername": "buyer123",
    "totalAmount": 999.99,
    "currency": "USD",
    "itemCount": 1
  }
]
```

### 7. Sipariş Detayı

**GET** `/api/ebay/orders/{orderId}`

Belirli bir siparişin detaylarını getirir.

#### Parameters:

- `orderId` (path): eBay order ID

#### Response:

```json
{
  "orderId": "order-123456",
  "orderStatus": "FULFILLED",
  "creationDate": "2024-01-01T12:00:00.000Z",
  "buyerUsername": "buyer123",
  "totalAmount": 999.99,
  "currency": "USD",
  "itemCount": 1,
  "items": [
    {
      "sku": "PRODUCT-001",
      "title": "iPhone 14 Pro Max",
      "quantity": 1,
      "price": 999.99,
      "total": 999.99
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "stateOrProvince": "NY",
    "postalCode": "10001",
    "countryCode": "US"
  },
  "paymentSummary": {
    "totalDueSeller": 950.0,
    "paymentStatus": "PAID",
    "paymentMethod": "PAYPAL"
  }
}
```

## eBay API Workflow

### Ürün Ekleme Süreci:

1. **Inventory Item Oluştur** → `POST /api/ebay/inventory`
2. **Offer Oluştur** → `POST /api/ebay/products`
3. **Listing Yayınla** → `POST /api/ebay/products/{offerId}/publish`

### Fiyat Güncelleme:

- **Fiyat Güncelle** → `PATCH /api/ebay/products/{offerId}/price`

### Sipariş Yönetimi:

- **Siparişleri Listele** → `GET /api/ebay/orders`
- **Sipariş Detayı** → `GET /api/ebay/orders/{orderId}`

## Ürün Durumları (Condition)

- `NEW`: Yeni
- `LIKE_NEW`: Sıfır gibi
- `NEW_OTHER`: Yeni (diğer)
- `NEW_WITH_DEFECTS`: Kusurlu yeni
- `MANUFACTURER_REFURBISHED`: Üretici yenilenmiş
- `SELLER_REFURBISHED`: Satıcı yenilenmiş
- `USED_EXCELLENT`: İkinci el mükemmel
- `USED_VERY_GOOD`: İkinci el çok iyi
- `USED_GOOD`: İkinci el iyi
- `USED_ACCEPTABLE`: İkinci el kabul edilebilir
- `FOR_PARTS_OR_NOT_WORKING`: Parça veya çalışmıyor

## Error Handling

API, standart HTTP status kodları kullanır:

- `200`: Başarılı
- `201`: Oluşturuldu
- `400`: Geçersiz istek
- `401`: Yetkilendirme hatası
- `404`: Bulunamadı
- `500`: Sunucu hatası

### Error Response Format:

```json
{
  "statusCode": 500,
  "message": "Failed to create product: Invalid category ID",
  "error": "Internal Server Error"
}
```

## Validation

Tüm endpoint'ler input validation kullanır:

- **Required fields**: Zorunlu alanlar kontrol edilir
- **Data types**: Veri tipleri doğrulanır
- **Format validation**: Email, URL gibi formatlar kontrol edilir
- **Range validation**: Sayısal değerler için min/max kontrolleri

## Rate Limiting

eBay API rate limit'lerine uygun olarak:

- Sandbox: Günde 5,000 çağrı
- Production: Günde 100,000 çağrı (plan bazında değişir)

## Güvenlik

- OAuth2 token authentication
- Input validation ve sanitization
- CORS desteği
- Environment variables ile credential yönetimi

## Test Etme

### Swagger UI ile Test:

1. `http://localhost:3000/api/docs` adresine gidin
2. Endpoint'leri test edin
3. Request/Response örneklerini görün

### Postman Collection:

API endpoint'lerini test etmek için Postman collection'ı kullanabilirsiniz.

## Troubleshooting

### Yaygın Hatalar:

1. **Authentication Error**:

   - eBay credentials'larını kontrol edin
   - Auth code'un geçerli olduğundan emin olun

2. **Invalid Category ID**:

   - eBay category ID'lerini doğrulayın
   - Sandbox ve production category ID'leri farklı olabilir

3. **Inventory Item Not Found**:

   - Önce inventory item oluşturun
   - SKU'nun doğru olduğundan emin olun

4. **Listing Failed**:
   - Offer'ın başarıyla oluşturulduğundan emin olun
   - Merchant location key'in doğru olduğunu kontrol edin

## Destek

Herhangi bir sorun yaşarsanız:

1. Log dosyalarını kontrol edin
2. eBay Developer Console'u kontrol edin
3. API dokümantasyonunu gözden geçirin

## Versiyon Geçmişi

- **v1.0.0**: İlk sürüm
  - Temel eBay entegrasyonu
  - CRUD operasyonları
  - Swagger dokümantasyonu
