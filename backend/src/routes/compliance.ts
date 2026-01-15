// backend/src/routes/compliance.ts
// Routes for compliance, age verification, and product recalls

import { Router, Request, Response } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Demo recalls data (in production, this would come from database)
const demoRecalls = [
  {
    id: 'recall-001',
    productId: 'prod-123',
    productName: 'Sample Edible',
    batchNumbers: ['BATCH-2024-001', 'BATCH-2024-002'],
    reason: 'Potential mislabeling of THC content',
    severity: 'medium' as const,
    instructions: 'Please return to point of purchase for a full refund.',
    issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    affectedStates: ['CA', 'OR', 'WA'],
    contactInfo: 'recalls@nimbus.example.com',
  },
];

// State restrictions data
const stateRestrictions: Record<string, {
  allowed: boolean;
  restrictions?: string[];
  legalAge: number;
  medicalOnly?: boolean;
  purchaseLimits?: { daily?: number; monthly?: number };
}> = {
  CA: { allowed: true, legalAge: 21, purchaseLimits: { daily: 28.5 } },
  CO: { allowed: true, legalAge: 21, purchaseLimits: { daily: 28 } },
  OR: { allowed: true, legalAge: 21, purchaseLimits: { daily: 28 } },
  WA: { allowed: true, legalAge: 21, purchaseLimits: { daily: 28 } },
  AZ: { allowed: true, legalAge: 21, purchaseLimits: { daily: 28 } },
  NV: { allowed: true, legalAge: 21, purchaseLimits: { daily: 28 } },
  IL: { allowed: true, legalAge: 21, purchaseLimits: { daily: 30 } },
  MI: { allowed: true, legalAge: 21, purchaseLimits: { daily: 71 } },
  MA: { allowed: true, legalAge: 21, purchaseLimits: { daily: 28 } },
  NJ: { allowed: true, legalAge: 21, purchaseLimits: { daily: 28 } },
  NY: { allowed: true, legalAge: 21 },
  FL: { allowed: true, legalAge: 21, medicalOnly: true },
  TX: { allowed: false, legalAge: 21, restrictions: ['Not legal for recreational use'] },
  // Default for unspecified states
  DEFAULT: { allowed: false, legalAge: 21, restrictions: ['Please check your local laws'] },
};

/**
 * GET /compliance/status
 * Returns current user's compliance status
 */
router.get('/status', optionalAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  let ageVerified = false;
  let ageVerifiedAt: string | undefined;
  let userState: string | undefined;
  
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { ageVerified: true, dateOfBirth: true, state: true },
      });
      
      if (user) {
        ageVerified = user.ageVerified;
        userState = user.state || undefined;
      }
    } catch {
      // Continue with defaults
    }
  }
  
  const stateInfo = userState ? (stateRestrictions[userState] || stateRestrictions.DEFAULT) : stateRestrictions.DEFAULT;
  
  res.json({
    ageVerified,
    ageVerifiedAt,
    state: userState,
    stateAllowed: stateInfo.allowed,
    activeAlerts: [],
    activeRecalls: demoRecalls.filter(r => 
      !userState || !r.affectedStates || r.affectedStates.includes(userState)
    ),
  });
});

/**
 * GET /compliance/recalls
 * Returns active product recalls
 */
router.get('/recalls', optionalAuth, async (req: Request, res: Response) => {
  // In production, fetch from database
  // Filter by user's state if available
  const userState = (req as any).user?.state;
  
  const relevantRecalls = demoRecalls.filter(r => 
    !userState || !r.affectedStates || r.affectedStates.includes(userState)
  );
  
  res.json(relevantRecalls);
});

/**
 * POST /compliance/recalls/:id/acknowledge
 * Acknowledge a recall notice
 */
router.post('/recalls/:id/acknowledge', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  
  // In production, store acknowledgment in database
  console.log(`User ${userId} acknowledged recall ${id}`);
  
  res.json({ success: true });
});

/**
 * POST /compliance/verify-age
 * Verify user's age
 */
router.post('/verify-age', requireAuth, async (req: Request, res: Response) => {
  const { birthDate } = req.body;
  const userId = (req as any).user?.id;
  
  if (!birthDate) {
    return res.status(400).json({ error: 'Birth date is required' });
  }
  
  const dob = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  const verified = age >= 21;
  
  if (verified && userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          ageVerified: true,
          dateOfBirth: dob,
        },
      });
    } catch {
      // Non-fatal
    }
  }
  
  res.json({
    verified,
    expiresAt: verified ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  });
});

/**
 * GET /compliance/states/:state
 * Get restrictions for a specific state
 */
router.get('/states/:state', (req: Request, res: Response) => {
  const { state } = req.params;
  const stateUpper = state.toUpperCase();
  
  const info = stateRestrictions[stateUpper] || stateRestrictions.DEFAULT;
  
  res.json(info);
});

export default router;
