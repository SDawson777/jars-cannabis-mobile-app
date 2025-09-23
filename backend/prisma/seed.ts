import { PrismaClient, ContentType, ProductCategory, StrainType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
// Stores
const s1 = await prisma.store.upsert({
where: { slug: 'scottsdale' },
update: {},
create: {
name: 'JARS Scottsdale',
slug: 'scottsdale',
city: 'Scottsdale',
state: 'AZ',
latitude: 33.4942,
longitude: -111.9261,
hours: { mon: [{ open: '09:00', close: '21:00' }], tue: [{ open: '09:00', close: '21:00' }] },
},
});

const s2 = await prisma.store.upsert({
where: { slug: 'detroit' },
update: {},
create: {
name: 'JARS Detroit',
slug: 'detroit',
city: 'Detroit',
state: 'MI',
latitude: 42.3314,
longitude: -83.0458,
hours: { mon: [{ open: '09:00', close: '21:00' }] },
},
});

// Products + variants
const p1 = await prisma.product.upsert({
where: { slug: 'blue-dream-eighth' },
update: {},
create: {
name: 'Blue Dream',
slug: 'blue-dream-eighth',
brand: 'House',
category: ProductCategory.Flower,
strainType: StrainType.Sativa,
defaultPrice: 30,
thcPercent: 22.5,
variants: {
create: [
{ name: '3.5g', sku: 'BD-35', price: 30 },
{ name: '7g', sku: 'BD-7', price: 55 },
],
},
},
});

const v1 = await prisma.productVariant.findFirstOrThrow({ where: { productId: p1.id, name: '3.5g' } });

await prisma.storeProduct.upsert({
where: { storeId_productId_variantId: { storeId: s1.id, productId: p1.id, variantId: v1.id } },
update: { price: 28, stock: 100 },
create: { storeId: s1.id, productId: p1.id, variantId: v1.id, price: 28, stock: 100 },
});

// Content
await prisma.contentPage.upsert({
where: { type_locale_slug: { type: ContentType.legal, locale: 'en-US', slug: 'privacy' } },
update: { title: 'Privacy Policy', body: 'Our privacy policy...' },
create: { type: ContentType.legal, locale: 'en-US', slug: 'privacy', title: 'Privacy Policy', body: 'Our privacy policy...' },
});

await prisma.contentPage.upsert({
where: { type_locale_slug: { type: ContentType.faq, locale: 'en-US', slug: 'general' } },
update: { title: 'FAQ', body: 'Frequently asked questions...' },
create: { type: ContentType.faq, locale: 'en-US', slug: 'general', title: 'FAQ', body: 'Frequently asked questions...' },
});

  if (process.env.DEBUG === 'true') {
    console.debug('Seed done');
  }
}

main().finally(() => prisma.$disconnect());

// Add sample addresses for existing demo users if present
async function seedAddresses() {
  try {
    const users = await prisma.user.findMany({ take: 2 });
    for (const u of users) {
      await prisma.address.upsert({
        where: { id: `addr-${u.id}` },
        update: {},
        create: {
          id: `addr-${u.id}`,
          userId: u.id,
          fullName: u.name || 'Demo User',
          phone: u.phone || '555-555-5555',
          line1: '123 Demo St',
          line2: null,
          city: 'Demo City',
          state: 'CA',
          zipCode: '90001',
          country: 'US',
          isDefault: true,
        },
      });
    }
  } catch (e) {
    // ignore if users table isn't present in demo/test envs
  }
}

seedAddresses().finally(() => {});
