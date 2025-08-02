# BrandMPN Hatası Kalıcı Çözüm Rehberi

## 🚨 Problem

```json
{
  "message": "Failed to publish listing: A user error has occurred. Input data for tag <BrandMPN> is invalid or missing. Please check API documentation.",
  "error": "Internal Server Error",
  "statusCode": 500
}
```

## ✅ Kalıcı Çözüm

### 1. Gerekli Environment Variables

`.env` dosyasına aşağıdaki policy ID'lerini ekleyin:

```env
# eBay Listing Policies (ZORUNLU)
EBAY_FULFILLMENT_POLICY_ID=your_fulfillment_policy_id_here
EBAY_PAYMENT_POLICY_ID=your_payment_policy_id_here
EBAY_RETURN_POLICY_ID=your_return_policy_id_here
```

### 2. eBay Developer Console'da Policy Oluşturma

#### Adım 1: eBay Developer Console'a Gidin

1. [eBay Developer Console](https://developer.ebay.com/) → My Account
2. Business Policies bölümüne gidin

#### Adım 2: Fulfillment Policy Oluşturun

```
Name: Default Fulfillment Policy
Handling Time: 1 business day
Domestic Shipping:
  - Service: Standard Shipping
  - Cost: $5.99
  - Delivery: 3-5 business days
International Shipping: Disabled (başlangıç için)
```

#### Adım 3: Payment Policy Oluşturun

```
Name: Default Payment Policy
Payment Methods:
  - PayPal
  - Credit/Debit Cards
Immediate Payment: Required
```

#### Adım 4: Return Policy Oluşturun

```
Name: Default Return Policy
Returns Accepted: Yes
Return Period: 30 days
Return Shipping: Buyer pays
Restocking Fee: No
```

### 3. Policy ID'lerini Alma

Her policy oluşturduktan sonra:

1. Policy listesinde policy'ye tıklayın
2. URL'den veya policy detaylarından ID'yi kopyalayın
3. `.env` dosyasına ekleyin

### 4. Güncellenmiş Test Verisi

Artık MPN ile birlikte test edin:

```json
{
  "sku": "IPHONE-14-PRO-256GB",
  "title": "Apple iPhone 14 Pro 256GB - Deep Purple",
  "description": "Brand new Apple iPhone 14 Pro with 256GB storage in Deep Purple color",
  "price": 999.99,
  "quantity": 25,
  "brand": "Apple",
  "mpn": "MPUR3LL/A",
  "condition": "NEW",
  "categoryId": "9355"
}
```

### 5. Tam Test Senaryosu

```bash
# 1. Inventory Item Oluştur
curl -X POST http://localhost:3000/api/ebay/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "IPHONE-14-PRO-256GB",
    "title": "Apple iPhone 14 Pro 256GB - Deep Purple",
    "description": "Brand new Apple iPhone 14 Pro with 256GB storage",
    "brand": "Apple",
    "mpn": "MPUR3LL/A",
    "condition": "NEW",
    "quantity": 25
  }'

# 2. Product Offer Oluştur
curl -X POST http://localhost:3000/api/ebay/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "IPHONE-14-PRO-256GB",
    "title": "Apple iPhone 14 Pro 256GB - Deep Purple",
    "description": "Brand new Apple iPhone 14 Pro with 256GB storage",
    "price": 999.99,
    "quantity": 25,
    "brand": "Apple",
    "mpn": "MPUR3LL/A",
    "condition": "NEW",
    "categoryId": "9355"
  }'

# 3. Listing Yayınla (Artık Çalışacak!)
curl -X POST http://localhost:3000/api/ebay/products/{offerId}/publish \
  -H "Content-Type: application/json" \
  -d '{"duration": 7}'
```

## 🔍 BrandMPN Hatası Nedenleri

### 1. Eksik MPN

- **Çözüm**: Her ürün için geçerli MPN ekleyin
- **Örnek**: iPhone 14 Pro → `MPUR3LL/A`

### 2. Eksik Listing Policies

- **Çözüm**: Fulfillment, Payment, Return policy'leri oluşturun
- **Gerekli**: 3 policy ID'si de zorunlu

### 3. Yanlış Kategori

- **Çözüm**: Doğru eBay kategori ID'si kullanın
- **Telefon**: `9355`, **Laptop**: `111422`

### 4. Brand-MPN Uyumsuzluğu

- **Çözüm**: Brand ve MPN'in gerçek ürünle eşleşmesini sağlayın

## 📋 Gerçek MPN Örnekleri

### Apple Ürünleri:

- iPhone 14 Pro 256GB Deep Purple: `MPUR3LL/A`
- iPhone 14 Pro 128GB Space Black: `MPXV3LL/A`
- MacBook Air M2 256GB Midnight: `MLY33LL/A`
- iPad Pro 12.9" 256GB Space Gray: `MNXR3LL/A`

### Samsung Ürünleri:

- Galaxy S23 Ultra 512GB Phantom Black: `SM-S918UZKAXAA`
- Galaxy S23 256GB Lavender: `SM-S911ULIAXAA`
- Galaxy Tab S8 Ultra 128GB Graphite: `SM-X906UZAAXAR`

### Dell Ürünleri:

- XPS 13 9320 i7 512GB: `XPS9320-7408SLV-PUS`
- Inspiron 15 3000 i5 256GB: `I3511-5178BLK-PUS`

## ⚠️ Önemli Notlar

1. **MPN Zorunlu**: Çoğu kategori için MPN gereklidir
2. **Policy ID'ler**: 3 policy da mutlaka oluşturulmalı
3. **Sandbox vs Production**: Policy ID'ler farklı olabilir
4. **Kategori Kontrolü**: Her kategori farklı gereksinimler olabilir

## 🛠️ Troubleshooting

### Hata: "Invalid fulfillment policy"

```bash
# Policy ID'lerini kontrol edin
curl -X GET http://localhost:3000/api/auth/status
```

### Hata: "Category requires additional aspects"

```bash
# Kategori gereksinimlerini kontrol edin
# Bazı kategoriler ek özellikler gerektirir
```

### Hata: "MPN does not match brand"

```bash
# Brand ve MPN'in gerçek ürünle eşleştiğinden emin olun
# Örnek: Apple brand için Samsung MPN kullanmayın
```

## 🎯 Başarı Kriterleri

✅ **Inventory Item**: Brand + MPN ile oluşturuldu  
✅ **Product Offer**: Listing policies ile oluşturuldu  
✅ **Publish**: BrandMPN hatası almadan yayınlandı

Bu adımları takip ederseniz BrandMPN hatası kalıcı olarak çözülecektir! 🚀
