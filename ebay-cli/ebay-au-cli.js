#!/usr/bin/env node
/**
 * eBay AU – idempotent product push
 * node ebay-au-cli.js push-product --token TOKEN --sku SKU --title TITLE --price 99.99
 */
import axios from 'axios';
import chalk from 'chalk';
import { program } from 'commander';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
const fsPromises = fs.promises;

const CONFIG = {
  sandbox: 'https://api.sandbox.ebay.com',
  production: 'https://api.ebay.com',
  mkt: 'EBAY_AU',
  currency: 'AUD',
  defaultCat: '4733', // Coins: Ancient
  locKey: 'AU_LOCATION', // ensure this location exists once
};

/* ---------- logger ---------- */
const log = {
  i: (m) => console.log(chalk.blue(`[INFO]  ${new Date().toISOString()} – ${m}`)),
  o: (m) => console.log(chalk.green(`[OK]    ${new Date().toISOString()} – ${m}`)),
  e: (m, err) => { console.error(chalk.red(`[ERROR] ${new Date().toISOString()} – ${m}`)); err && console.error(chalk.red(err.message || err)); },
  d: (m) => { if (process.env.DEBUG) console.log(chalk.gray(`[DEBUG] ${m}`)); }
};

/* ---------- client ---------- */
class Client {
  constructor(token, env = 'sandbox') {
    this.token = token;
    this.base = CONFIG[env];
  }
  async call(method, endpoint, data = null) {
    const url = `${this.base}${endpoint}`;
    const cfg = {
      method, url,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Language': 'en-AU',
        'X-EBAY-C-MARKETPLACE-ID': CONFIG.mkt,
      },
      data
    };
    log.d(`${method} ${endpoint}`);
    try {
      const r = await axios(cfg);
      return r.data;
    } catch (e) {
      if (e.response?.data) log.e(`eBay ${e.response.status}`, JSON.stringify(e.response.data));
      throw e;
    }
  }
}

/* ---------- policy ---------- */
async function ensurePolicies(client) {
  log.i('Policy’ler kontrol ediliyor…');
  const f = await getPolicies(client, 'fulfillment');
  const p = await getPolicies(client, 'payment');
  const r = await getPolicies(client, 'return');
  return {
    fulfillmentPolicyId: f.length ? await updatePolicy(client, 'fulfillment', f[0]) : await createPolicy(client, 'fulfillment'),
    paymentPolicyId: p.length ? await updatePolicy(client, 'payment', p[0]) : await createPolicy(client, 'payment'),
    returnPolicyId: r.length ? await updatePolicy(client, 'return', r[0]) : await createPolicy(client, 'return'),
  };
}
async function getPolicies(client, type) {
  const r = await client.call('GET', `/sell/account/v1/${type}_policy?marketplace_id=${CONFIG.mkt}`);
  return r[`${type}Policies`] || [];
}
async function createPolicy(client, type) {
  log.i(`${type} policy oluşturuluyor…`);
  const body = templates[type]();
  const r = await client.call('POST', `/sell/account/v1/${type}_policy`, body);
  log.o(`${type} policy → ${r[`${type}PolicyId`]}`);
  return r[`${type}PolicyId`];
}
async function updatePolicy(client, type, existing) {
  log.i(`${type} policy güncelleniyor…`);
  const id = existing[`${type}PolicyId`];
  const body = templates[type]();
  await client.call('PUT', `/sell/account/v1/${type}_policy/${id}`, body);
  log.o(`${type} policy güncellendi → ${id}`);
  return id;
}
const templates = {
  fulfillment: () => ({
    name: `Std-AU-${Date.now()}`, marketplaceId: CONFIG.mkt,
    categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES', default: true }],
    handlingTime: { value: 1, unit: 'DAY' },
    shipToLocations: { regionIncluded: [{ regionType: 'COUNTRY', regionName: 'AU' }] },
    shippingServices: [{ sortOrder: 1, shippingServiceCode: 'AU_StandardDeliveryFromOutsideAU', type: 'SHIPPING', freeShipping: true }]
  }),
  payment: () => ({
    name: `Pay-AU-${Date.now()}`, marketplaceId: CONFIG.mkt,
    categoryTypes: [{ name: 'ALL_EXCLUDING_MOTORS_VEHICLES', default: true }],
    paymentMethods: [{ paymentMethodType: 'CREDIT_CARD', brands: ['VISA', 'MASTERCARD'] }],
    immediatePay: false
  }),
  return: () => ({
    name: `Ret-AU-${Date.now()}`, marketplaceId: CONFIG.mkt,
    refundMethod: 'MONEY_BACK', returnsAccepted: true,
    returnPeriod: { value: 30, unit: 'DAY' },
    returnShippingCostPayer: 'SELLER'
  })
};

/* ---------- inventory ---------- */
async function ensureInventory(client, sku, data) {
  log.i(`Inventory item kontrol → ${sku}`);
  const body = {
    locale: "en_AU",
    condition: "NEW",
    availability: { shipToLocationAvailability: { quantity: data.quantity || 1 } },
    product: {
      title: data.title,
      description: data.description,
      aspects: data.aspects || { Era: ["Ancient"], Material: ["Gold"] },
      imageUrls: data.images?.length ? data.images : [`https://example.com/img/${sku}.jpg`]
    },
    packageWeightAndSize: {
      weight: { value: data.weight || 0.1, unit: "KILOGRAM" },
      dimensions: { length: data.dimensions?.length || 10, width: data.dimensions?.width || 10, height: data.dimensions?.height || 5, unit: "CENTIMETER" }
    }
  };
  await client.call('PUT', `/sell/inventory/v1/inventory_item/${sku}`, body);
  log.o(`Inventory item ensure → ${sku}`);
  return sku;
}

