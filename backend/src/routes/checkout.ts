// backend/src/routes/checkout.ts
// Routes for checkout flow, payment processing, and order placement

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../prismaClient';
import { z } from 'zod';

export const checkoutRouter = Router();

// Validation schemas
const placeOrderSchema = z.object({
  paymentMethodId: z.string().min(1),
  shippingAddressId: z.string().min(1),
  billingAddressId: z.string().optional(),
  shippingOptionId: z.string().optional(),
  tipAmount: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  scheduledDelivery: z.string().optional(),
});

const couponSchema = z.object({
  code: z.string().min(1).max(50),
});

// Demo shipping options
const shippingOptions = [
  { id: 'express', name: 'Express Delivery', price: 9.99, estimatedDays: 1, carrier: 'Express' },
  { id: 'standard', name: 'Standard Delivery', price: 4.99, estimatedDays: 3, carrier: 'Standard' },
  { id: 'economy', name: 'Economy Delivery', price: 0, estimatedDays: 7, carrier: 'Economy' },
];

// Demo coupons
const validCoupons: Record<string, { discount: number; description: string; type: 'percent' | 'fixed' }> = {
  'WELCOME10': { discount: 10, description: '10% off your first order', type: 'percent' },
  'SAVE5': { discount: 5, description: '$5 off your order', type: 'fixed' },
  'NIMBUS20': { discount: 20, description: '20% off for Nimbus members', type: 'percent' },
};

/**
 * POST /checkout/session
 * Create a new checkout session
 */
checkoutRouter.post('/checkout/session', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { couponCode } = req.body || {};
  
  try {
    // Get user's cart
    const cart = await (prisma as any).cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    
    if (!cart || !cart.items?.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += (item.product?.defaultPrice || item.unitPrice || 0) * item.quantity;
    }
    
    let discount = 0;
    if (couponCode) {
      const coupon = validCoupons[couponCode.toUpperCase()];
      if (coupon) {
        discount = coupon.type === 'percent' 
          ? subtotal * (coupon.discount / 100) 
          : coupon.discount;
      }
    }
    
    const taxRate = 0.0875; // 8.75% tax
    const tax = (subtotal - discount) * taxRate;
    const shipping = 0; // Will be set when shipping option selected
    const total = subtotal - discount + tax + shipping;
    
    res.json({
      id: `cs_${Date.now()}`,
      cartId: cart.id,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
      currency: 'USD',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * GET /checkout/shipping-options
 * Get available shipping options
 */
checkoutRouter.get('/checkout/shipping-options', requireAuth, async (req: Request, res: Response) => {
  const { addressId } = req.query;
  
  // In production, would validate address and filter options based on location
  if (addressId) {
    // Verify address exists for user
    const userId = (req as any).user?.userId;
    const address = await (prisma as any).address.findFirst({
      where: { id: addressId as string, userId },
    });
    
    if (!address) {
      return res.status(400).json({ error: 'Invalid address' });
    }
  }
  
  res.json({ options: shippingOptions });
});

/**
 * POST /checkout/apply-coupon
 * Apply a coupon code
 */
checkoutRouter.post('/checkout/apply-coupon', requireAuth, async (req: Request, res: Response) => {
  const parse = couponSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid coupon code', valid: false });
  }
  
  const { code } = parse.data;
  const coupon = validCoupons[code.toUpperCase()];
  
  if (!coupon) {
    return res.status(400).json({ error: 'Invalid coupon code', valid: false });
  }
  
  res.json({
    valid: true,
    discount: coupon.discount,
    description: coupon.description,
    type: coupon.type,
  });
});

/**
 * POST /checkout/remove-coupon
 * Remove applied coupon
 */
checkoutRouter.post('/checkout/remove-coupon', requireAuth, async (_req: Request, res: Response) => {
  res.json({ success: true });
});

/**
 * POST /checkout/validate
 * Validate cart items before checkout
 */
checkoutRouter.post('/checkout/validate', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  
  try {
    const cart = await (prisma as any).cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    
    if (!cart || !cart.items?.length) {
      return res.json({ valid: false, errors: ['Cart is empty'] });
    }
    
    const errors: string[] = [];
    const unavailableItems: string[] = [];
    const priceChanges: Array<{ productId: string; oldPrice: number; newPrice: number }> = [];
    
    for (const item of cart.items) {
      // Check if product still exists and is available
      if (!item.product) {
        unavailableItems.push(item.productId);
        errors.push(`Product ${item.productId} is no longer available`);
        continue;
      }
      
      // Check stock (simplified)
      if (item.product.stock !== undefined && item.product.stock < item.quantity) {
        errors.push(`Only ${item.product.stock} units of ${item.product.name} available`);
      }
      
      // Check for price changes
      const currentPrice = item.product.defaultPrice || 0;
      if (item.unitPrice && Math.abs(currentPrice - item.unitPrice) > 0.01) {
        priceChanges.push({
          productId: item.productId,
          oldPrice: item.unitPrice,
          newPrice: currentPrice,
        });
      }
    }
    
    res.json({
      valid: errors.length === 0 && unavailableItems.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      unavailableItems: unavailableItems.length > 0 ? unavailableItems : undefined,
      priceChanges: priceChanges.length > 0 ? priceChanges : undefined,
    });
  } catch (error: any) {
    console.error('Checkout validation error:', error);
    res.status(500).json({ valid: false, errors: ['Validation failed'] });
  }
});

/**
 * POST /checkout/place-order
 * Place the order
 */
checkoutRouter.post('/checkout/place-order', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  
  const parse = placeOrderSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid order data', details: parse.error.flatten() });
  }
  
  const { paymentMethodId, shippingAddressId, shippingOptionId, tipAmount, notes } = parse.data;
  
  try {
    // Verify payment method
    const paymentMethod = await (prisma as any).paymentMethod.findFirst({
      where: { id: paymentMethodId, userId },
    });
    
    if (!paymentMethod) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
    
    // Verify shipping address
    const address = await (prisma as any).address.findFirst({
      where: { id: shippingAddressId, userId },
    });
    
    if (!address) {
      return res.status(400).json({ error: 'Invalid shipping address' });
    }
    
    // Get cart
    const cart = await (prisma as any).cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    
    if (!cart || !cart.items?.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      subtotal += (item.product?.defaultPrice || item.unitPrice || 0) * item.quantity;
    }
    
    const shippingOption = shippingOptions.find(o => o.id === shippingOptionId);
    const shipping = shippingOption?.price || 0;
    const taxRate = 0.0875;
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shipping + (tipAmount || 0);
    
    // Create order
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order = await (prisma as any).order.create({
      data: {
        userId,
        orderNumber,
        status: 'pending',
        subtotal,
        tax,
        shipping,
        tip: tipAmount || 0,
        total,
        shippingAddressId,
        paymentMethodId,
        notes: notes || null,
        items: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.product?.defaultPrice || item.unitPrice,
            variantId: item.variantId,
          })),
        },
      },
    });
    
    // Clear cart
    await (prisma as any).cartItem.deleteMany({ where: { cartId: cart.id } });
    
    // Calculate estimated delivery
    const deliveryDays = shippingOption?.estimatedDays || 5;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);
    
    res.status(201).json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      estimatedDelivery: estimatedDelivery.toISOString(),
      receiptUrl: `/orders/${order.id}/receipt`,
    });
  } catch (error: any) {
    console.error('Place order error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});
