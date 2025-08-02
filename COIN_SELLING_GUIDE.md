# eBay Coin Satış Rehberi

## 🪙 Coin Satışı için Özel Özellikler

### 1. **Otomatik Kategori Belirleme**

- **categoryId artık opsiyonel** - Sistem otomatik belirler
- **Coin anahtar kelimeleri**: bitcoin, ethereum, dogecoin, crypto, coin, sikke, para
- **Otomatik kategori**: `11116` (Coins & Paper Money > Coins > World)

### 2. **Coin Örnekleri**

#### Bitcoin Gold Commemorative Coin:

```json
{
  "sku": "BITCOIN-GOLD-COIN-2024",
  "title": "Bitcoin Gold Commemorative Coin 2024 - Physical Cryptocurrency Collectible",
  "description": "Beautiful gold-plated Bitcoin commemorative coin featuring the iconic Bitcoin logo. Perfect for cryptocurrency enthusiasts and collectors.",
  "price": 29.99,
  "quantity": 50,
  "brand": "CryptoCoin",
  "mpn": "BTC-GOLD-2024",
  "condition": "NEW"
}
```

#### Ethereum Silver Coin:

```json
{
  "sku": "ETHEREUM-SILVER-COIN-2024",
  "title": "Ethereum Silver Commemorative Coin - ETH Cryptocurrency Collectible",
  "description": "Premium silver-plated Ethereum commemorative coin with detailed ETH logo and blockchain design.",
  "price": 24.99,
  "quantity": 75,
  "brand": "CryptoCoin",
  "mpn": "ETH-SILVER-2024",
  "condition": "NEW"
}
```

#### Dogecoin Bronze Coin:

```json
{
  "sku": "DOGECOIN-BRONZE-COIN-2024",
  "title": "Dogecoin Bronze Commemorative Coin - DOGE Meme Cryptocurrency",
  "description": "Fun and collectible Dogecoin bronze coin featuring the famous Shiba Inu dog. Much wow, very coin!",
  "price": 19.99,
  "quantity": 100,
  "brand": "MemeCoin",
  "mpn": "DOGE-BRONZE-2024",
  "condition": "NEW"
}
```

## 🚀 Coin Satış Test Senaryosu

### Adım 1: Inventory Item Oluştur

```bash
curl -X POST http://localhost:3000/api/ebay/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "BITCOIN-GOLD-COIN-2024",
    "title": "Bitcoin Gold Commemorative Coin 2024 - Physical Cryptocurrency Collectible",
    "description": "Beautiful gold-plated Bitcoin commemorative coin featuring the iconic Bitcoin logo. Perfect for cryptocurrency enthusiasts and collectors.",
    "brand": "CryptoCoin",
    "mpn": "BTC-GOLD-2024",
    "condition": "NEW",
    "quantity": 50,
    "specifications": [
      {
        "name": "Material",
        "value": "Gold Plated Metal"
      },
      {
        "name": "Diameter",
        "value": "40mm"
      },
      {
        "name": "Year",
        "value": "2024"
      }
    ],
    "weight": 0.1
  }'
```

### Adım 2: Product Offer Oluştur (CategoryId YOK!)

```bash
curl -X POST http://localhost:3000/api/ebay/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "BITCOIN-GOLD-COIN-2024",
    "title": "Bitcoin Gold Commemorative Coin 2024 - Physical Cryptocurrency Collectible",
    "description": "Beautiful gold-plated Bitcoin commemorative coin featuring the iconic Bitcoin logo. Perfect for cryptocurrency enthusiasts and collectors.",
    "price": 29.99,
    "quantity": 50,
    "brand": "CryptoCoin",
    "mpn": "BTC-GOLD-2024",
    "condition": "NEW"
  }'
```

**Not**: `categoryId` belirtmediniz - sistem otomatik olarak `11116` (Coins) kategorisini seçecek!

### Adım 3: Listing Yayınla

