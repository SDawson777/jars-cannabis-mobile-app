import type { CartItem, Cart } from '../hooks/useCart';
import type { ProductVariant, ProductDetails } from '../hooks/useProductDetails';
import type { CMSProduct } from '../types/cms';

describe('cart and product types', () => {
  describe('CartItem', () => {
    it('creates a valid cart item with required fields', () => {
      const item: CartItem = {
        id: 'item-1',
        name: 'Blue Dream',
        price: 45.0,
        quantity: 1,
      };

      expect(item.id).toBe('item-1');
      expect(item.name).toBe('Blue Dream');
      expect(item.price).toBe(45.0);
      expect(item.quantity).toBe(1);
    });

    it('supports optional variantId', () => {
      const item: CartItem = {
        id: 'item-2',
        name: 'Sour Diesel 3.5g',
        price: 35.0,
        quantity: 2,
        variantId: 'variant-eighth',
      };

      expect(item.variantId).toBe('variant-eighth');
    });

    it('handles multiple quantities', () => {
      const item: CartItem = {
        id: 'item-3',
        name: 'Gummies',
        price: 20.0,
        quantity: 3,
      };

      expect(item.quantity).toBe(3);
    });

    it('can calculate line total', () => {
      const item: CartItem = {
        id: 'item-4',
        name: 'Vape Pen',
        price: 50.0,
        quantity: 2,
      };

      const lineTotal = item.price * item.quantity;

      expect(lineTotal).toBe(100.0);
    });

    it('handles decimal prices', () => {
      const item: CartItem = {
        id: 'item-5',
        name: 'Pre-Roll',
        price: 12.99,
        quantity: 1,
      };

      expect(item.price).toBe(12.99);
    });

    it('supports items without variants', () => {
      const item: CartItem = {
        id: 'item-6',
        name: 'Simple Product',
        price: 25.0,
        quantity: 1,
      };

      expect(item.variantId).toBeUndefined();
    });
  });

  describe('Cart', () => {
    it('creates a valid cart', () => {
      const cart: Cart = {
        items: [
          { id: '1', name: 'Product A', price: 30.0, quantity: 1 },
          { id: '2', name: 'Product B', price: 40.0, quantity: 2 },
        ],
        total: 110.0,
      };

      expect(cart.items).toHaveLength(2);
      expect(cart.total).toBe(110.0);
    });

    it('handles empty cart', () => {
      const cart: Cart = {
        items: [],
        total: 0,
      };

      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });

    it('can calculate total from items', () => {
      const cart: Cart = {
        items: [
          { id: '1', name: 'Item 1', price: 25.0, quantity: 2 },
          { id: '2', name: 'Item 2', price: 15.0, quantity: 3 },
        ],
        total: 0,
      };

      const calculatedTotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      expect(calculatedTotal).toBe(95.0);
    });

    it('can count total items', () => {
      const cart: Cart = {
        items: [
          { id: '1', name: 'Item 1', price: 20.0, quantity: 2 },
          { id: '2', name: 'Item 2', price: 30.0, quantity: 3 },
          { id: '3', name: 'Item 3', price: 10.0, quantity: 1 },
        ],
        total: 140.0,
      };

      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

      expect(totalQuantity).toBe(6);
    });

    it('can find item by id', () => {
      const cart: Cart = {
        items: [
          { id: 'item-a', name: 'Product A', price: 25.0, quantity: 1 },
          { id: 'item-b', name: 'Product B', price: 35.0, quantity: 1 },
        ],
        total: 60.0,
      };

      const item = cart.items.find(i => i.id === 'item-b');

      expect(item?.name).toBe('Product B');
    });

    it('can remove item from cart', () => {
      const cart: Cart = {
        items: [
          { id: '1', name: 'Keep', price: 20.0, quantity: 1 },
          { id: '2', name: 'Remove', price: 30.0, quantity: 1 },
        ],
        total: 50.0,
      };

      const updatedItems = cart.items.filter(i => i.id !== '2');

      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].name).toBe('Keep');
    });

    it('handles large carts', () => {
      const items: CartItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        name: `Product ${i}`,
        price: 10.0 + i,
        quantity: 1,
      }));

      const cart: Cart = {
        items,
        total: items.reduce((sum, item) => sum + item.price, 0),
      };

      expect(cart.items).toHaveLength(20);
      expect(cart.total).toBeGreaterThan(200);
    });
  });

  describe('ProductVariant', () => {
    it('creates a valid product variant', () => {
      const variant: ProductVariant = {
        id: 'variant-1',
        name: '3.5g',
        price: 35.0,
        stock: 10,
      };

      expect(variant.id).toBe('variant-1');
      expect(variant.name).toBe('3.5g');
      expect(variant.price).toBe(35.0);
      expect(variant.stock).toBe(10);
    });

    it('supports different sizes', () => {
      const variants: ProductVariant[] = [
        { id: 'var-1', name: '1g', price: 15.0, stock: 20 },
        { id: 'var-2', name: '3.5g', price: 45.0, stock: 15 },
        { id: 'var-3', name: '7g', price: 80.0, stock: 8 },
        { id: 'var-4', name: '14g', price: 140.0, stock: 5 },
      ];

      expect(variants).toHaveLength(4);
      expect(variants.map(v => v.name)).toContain('7g');
    });

    it('handles out of stock variants', () => {
      const variant: ProductVariant = {
        id: 'variant-oos',
        name: '28g',
        price: 250.0,
        stock: 0,
      };

      expect(variant.stock).toBe(0);
    });

    it('can find cheapest variant', () => {
      const variants: ProductVariant[] = [
        { id: '1', name: 'Small', price: 20.0, stock: 10 },
        { id: '2', name: 'Medium', price: 35.0, stock: 8 },
        { id: '3', name: 'Large', price: 60.0, stock: 5 },
      ];

      const cheapest = variants.reduce((min, v) => (v.price < min.price ? v : min));

      expect(cheapest.name).toBe('Small');
      expect(cheapest.price).toBe(20.0);
    });

    it('can filter in-stock variants', () => {
      const variants: ProductVariant[] = [
        { id: '1', name: 'A', price: 20.0, stock: 5 },
        { id: '2', name: 'B', price: 30.0, stock: 0 },
        { id: '3', name: 'C', price: 40.0, stock: 3 },
      ];

      const inStock = variants.filter(v => v.stock > 0);

      expect(inStock).toHaveLength(2);
    });

    it('can sort variants by price', () => {
      const variants: ProductVariant[] = [
        { id: '1', name: 'C', price: 60.0, stock: 5 },
        { id: '2', name: 'A', price: 20.0, stock: 10 },
        { id: '3', name: 'B', price: 35.0, stock: 8 },
      ];

      const sorted = [...variants].sort((a, b) => a.price - b.price);

      expect(sorted[0].name).toBe('A');
      expect(sorted[2].name).toBe('C');
    });
  });

  describe('ProductDetails', () => {
    it('creates valid product details', () => {
      const product: CMSProduct = {
        __id: 'prod-1',
        name: 'Blue Dream',
        slug: 'blue-dream',
        price: 45.0,
        type: 'flower',
        image: { url: 'https://cdn.example.com/blue-dream.jpg' },
      };

      const details: ProductDetails = {
        product,
        variants: [
          { id: 'var-1', name: '3.5g', price: 45.0, stock: 10 },
          { id: 'var-2', name: '7g', price: 80.0, stock: 5 },
        ],
      };

      expect(details.product.name).toBe('Blue Dream');
      expect(details.variants).toHaveLength(2);
    });

    it('supports products without variants', () => {
      const product: CMSProduct = {
        __id: 'prod-2',
        name: 'Pre-Roll',
        slug: 'pre-roll',
        price: 12.0,
        type: 'flower',
        image: { url: 'https://cdn.example.com/pre-roll.jpg' },
      };

      const details: ProductDetails = {
        product,
        variants: [],
      };

      expect(details.product.slug).toBe('pre-roll');
      expect(details.variants).toHaveLength(0);
    });

    it('includes product with effects', () => {
      const product: CMSProduct = {
        __id: 'prod-3',
        name: 'Sour Diesel',
        slug: 'sour-diesel',
        price: 50.0,
        type: 'flower',
        effects: ['energetic', 'creative', 'focused'],
        image: { url: 'https://cdn.example.com/sour-diesel.jpg' },
      };

      const details: ProductDetails = {
        product,
        variants: [{ id: 'var-1', name: '3.5g', price: 50.0, stock: 8 }],
      };

      expect(details.product.effects).toContain('creative');
    });

    it('includes product with image', () => {
      const product: CMSProduct = {
        __id: 'prod-4',
        name: 'OG Kush',
        slug: 'og-kush',
        price: 55.0,
        type: 'flower',
        image: { url: 'https://cdn.example.com/og-kush.jpg' },
      };

      const details: ProductDetails = {
        product,
        variants: [],
      };

      expect(details.product.image?.url).toContain('og-kush');
    });

    it('supports different product types', () => {
      const products: ProductDetails[] = [
        {
          product: {
            __id: '1',
            name: 'Flower',
            slug: 'flower',
            price: 45.0,
            type: 'flower',
            image: { url: 'https://cdn.example.com/flower.jpg' },
          },
          variants: [],
        },
        {
          product: {
            __id: '2',
            name: 'Edible',
            slug: 'edible',
            price: 25.0,
            type: 'edible',
            image: { url: 'https://cdn.example.com/edible.jpg' },
          },
          variants: [],
        },
        {
          product: {
            __id: '3',
            name: 'Vape',
            slug: 'vape',
            price: 50.0,
            type: 'vape',
            image: { url: 'https://cdn.example.com/vape.jpg' },
          },
          variants: [],
        },
      ];

      expect(products).toHaveLength(3);
      expect(products.map(p => p.product.type)).toContain('edible');
    });

    it('can find default variant', () => {
      const details: ProductDetails = {
        product: {
          __id: '1',
          name: 'Product',
          slug: 'product',
          price: 40.0,
          type: 'flower',
          image: { url: 'https://cdn.example.com/product.jpg' },
        },
        variants: [
          { id: 'var-1', name: '1g', price: 15.0, stock: 20 },
          { id: 'var-2', name: '3.5g', price: 40.0, stock: 15 },
          { id: 'var-3', name: '7g', price: 70.0, stock: 10 },
        ],
      };

      // Find variant matching product price
      const defaultVariant = details.variants.find(v => v.price === details.product.price);

      expect(defaultVariant?.name).toBe('3.5g');
    });
  });

  describe('type compatibility', () => {
    it('cart items can be converted to order items', () => {
      interface OrderItem {
        productId: string;
        quantity: number;
        price: number;
      }

      const cartItems: CartItem[] = [
        { id: 'prod-1', name: 'Product 1', price: 30.0, quantity: 2 },
        { id: 'prod-2', name: 'Product 2', price: 40.0, quantity: 1 },
      ];

      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      expect(orderItems).toHaveLength(2);
      expect(orderItems[0].productId).toBe('prod-1');
    });

    it('variants can be converted to cart items', () => {
      const variant: ProductVariant = {
        id: 'var-1',
        name: '3.5g Blue Dream',
        price: 45.0,
        stock: 10,
      };

      const cartItem: CartItem = {
        id: 'cart-item-1',
        name: variant.name,
        price: variant.price,
        quantity: 1,
        variantId: variant.id,
      };

      expect(cartItem.price).toBe(variant.price);
      expect(cartItem.variantId).toBe(variant.id);
    });

    it('product details can be displayed with cart context', () => {
      interface CartContext {
        details: ProductDetails;
        selectedVariant?: ProductVariant;
        quantityInCart: number;
      }

      const context: CartContext = {
        details: {
          product: {
            __id: '1',
            name: 'Test',
            slug: 'test',
            price: 30.0,
            type: 'flower',
            image: { url: 'https://cdn.example.com/test.jpg' },
          },
          variants: [{ id: 'var-1', name: '1g', price: 15.0, stock: 10 }],
        },
        selectedVariant: { id: 'var-1', name: '1g', price: 15.0, stock: 10 },
        quantityInCart: 2,
      };

      expect(context.details.product.name).toBe('Test');
      expect(context.quantityInCart).toBe(2);
    });
  });
});
