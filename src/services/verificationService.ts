// src/services/verificationService.ts
// ID Verification service layer for compliance verification endpoints

import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';

// Document types supported for ID verification
export type DocumentType = 'drivers_license' | 'passport' | 'state_id';

// Verification session status
export type VerificationStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'expired';

// Verification method
export type VerificationMethod = 'manual' | 'automated';

// Pre-checkout verification check response
export interface CheckoutVerificationCheck {
  requiresVerification: boolean;
  reason?: string;
  verificationUrl?: string;
}

// User verification status response
export interface UserVerificationStatus {
  verified: boolean;
  verificationDate?: string;
  expiresAt?: string;
  status: VerificationStatus;
  method?: VerificationMethod;
}

// Create verification session request
export interface CreateVerificationSessionRequest {
  documentType: DocumentType;
  returnUrl?: string;
}

// Verification session response
export interface VerificationSession {
  id: string;
  status: VerificationStatus;
  createdAt: string;
  expiresAt: string;
  documentType: DocumentType;
  verificationUrl?: string;
}

// Submit verification data request
export interface SubmitVerificationRequest {
  dateOfBirth: string; // YYYY-MM-DD format
  state: string; // Two-letter state code
  documentType: DocumentType;
  consentGiven: boolean;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
}

// Submit verification response
export interface SubmitVerificationResponse {
  success: boolean;
  status: VerificationStatus;
  message?: string;
  verificationId?: string;
  error?: string;
}

export const verificationService = {
  /**
   * Check if verification is required before checkout
   * @param storeId - The store ID for the checkout
   */
  async checkVerificationRequired(storeId: string): Promise<CheckoutVerificationCheck> {
    try {
      const response = await clientGet<CheckoutVerificationCheck>(
        phase4Client,
        `/api/verify/checkout/check?storeId=${encodeURIComponent(storeId)}`
      );
      return response;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      // If 404, verification not required
      if (axiosError.response?.status === 404) {
        return { requiresVerification: false };
      }
      throw error;
    }
  },

  /**
   * Get user's current verification status
   */
  async getUserVerificationStatus(): Promise<UserVerificationStatus> {
    try {
      const response = await clientGet<UserVerificationStatus>(
        phase4Client,
        '/api/verify/user/status'
      );
      return response;
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      // If 404, user is not verified
      if (axiosError.response?.status === 404) {
        return { verified: false, status: 'pending' };
      }
      throw error;
    }
  },

  /**
   * Create a new verification session
   * @param data - Session creation data
   */
  async createVerificationSession(
    data: CreateVerificationSessionRequest
  ): Promise<VerificationSession> {
    const response = await clientPost<CreateVerificationSessionRequest, VerificationSession>(
      phase4Client,
      '/api/verify/session',
      data
    );
    return response;
  },

  /**
   * Get verification session details
   * @param sessionId - The session ID to retrieve
   */
  async getVerificationSession(sessionId: string): Promise<VerificationSession> {
    const response = await clientGet<VerificationSession>(
      phase4Client,
      `/api/verify/session/${encodeURIComponent(sessionId)}`
    );
    return response;
  },

  /**
   * Submit verification data for a session
   * @param sessionId - The session ID
   * @param data - Verification submission data
   */
  async submitVerification(
    sessionId: string,
    data: SubmitVerificationRequest
  ): Promise<SubmitVerificationResponse> {
    try {
      const response = await clientPost<SubmitVerificationRequest, SubmitVerificationResponse>(
        phase4Client,
        `/api/verify/session/${encodeURIComponent(sessionId)}/submit`,
        data
      );
      return response;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
      };
      // Handle specific error responses
      if (axiosError.response?.status === 400) {
        return {
          success: false,
          status: 'rejected',
          error: axiosError.response.data?.message || 'Invalid verification data',
        };
      }
      if (axiosError.response?.status === 422) {
        return {
          success: false,
          status: 'rejected',
          error:
            axiosError.response.data?.message || 'Verification failed - age requirement not met',
        };
      }
      throw error;
    }
  },

  /**
   * Check if a date of birth meets the minimum age requirement (21+)
   * @param dateOfBirth - Date string in YYYY-MM-DD format
   * @returns boolean indicating if the person is 21 or older
   */
  isOver21(dateOfBirth: string): boolean {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 21;
  },

  /**
   * Validate date of birth format (YYYY-MM-DD)
   */
  isValidDateFormat(dateOfBirth: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateOfBirth)) return false;
    const date = new Date(dateOfBirth);
    return !isNaN(date.getTime());
  },

  /**
   * Validate US state code (two letters)
   */
  isValidStateCode(state: string): boolean {
    const validStates = [
      'AL',
      'AK',
      'AZ',
      'AR',
      'CA',
      'CO',
      'CT',
      'DE',
      'FL',
      'GA',
      'HI',
      'ID',
      'IL',
      'IN',
      'IA',
      'KS',
      'KY',
      'LA',
      'ME',
      'MD',
      'MA',
      'MI',
      'MN',
      'MS',
      'MO',
      'MT',
      'NE',
      'NV',
      'NH',
      'NJ',
      'NM',
      'NY',
      'NC',
      'ND',
      'OH',
      'OK',
      'OR',
      'PA',
      'RI',
      'SC',
      'SD',
      'TN',
      'TX',
      'UT',
      'VT',
      'VA',
      'WA',
      'WV',
      'WI',
      'WY',
      'DC',
      'PR',
      'VI',
      'GU',
      'AS',
      'MP',
    ];
    return validStates.includes(state.toUpperCase());
  },
};

export default verificationService;