```bash
curl -X POST http://localhost:3000/api/ebay/products/{offerId}/publish \
  -H "Content-Type: application/json" \
  -d '{"duration": 7}'
```

## 🎯 Otomatik Kategori Sistemi

### Sistem Nasıl Çalışır:

```typescript
// Title ve description'da anahtar kelime arar
if (
  content.includes('coin') ||
  content.includes('bitcoin') ||
  content.includes('crypto')
) {
  return '11116'; // Coins & Paper Money > Coins > World
}
```

### Desteklenen Anahtar Kelimeler:

- **coin, para, sikke**
- **bitcoin, ethereum, dogecoin**
- **crypto, cryptocurrency**
- **phone, telefon** → `9355` (Cell Phones)
- **laptop, computer** → `111422` (Laptops)
- **watch, saat** → `178893` (Smart Watches)

## 📋 Coin Kategorileri

| Kategori        | ID      | Açıklama                    |
| --------------- | ------- | --------------------------- |
| Coins > World   | `11116` | Dünya paraları (varsayılan) |
| Coins > US      | `11111` | ABD paraları                |
| Paper Money     | `3395`  | Kağıt para                  |
| Bullion         | `39482` | Külçe altın/gümüş           |
| Everything Else | `99`    | Diğer (fallback)            |

## 🔧 Coin Satışı İpuçları

### 1. **Başlık Optimizasyonu**:

```
✅ "Bitcoin Gold Commemorative Coin 2024 - Physical Cryptocurrency Collectible"
❌ "Güzel coin satılık"
```

### 2. **Açıklama İpuçları**:

- Material belirtin (Gold plated, Silver plated)
- Boyut bilgisi ekleyin (40mm diameter)
- Koleksiyonculara hitap edin
- "commemorative", "collectible" kelimelerini kullanın

### 3. **MPN Örnekleri**:

- Bitcoin: `BTC-GOLD-2024`, `BTC-SILVER-2024`
- Ethereum: `ETH-SILVER-2024`, `ETH-BRONZE-2024`
- Dogecoin: `DOGE-BRONZE-2024`, `DOGE-COPPER-2024`

### 4. **Fiyatlandırma**:

- **Gold plated**: $25-35
- **Silver plated**: $20-30
- **Bronze/Copper**: $15-25
- **Set (3'lü)**: $60-80

## 🎁 Coin Set Örneği

```json
{
  "sku": "CRYPTO-SET-2024",
  "title": "Cryptocurrency Coin Set 2024 - Bitcoin, Ethereum, Dogecoin Collection",
  "description": "Complete set of 3 cryptocurrency commemorative coins including Bitcoin (gold), Ethereum (silver), and Dogecoin (bronze). Perfect starter collection for crypto enthusiasts.",
  "price": 69.99,
  "quantity": 25,
  "brand": "CryptoCoin",
  "mpn": "CRYPTO-SET-2024",
  "condition": "NEW"
}
```

## ⚠️ Önemli Notlar

1. **Gerçek Cryptocurrency Değil**: Açıklamada "commemorative" ve "collectible" vurgulayın
2. **Material Belirtin**: Gold/Silver/Bronze plated olduğunu açıkça yazın
3. **Boyut Bilgisi**: Diameter ve thickness bilgilerini ekleyin
4. **Hediye Potansiyeli**: "Perfect gift for crypto enthusiasts" gibi ifadeler kullanın

## 🚀 Hızlı Test

```bash
# Tek komutla coin satışı (categoryId YOK!)
curl -X POST http://localhost:3000/api/ebay/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "MY-BITCOIN-COIN",
    "title": "Bitcoin Commemorative Coin - Gold Plated Cryptocurrency Collectible",
    "description": "Beautiful Bitcoin coin for collectors and crypto enthusiasts",
    "price": 29.99,
    "quantity": 10,
    "brand": "CryptoCoin",
    "mpn": "BTC-2024",
    "condition": "NEW"
  }'
```

**Sistem otomatik olarak coin kategorisini seçecek!** 🪙✨