/* ---------- offer ---------- */
async function ensureOffer(client, sku, price, quantity, policyIds) {
  const offers = await client.call('GET', `/sell/inventory/v1/offer?sku=${sku}`);
  const exist = (offers.offers || []).find(o => o.status !== 'WITHDRAWN');
  const body = {
    sku, marketplaceId: CONFIG.mkt, format: "FIXED_PRICE",
    categoryId: CONFIG.defaultCat,
    listingDescription: `Buy ${sku} now!`,
    availableQuantity: quantity,
    listingPolicies: policyIds,
    pricingSummary: { price: { value: price.toString(), currency: CONFIG.currency } },
    merchantLocationKey: CONFIG.locKey
  };
  if (exist) {
    log.i(`Offer güncelleniyor → ${exist.offerId}`);
    await client.call('PUT', `/sell/inventory/v1/offer/${exist.offerId}`, body);
    return exist.offerId;
  } else {
    log.i('Offer oluşturuluyor…');
    const r = await client.call('POST', '/sell/inventory/v1/offer', body);
    log.o(`Offer → ${r.offerId}`);
    return r.offerId;
  }
}

/* ---------- publish ---------- */
async function ensurePublish(client, offerId) {
  const o = await client.call('GET', `/sell/inventory/v1/offer/${offerId}`);
  if (o.status === 'PUBLISHED') {
    // {"offerId":"9543031010","sku":"aaa-123","marketplaceId":"EBAY_AU","format":"FIXED_PRICE","listingDescription":"Buy aaa-123 now!","availableQuantity":1,"pricingSummary":{"price":{"value":"149.99","currency":"AUD"}},"listingPolicies":{"paymentPolicyId":"6210947000","returnPolicyId":"6210948000","fulfillmentPolicyId":"6210946000","eBayPlusIfEligible":false},"categoryId":"4733","merchantLocationKey":"AU_LOCATION","tax":{"applyTax":false},"listing":{"listingId":"110588421488","listingStatus":"ACTIVE","soldQuantity":0},"status":"PUBLISHED","listingDuration":"GTC","includeCatalogProductDetails":true,"hideBuyerDetails":false}
    log.o(JSON.stringify(o));
    log.o(`Offer zaten yayında → listingId = ${o.listing.listingId}`);
    return o.listing.listingId;
  }
  log.i('Offer publish ediliyor…');
  const r = await client.call('POST', `/sell/inventory/v1/offer/${offerId}/publish`);
  log.o(`Publish tamam → listingId = ${r.listingId}`);
  return r.listingId;
}

/* ---------- main ---------- */
/* ---------- idempotent product push ---------- */
async function pushProduct(opts) {
  const { token, env = 'sandbox', sku, title, description, price, quantity = 1, weight, dimensions, images } = opts;
  const client = new Client(token, env);

  try {
    /* 1. Policies (create or update) */
    const policyIds = await ensurePolicies(client);

    /* 2. Inventory Item (PUT → create or replace) */
    await ensureInventory(client, sku, { title, description, quantity, weight, dimensions, images });

    /* 3. Offer (create or update) */
    const offerId = await ensureOffer(client, sku, price, quantity, policyIds);

    /* 4. Publish (if not published yet) */
    const listingId = await ensurePublish(client, offerId);

    /* 5. Save result */
    const result = { sku, offerId, listingId, url: `https://www.ebay.com.au/itm/${listingId}` };
    await fsPromises.writeFile(`push-${sku}-${Date.now()}.json`, JSON.stringify(result, null, 2));
    log.o(`Push tamam → ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    log.e('Push başarısız', err);
    throw err; // CLI exit 1
  }
}
program
  .name('ebay-au-cli')
  .description('eBay AU – idempotent product push')
  .version('1.0.0');
program
  .command('push-product')
  .description('Idempotent eBay AU product push (policy → inventory → offer → publish)')
  .requiredOption('--token <token>', 'eBay access token')
  .requiredOption('--sku <sku>', 'Unique SKU')
  .requiredOption('--title <title>', 'Product title')
  .requiredOption('--description <description>', 'Product description')
  .requiredOption('--price <price>', 'Price (AUD)', parseFloat)
  .option('--quantity <q>', 'Available quantity', (v) => parseInt(v, 10), 1)
  .option('--weight <kg>', 'Weight in kg', parseFloat)
  .option('--length <cm>', 'Length in cm', parseFloat)
  .option('--width <cm>', 'Width in cm', parseFloat)
  .option('--height <cm>', 'Height in cm', parseFloat)
  .option('--images <urls...>', 'Product image URLs')
  .option('--env <env>', 'sandbox or production', 'sandbox')
  .hook('preAction', async (thisCommand) => {
    const opts = thisCommand.opts();
    // erken validasyon
    if (opts.price <= 0) throw new Error('--price must be positive');
    if (opts.quantity <= 0) throw new Error('--quantity must be positive');
    if ([opts.length, opts.width, opts.height].some(Number.isFinite) &&
      ![opts.length, opts.width, opts.height].every(Number.isFinite)) {
      throw new Error('--length --width --height must be given together');
    }
  })
  .action(async (opts) => {
    try {
      await pushProduct({
        token: opts.token,
        sku: opts.sku,
        title: opts.title,
        description: opts.description,
        price: opts.price,
        quantity: opts.quantity,
        weight: opts.weight,
        dimensions: opts.length && opts.width && opts.height
          ? { length: opts.length, width: opts.width, height: opts.height }
          : null,
        images: opts.images || [],
        env: opts.env,
      });
    } catch (err) {
      log.e('CLI failed', err);
      process.exit(1);
    }
  });

program.parse();