# eBay AU Sandbox CLI Guide

## Overview
This guide provides comprehensive instructions for using the eBay AU Sandbox CLI script to create complete eBay listings with policies, inventory items, offers, and publishing.

## Quick Start

### 1. Installation
```bash
# Install dependencies
npm install axios chalk commander dotenv

# Or use the provided package.json
npm install
```

### 2. Get Access Token
```bash
# Use the existing OAuth flow or obtain token via:
# https://auth.sandbox.ebay.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&scope=https://api.ebay.com/oauth/api_scope/sell.inventory
```

## Usage Examples

### Complete Listing Creation
```bash
# Using access token directly
node ebay-au-cli.js push-product \
  --token YOUR_ACCESS_TOKEN \
  --sku "COIN-ANCIENT-GOLD-001" \
  --title "Ancient Gold Coin - Sealed Authentic" \
  --description "Authentic ancient gold coin from the Roman Empire era. Comes with certificate of authenticity. Sealed in protective casing." \
  --price 149.99 \
  --quantity 1 \
  --weight 0.1 \
  --length 10 \
  --width 10 \
  --height 5 \
  --images "https://example.com/img/coin-front.jpg" "https://example.com/img/coin-back.jpg"
```

## API Endpoints Used

### 1. Policy Creation
- **Fulfillment Policy**: `POST /sell/account/v1/fulfillment_policy`
- **Payment Policy**: `POST /sell/account/v1/payment_policy`
- **Return Policy**: `POST /sell/account/v1/return_policy`

### 2. Inventory Management
- **Create Inventory Item**: `PUT /sell/inventory/v1/inventory_item/{sku}`
- **Get Inventory Items**: `GET /sell/inventory/v1/inventory_item`

### 3. Offer Management
- **Create Offer**: `POST /sell/inventory/v1/offer`
- **Get Offer**: `GET /sell/inventory/v1/offer/{offerId}`
- **Publish Offer**: `POST /sell/inventory/v1/offer/{offerId}/publish`

## JSON Schema Examples

### Fulfillment Policy
```json
{
  "name": "Std-AU-1725620975321",
  "marketplaceId": "EBAY_AU",
  "categoryTypes": [
    {
      "name": "ALL_EXCLUDING_MOTORS_VEHICLES",
      "default": true
    }
  ],
  "handlingTime": {
    "value": 1,
    "unit": "DAY"
  },
  "shipToLocations": {
    "regionIncluded": [
      {
        "regionType": "COUNTRY",
        "regionName": "AU"
      }
    ]
  },
  "shippingServices": [
    {
      "sortOrder": 1,
      "shippingServiceCode": "AU_StandardDeliveryFromOutsideAU",
      "type": "SHIPPING",
      "freeShipping": true
    }
  ]
}
```

### Payment Policy
```json
{
  "name": "Pay-AU-1725620975321",
  "marketplaceId": "EBAY_AU",
  "categoryTypes": [
    {
      "name": "ALL_EXCLUDING_MOTORS_VEHICLES",
      "default": true
    }
  ],
  "paymentMethods": [
    {
      "paymentMethodType": "CREDIT_CARD",
      "brands": ["VISA", "MASTERCARD"]
    }
  ],
  "immediatePay": false
}
```

### Return Policy
```json
{
  "name": "Ret-AU-1725620975321",
  "marketplaceId": "EBAY_AU",
  "refundMethod": "MONEY_BACK",
  "returnsAccepted": true,
  "returnPeriod": {
    "value": 30,
    "unit": "DAY"
  },
  "returnShippingCostPayer": "SELLER"
}
```

### Inventory Item
```json
{
  "locale": "en_AU",
  "condition": "NEW",
  "availability": {
    "shipToLocationAvailability": {
      "quantity": 1
    }
  },
  "product": {
    "title": "Ancient Gold Coin - Sealed Authentic",
    "description": "Authentic ancient gold coin from the Roman Empire era. Comes with certificate of authenticity. Sealed in protective casing.",
    "aspects": {
      "Era": ["Ancient"],
      "Material": ["Gold"]
    },
    "imageUrls": [
      "https://example.com/img/coin-front.jpg",
      "https://example.com/img/coin-back.jpg"
    ]
  },
  "packageWeightAndSize": {
    "weight": {
      "value": 0.1,
      "unit": "KILOGRAM"
    },
    "dimensions": {
      "length": 10,
      "width": 10,
      "height": 5,
      "unit": "CENTIMETER"
    }
  }
}
```

