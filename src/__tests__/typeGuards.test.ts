import { isValidPersonalizedCardData } from '../utils/typeGuards';

const product = {
  id: '1',
  type: 'product_carousel',
  title: 'Hello',
  products: [],
  ctaText: 'Shop',
  ctaLink: '/',
};

test('validates product scenario', () => {
  expect(isValidPersonalizedCardData(product)).toBe(true);
});

test('invalid scenario', () => {
  expect(isValidPersonalizedCardData({})).toBe(false);
});
