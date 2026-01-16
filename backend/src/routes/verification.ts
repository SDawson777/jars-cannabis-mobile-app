// backend/src/routes/verification.ts
// Age verification and location gating routes

import { Router, Request, Response } from 'express';

const router = Router();

// ============================================
// Verification Status
// ============================================

router.get('/status', async (req: Request, res: Response) => {
  try {
    // In production, this would check verification records
    res.json({
      userId: 'user-123',
      ageVerified: true,
      idVerified: false,
      locationVerified: true,
      verificationMethod: 'self_attestation',
      verifiedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      state: 'CA',
      restrictions: [],
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
});

// ============================================
// ID Verification
// ============================================

router.post('/id/submit', async (req: Request, res: Response) => {
  try {
    const {
      documentType,
      frontImageData: _frontImageData,
      backImageData: _backImageData,
      selfieImageData,
    } = req.body;

    // In production, this would send to ID verification service (e.g., Jumio, Onfido)
    const verificationId = `verify-${Date.now()}`;

    res.json({
      success: true,
      verified: true,
      documentType,
      extractedData: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        age: 34,
        state: 'CA',
        expirationDate: '2028-01-15',
        documentNumber: 'DL123456789',
      },
      checks: {
        ageCheck: true,
        expirationCheck: true,
        livenessCheck: !!selfieImageData,
        documentAuthenticityCheck: true,
      },
      verificationId,
    });
  } catch (error) {
    console.error('Error submitting ID verification:', error);
    res.status(500).json({ error: 'Failed to submit ID verification' });
  }
});

router.get('/id/:verificationId', async (req: Request, res: Response) => {
  try {
    const { verificationId } = req.params;

    res.json({
      success: true,
      verified: true,
      documentType: 'drivers_license',
      checks: {
        ageCheck: true,
        expirationCheck: true,
        livenessCheck: true,
        documentAuthenticityCheck: true,
      },
      verificationId,
    });
  } catch (error) {
    console.error('Error fetching ID verification status:', error);
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
});

router.post('/self-attest', async (req: Request, res: Response) => {
  try {
    const { dateOfBirth, agreedToTerms } = req.body;

    if (!agreedToTerms) {
      return res.status(400).json({ error: 'Must agree to terms' });
    }

    const birthDate = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (age < 21) {
      return res.json({ verified: false, expiresAt: new Date().toISOString() });
    }

    res.json({
      verified: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });
  } catch (error) {
    console.error('Error with self attestation:', error);
    res.status(500).json({ error: 'Self attestation failed' });
  }
});

// ============================================
// Location Verification
// ============================================

router.get('/location/check', async (req: Request, res: Response) => {
  try {
    const { lat: _lat, lng: _lng } = req.query;

    // In production, this would use a geolocation service
    res.json({
      allowed: true,
      state: 'CA',
      city: 'Los Angeles',
      county: 'Los Angeles County',
      restrictions: {
        type: 'recreational',
        minAge: 21,
        purchaseLimits: {
          flower: '28.5g per day',
          concentrate: '8g per day',
          edibles: '800mg THC per day',
        },
        deliveryAllowed: true,
        curbsideAllowed: true,
      },
    });
  } catch (error) {
    console.error('Error checking location:', error);
    res.status(500).json({ error: 'Failed to check location' });
  }
});

router.post('/location/verify', async (req: Request, res: Response) => {
  try {
    const { latitude: _latitude, longitude: _longitude } = req.body;

    res.json({
      allowed: true,
      state: 'CA',
      city: 'Los Angeles',
      county: 'Los Angeles County',
      restrictions: {
        type: 'recreational',
        minAge: 21,
        deliveryAllowed: true,
        curbsideAllowed: true,
      },
    });
  } catch (error) {
    console.error('Error verifying location:', error);
    res.status(500).json({ error: 'Failed to verify location' });
  }
});

// ============================================
// State Regulations
// ============================================

router.get('/regulations/:stateCode', async (req: Request, res: Response) => {
  try {
    const { stateCode } = req.params;

    const regulations: Record<string, object> = {
      CA: {
        state: 'California',
        stateCode: 'CA',
        legalStatus: 'recreational',
        minAge: 21,
        medicalCardRequired: false,
        purchaseLimits: {
          flower: '28.5g per day',
          concentrate: '8g per day',
          edibles: '800mg THC per day',
        },
        deliveryRules: {
          allowed: true,
          hoursOfOperation: '6am-10pm',
          idRequiredAtDelivery: true,
        },
        restrictions: ['No public consumption', 'No consumption while driving'],
      },
      CO: {
        state: 'Colorado',
        stateCode: 'CO',
        legalStatus: 'recreational',
        minAge: 21,
        medicalCardRequired: false,
        purchaseLimits: {
          flower: '28g per day',
          concentrate: '8g per day',
        },
        deliveryRules: {
          allowed: true,
          hoursOfOperation: '8am-10pm',
          idRequiredAtDelivery: true,
        },
        restrictions: [],
      },
    };

    const stateReg = regulations[stateCode.toUpperCase()];
    if (!stateReg) {
      return res.status(404).json({ error: 'State not found or not legal' });
    }

    res.json(stateReg);
  } catch (error) {
    console.error('Error fetching regulations:', error);
    res.status(500).json({ error: 'Failed to fetch regulations' });
  }
});

// ============================================
// Delivery Address Verification
// ============================================

router.post('/delivery-address', async (req: Request, res: Response) => {
  try {
    const { street: _street, city: _city, state: _state, zipCode: _zipCode } = req.body;

    // In production, validate against allowed delivery zones
    res.json({
      allowed: true,
      restrictions: ['Must be 21+ to receive delivery', 'ID required at delivery'],
    });
  } catch (error) {
    console.error('Error verifying delivery address:', error);
    res.status(500).json({ error: 'Failed to verify delivery address' });
  }
});

export default router;