### Offer Creation
```json
{
  "sku": "COIN-ANCIENT-GOLD-001",
  "marketplaceId": "EBAY_AU",
  "format": "FIXED_PRICE",
  "categoryId": "4733",
  "listingDescription": "Buy COIN-ANCIENT-GOLD-001 now!",
  "availableQuantity": 1,
  "listingPolicies": {
    "fulfillmentPolicyId": "1234567890",
    "paymentPolicyId": "1234567891",
    "returnPolicyId": "1234567892"
  },
  "pricingSummary": {
    "price": {
      "value": "149.99",
      "currency": "AUD"
    }
  },
  "merchantLocationKey": "AU_LOCATION"
}
```

## Error Handling

### Common Error Codes
- `20400`: Policy already exists
- `120002`: Invalid SKU format
- `120003`: SKU already exists
- `120012`: Invalid price format
- `25002`: Invalid marketplace ID

### Error Response Format
```json
{
  "errors": [
    {
      "errorId": 20400,
      "domain": "API_ACCOUNT",
      "subdomain": "Account",
      "category": "REQUEST",
      "message": "A user error has occurred. A policy with this name already exists.",
      "parameters": [
        {
          "name": "policyName",
          "value": "Std-AU-1725620975321"
        }
      ]
    }
  ]
}
```

## Best Practices

### 1. SKU Generation
- Use consistent format: `{CATEGORY}-{ERA}-{MATERIAL}-{ID}`
- Example: `COIN-ANCIENT-GOLD-001`

### 2. Image Requirements
- Minimum 500x500 pixels
- Maximum 7MB per image
- JPEG, PNG, GIF, TIFF formats
- Use high-quality product images

### 3. Pricing Strategy
- Research competitor pricing
- Consider eBay fees (typically 10.9% for collectibles)
- Factor in shipping costs
- Use psychological pricing (e.g., $149.99 instead of $150)

### 4. Category Selection
- Default category is Coins & Paper Money (Ancient): 4733
- Popular AU categories:
  - Coins & Paper Money (Ancient): 4733
  - Coins & Paper Money (World): 11116

### 5. Description Optimization
- Use bullet points for specifications
- Include all relevant keywords
- Mention authenticity and any certificates
- Add shipping information

## Testing Checklist

- [ ] Access token is valid and not expired
- [ ] SKU is unique for each product
- [ ] Images are accessible via URL
- [ ] Price is in AUD currency
- [ ] Policies are created successfully
- [ ] Inventory item is created without errors
- [ ] Offer is created and published
- [ ] Listing appears in eBay search results

## Troubleshooting

### Issue: "Invalid access token"
**Solution**: Refresh your access token using the OAuth flow

### Issue: "Policy already exists"
**Solution**: The CLI will automatically update existing policies

### Issue: "SKU already exists"
**Solution**: The CLI will automatically update existing inventory items

### Issue: "Images not accessible"
**Solution**: Ensure image URLs are publicly accessible and use HTTPS

## Advanced Features

### Batch Processing
```javascript
// Example for processing multiple products
const products = [
  { sku: 'COIN-001', title: 'Ancient Roman Coin', price: 149.99 },
  { sku: 'COIN-002', title: 'Ancient Greek Coin', price: 199.99 }
];

for (const product of products) {
  await pushProduct(product);
}
```

## Support and Resources

- [eBay Developer Documentation](https://developer.ebay.com/api-docs/sell/inventory/static/overview.html)
- [eBay AU Marketplace Guide](https://www.ebay.com.au/sell)
- [eBay API Explorer](https://developer.ebay.com/my/api_test_tool)
- [eBay Developer Forums](https://forums.developer.ebay.com)