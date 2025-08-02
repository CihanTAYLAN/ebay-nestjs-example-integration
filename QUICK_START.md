# eBay Integration API - Quick Start Guide

Bu rehber, eBay Integration API'sini hızlıca çalıştırmanız ve test etmeniz için hazırlanmıştır.

## 🚀 Hızlı Başlangıç

### 1. Projeyi Çalıştırın

```bash
# Bağımlılıkları yükleyin
npm install

# Environment dosyasını oluşturun
cp .env.example .env

# Uygulamayı başlatın
npm run start:dev
```

### 2. Swagger UI'ya Erişin

Tarayıcınızda şu adresi açın:

```
http://localhost:3000/api/docs
```

## 🧪 Test Senaryoları

### Senaryo 1: Temel Ürün Ekleme

#### Adım 1: Inventory Item Oluşturun

**POST** `http://localhost:3000/api/ebay/inventory`

```json
{
  "sku": "IPHONE-14-PRO-256GB",
  "title": "Apple iPhone 14 Pro 256GB - Deep Purple",
  "description": "Brand new Apple iPhone 14 Pro with 256GB storage in Deep Purple color.",
  "brand": "Apple",
  "condition": "NEW",
  "quantity": 25,
  "images": [
    {
      "imageUrl": "https://example.com/iphone14pro-front.jpg"
    }
  ],
  "weight": 0.45,
  "dimensions": "5.81 x 2.81 x 0.31 inches"
}
```

**Beklenen Response:**

```json
{
  "sku": "IPHONE-14-PRO-256GB",
  "status": "CREATED",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

#### Adım 2: Product Offer Oluşturun

**POST** `http://localhost:3000/api/ebay/products`

```json
{
  "sku": "IPHONE-14-PRO-256GB",
  "title": "Apple iPhone 14 Pro 256GB - Deep Purple",
  "description": "Brand new Apple iPhone 14 Pro with 256GB storage in Deep Purple color.",
  "price": 999.99,
  "quantity": 25,
  "brand": "Apple",
  "condition": "NEW",
  "categoryId": "9355"
}
```

**Beklenen Response:**

```json
{
  "offerId": "12345678901234567890",
  "sku": "IPHONE-14-PRO-256GB",
  "marketplaceId": "EBAY_US",
  "status": "CREATED"
}
```

#### Adım 3: Listing'i Yayınlayın

**POST** `http://localhost:3000/api/ebay/products/12345678901234567890/publish`

```json
{
  "duration": 7
}
```

**Beklenen Response:**

```json
{
  "listingId": "listing-123456",
  "offerId": "12345678901234567890",
  "status": "PUBLISHED",
  "ebayItemId": "123456789012",
  "listingUrl": "https://www.ebay.com/itm/123456789012"
}
```

### Senaryo 2: Fiyat Güncelleme

**PATCH** `http://localhost:3000/api/ebay/products/12345678901234567890/price`

```json
{
  "price": 949.99
}
```

### Senaryo 3: Listing Durumu Kontrolü

**GET** `http://localhost:3000/api/ebay/products/12345678901234567890/status`

**Beklenen Response:**

```json
{
  "listingId": "listing-123456",
  "offerId": "12345678901234567890",
  "status": "ACTIVE",
  "ebayItemId": "123456789012",
  "listingUrl": "https://www.ebay.com/itm/123456789012"
}
```

### Senaryo 4: Sipariş Yönetimi

#### Siparişleri Listeleyin

**GET** `http://localhost:3000/api/ebay/orders?limit=10`

#### Sipariş Detayını Görüntüleyin

**GET** `http://localhost:3000/api/ebay/orders/{orderId}`

## 🔧 Curl Komutları

### Inventory Item Oluşturma

```bash
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

### Product Offer Oluşturma

```bash
curl -X POST http://localhost:3000/api/ebay/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TEST-001",
    "title": "Test Product",
    "description": "Test description",
    "price": 99.99,
    "quantity": 10,
    "brand": "TestBrand",
    "condition": "NEW",
    "categoryId": "9355"
  }'
```

### Listing Yayınlama

```bash
curl -X POST http://localhost:3000/api/ebay/products/{offerId}/publish \
  -H "Content-Type: application/json" \
  -d '{"duration": 7}'
```

## 📋 Gerekli eBay Credentials

`.env` dosyasında aşağıdaki değerleri doldurun:

```env
EBAY_APP_ID=your_app_id_here
EBAY_CERT_ID=your_cert_id_here
EBAY_RU_NAME=your_ru_name_here
EBAY_AUTH_CODE=your_auth_code_here
EBAY_SANDBOX=true
EBAY_MERCHANT_LOCATION=your_location_key_here
```

### eBay Credentials Nasıl Alınır?

1. [eBay Developers Program](https://developer.ebay.com/)'a kaydolun
2. Yeni bir uygulama oluşturun
3. Sandbox credentials'larını alın
4. OAuth2 authorization code'unu generate edin

## 🔍 Debug ve Troubleshooting

### Logları Kontrol Edin

```bash
# Console loglarını takip edin
npm run start:dev

# Detaylı debug için
DEBUG=* npm run start:dev
```

### Yaygın Hatalar

1. **401 Unauthorized**

   - eBay credentials'larını kontrol edin
   - Auth code'un expire olmadığından emin olun

2. **400 Bad Request**

   - Request body'yi kontrol edin
   - Required field'ların dolu olduğundan emin olun

3. **500 Internal Server Error**
   - Server loglarını kontrol edin
   - eBay API response'unu inceleyin

## 📊 Test Verileri

[`test-examples/sample-data.json`](./test-examples/sample-data.json) dosyasında hazır test verileri bulabilirsiniz:

- iPhone 14 Pro örneği
- Samsung Galaxy S23 Ultra örneği
- MacBook Air M2 örneği
- Çeşitli kategori ID'leri
- Test senaryoları

## 🎯 Sonraki Adımlar

1. **Production'a Geçiş**:

   - `EBAY_SANDBOX=false` yapın
   - Production credentials'larını kullanın

2. **Monitoring**:

   - Log monitoring ekleyin
   - Error tracking implementasyonu

3. **Scaling**:
   - Rate limiting ekleyin
   - Caching mekanizması
   - Database entegrasyonu

## 📞 Destek

Sorun yaşarsanız:

1. [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) dosyasını inceleyin
2. Swagger UI'da endpoint'leri test edin
3. Console loglarını kontrol edin
4. eBay Developer Console'u kontrol edin

---

**İyi testler! 🚀**
