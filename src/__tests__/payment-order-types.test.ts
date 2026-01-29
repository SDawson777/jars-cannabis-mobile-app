import type { PaymentPayload } from '../clients/paymentClient';
import type { CreateOrderPayload } from '../clients/orderClient';

describe('payment and order client types', () => {
  describe('PaymentPayload', () => {
    it('creates valid payment payload with required fields', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Visa',
        cardLast4: '4242',
      };

      expect(payload.cardBrand).toBe('Visa');
      expect(payload.cardLast4).toBe('4242');
    });

    it('supports different card brands', () => {
      const payloads: PaymentPayload[] = [
        { cardBrand: 'Visa', cardLast4: '4242' },
        { cardBrand: 'Mastercard', cardLast4: '5555' },
        { cardBrand: 'American Express', cardLast4: '3782' },
        { cardBrand: 'Discover', cardLast4: '6011' },
      ];

      expect(payloads).toHaveLength(4);
      expect(payloads.map(p => p.cardBrand)).toContain('American Express');
    });

    it('supports optional holder name', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Visa',
        cardLast4: '1234',
        holderName: 'John Doe',
      };

      expect(payload.holderName).toBe('John Doe');
    });

    it('supports optional expiry', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Mastercard',
        cardLast4: '5678',
        expiry: '12/28',
      };

      expect(payload.expiry).toBe('12/28');
    });

    it('validates expiry format MM/YY', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Visa',
        cardLast4: '9999',
        expiry: '06/27',
      };

      const isValidFormat = /^\d{2}\/\d{2}$/.test(payload.expiry || '');

      expect(isValidFormat).toBe(true);
    });

    it('supports isDefault flag', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Visa',
        cardLast4: '4321',
        isDefault: true,
      };

      expect(payload.isDefault).toBe(true);
    });

    it('creates complete payment payload', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Visa',
        cardLast4: '4242',
        holderName: 'Jane Smith',
        expiry: '03/26',
        isDefault: true,
      };

      expect(payload.cardBrand).toBe('Visa');
      expect(payload.cardLast4).toBe('4242');
      expect(payload.holderName).toBe('Jane Smith');
      expect(payload.expiry).toBe('03/26');
      expect(payload.isDefault).toBe(true);
    });

    it('handles last4 as string', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Mastercard',
        cardLast4: '0001',
      };

      expect(typeof payload.cardLast4).toBe('string');
      expect(payload.cardLast4.length).toBe(4);
    });

    it('can mask full card number', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Visa',
        cardLast4: '4242',
      };

      const masked = `****-****-****-${payload.cardLast4}`;

      expect(masked).toBe('****-****-****-4242');
    });

    it('can display formatted card', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Visa',
        cardLast4: '4242',
        expiry: '12/26',
      };

      const display = `${payload.cardBrand} •••• ${payload.cardLast4}`;

      expect(display).toBe('Visa •••• 4242');
    });

    it('can check if card is expired', () => {
      const payload: PaymentPayload = {
        cardBrand: 'Visa',
        cardLast4: '4242',
        expiry: '01/20',
      };

      if (payload.expiry) {
        const [month, year] = payload.expiry.split('/').map(Number);
        const expiryDate = new Date(2000 + year, month - 1);
        const now = new Date(2026, 0); // January 2026
        const isExpired = expiryDate < now;

        expect(isExpired).toBe(true);
      }
    });

    it('handles multiple payment methods', () => {
      const methods: PaymentPayload[] = [
        { cardBrand: 'Visa', cardLast4: '4242', isDefault: true },
        { cardBrand: 'Mastercard', cardLast4: '5555', isDefault: false },
      ];

      const defaultMethod = methods.find(m => m.isDefault);

      expect(defaultMethod?.cardBrand).toBe('Visa');
    });
  });

  describe('CreateOrderPayload', () => {
    it('creates valid pickup order', () => {
      const payload: CreateOrderPayload = {
        deliveryMethod: 'pickup',
        contact: {
          name: 'John Doe',
          phone: '555-0100',
          email: 'john@example.com',
        },
        paymentMethod: 'card',
      };

      expect(payload.deliveryMethod).toBe('pickup');
      expect(payload.contact.name).toBe('John Doe');
      expect(payload.paymentMethod).toBe('card');
    });

    it('creates valid delivery order with address', () => {
      const payload: CreateOrderPayload = {
        deliveryMethod: 'delivery',
        deliveryAddress: {
          line1: '123 Main St',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
        },
        contact: {
          name: 'Jane Smith',
          phone: '555-0200',
          email: 'jane@example.com',
        },
        paymentMethod: 'card',
      };

      expect(payload.deliveryMethod).toBe('delivery');
      expect(payload.deliveryAddress?.city).toBe('Denver');
      expect(payload.deliveryAddress?.state).toBe('CO');
      expect(payload.deliveryAddress?.zipCode).toBe('80202');
    });

    it('supports optional storeId', () => {
      const payload: CreateOrderPayload = {
        storeId: 'store-123',
        deliveryMethod: 'pickup',
        contact: {
          name: 'Bob Johnson',
          phone: '555-0300',
          email: 'bob@example.com',
        },
        paymentMethod: 'card',
      };

      expect(payload.storeId).toBe('store-123');
    });

    it('supports pay at pickup payment method', () => {
      const payload: CreateOrderPayload = {
        deliveryMethod: 'pickup',
        contact: {
          name: 'Alice Brown',
          phone: '555-0400',
          email: 'alice@example.com',
        },
        paymentMethod: 'pay_at_pickup',
      };

      expect(payload.paymentMethod).toBe('pay_at_pickup');
    });

    it('supports optional notes', () => {
      const payload: CreateOrderPayload = {
        deliveryMethod: 'delivery',
        deliveryAddress: {
          line1: '456 Oak Ave',
          city: 'Boulder',
          state: 'CO',
          zipCode: '80301',
        },
        contact: {
          name: 'Charlie Davis',
          phone: '555-0500',
          email: 'charlie@example.com',
        },
        paymentMethod: 'card',
        notes: 'Please ring doorbell twice',
      };

      expect(payload.notes).toBe('Please ring doorbell twice');
    });

    it('handles optional line1 in delivery address', () => {
      const payload: CreateOrderPayload = {
        deliveryMethod: 'delivery',
        deliveryAddress: {
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
        },
        contact: {
          name: 'Test User',
          phone: '555-0600',
          email: 'test@example.com',
        },
        paymentMethod: 'card',
      };

      expect(payload.deliveryAddress?.line1).toBeUndefined();
      expect(payload.deliveryAddress?.city).toBe('Seattle');
    });

    it('handles null delivery address for pickup', () => {
      const payload: CreateOrderPayload = {
        deliveryMethod: 'pickup',
        deliveryAddress: null,
        contact: {
          name: 'Pickup User',
          phone: '555-0700',
          email: 'pickup@example.com',
        },
        paymentMethod: 'card',
      };

      expect(payload.deliveryAddress).toBeNull();
      expect(payload.deliveryMethod).toBe('pickup');
    });

    it('validates contact information', () => {
      const payload: CreateOrderPayload = {
        deliveryMethod: 'pickup',
        contact: {
          name: 'Valid User',
          phone: '555-0123',
          email: 'valid@example.com',
        },
        paymentMethod: 'card',
      };

      expect(payload.contact.name.length).toBeGreaterThan(0);
      expect(payload.contact.phone.length).toBeGreaterThan(0);
      expect(payload.contact.email).toContain('@');
    });

    it('supports different phone formats', () => {
      const payloads: CreateOrderPayload[] = [
        {
          deliveryMethod: 'pickup',
          contact: { name: 'User 1', phone: '555-0100', email: 'user1@example.com' },
          paymentMethod: 'card',
        },
        {
          deliveryMethod: 'pickup',
          contact: { name: 'User 2', phone: '(555) 555-0200', email: 'user2@example.com' },
          paymentMethod: 'card',
        },
        {
          deliveryMethod: 'pickup',
          contact: { name: 'User 3', phone: '5555550300', email: 'user3@example.com' },
          paymentMethod: 'card',
        },
      ];

      expect(payloads.every(p => p.contact.phone.length > 0)).toBe(true);
    });

    it('can validate required delivery address fields', () => {
      const payload: CreateOrderPayload = {
        deliveryMethod: 'delivery',
        deliveryAddress: {
          line1: '789 Elm St',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
        },
        contact: {
          name: 'Delivery User',
          phone: '555-0800',
          email: 'delivery@example.com',
        },
        paymentMethod: 'card',
      };

      if (payload.deliveryMethod === 'delivery' && payload.deliveryAddress) {
        const hasRequiredFields = !!(
          payload.deliveryAddress.city &&
          payload.deliveryAddress.state &&
          payload.deliveryAddress.zipCode
        );

        expect(hasRequiredFields).toBe(true);
      }
    });

    it('creates order with all optional fields', () => {
      const payload: CreateOrderPayload = {
        storeId: 'store-456',
        deliveryMethod: 'delivery',
        deliveryAddress: {
          line1: '999 Complete St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
        },
        contact: {
          name: 'Complete User',
          phone: '555-0900',
          email: 'complete@example.com',
        },
        paymentMethod: 'card',
        notes: 'Call on arrival',
      };

      expect(payload.storeId).toBe('store-456');
      expect(payload.notes).toBe('Call on arrival');
      expect(payload.deliveryAddress?.line1).toBe('999 Complete St');
    });
  });

  describe('type compatibility', () => {
    it('payment payload works with order payload', () => {
      interface CheckoutData {
        payment: PaymentPayload;
        order: CreateOrderPayload;
      }

      const checkout: CheckoutData = {
        payment: {
          cardBrand: 'Visa',
          cardLast4: '4242',
          expiry: '12/26',
        },
        order: {
          deliveryMethod: 'delivery',
          deliveryAddress: {
            line1: '123 Test St',
            city: 'Denver',
            state: 'CO',
            zipCode: '80202',
          },
          contact: {
            name: 'Test User',
            phone: '555-0100',
            email: 'test@example.com',
          },
          paymentMethod: 'card',
        },
      };

      expect(checkout.payment.cardBrand).toBe('Visa');
      expect(checkout.order.deliveryMethod).toBe('delivery');
    });

    it('supports order review display', () => {
      interface OrderReview {
        orderDetails: CreateOrderPayload;
        paymentDetails: PaymentPayload;
        total: number;
      }

      const review: OrderReview = {
        orderDetails: {
          deliveryMethod: 'pickup',
          contact: { name: 'John', phone: '555-0100', email: 'john@example.com' },
          paymentMethod: 'card',
        },
        paymentDetails: {
          cardBrand: 'Mastercard',
          cardLast4: '5555',
        },
        total: 125.5,
      };

      expect(review.total).toBe(125.5);
      expect(review.paymentDetails.cardLast4).toBe('5555');
    });

    it('handles order submission with validation', () => {
      interface OrderSubmission {
        isValid: boolean;
        order: CreateOrderPayload;
        payment?: PaymentPayload;
      }

      const submission: OrderSubmission = {
        isValid: true,
        order: {
          deliveryMethod: 'delivery',
          deliveryAddress: {
            city: 'Boulder',
            state: 'CO',
            zipCode: '80301',
          },
          contact: {
            name: 'User',
            phone: '555-0100',
            email: 'user@example.com',
          },
          paymentMethod: 'card',
        },
        payment: {
          cardBrand: 'Visa',
          cardLast4: '4242',
        },
      };

      expect(submission.isValid).toBe(true);
      expect(submission.payment?.cardBrand).toBe('Visa');
    });
  });
});
