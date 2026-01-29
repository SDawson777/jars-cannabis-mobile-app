import { verificationService } from '../services/verificationService';
import { clientGet, clientPost } from '../api/http';

jest.mock('../api/http');

const mockedClientGet = clientGet as jest.MockedFunction<typeof clientGet>;
const mockedClientPost = clientPost as jest.MockedFunction<typeof clientPost>;

describe('verificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkVerificationRequired', () => {
    it('should return verification check data', async () => {
      const mockCheck = {
        requiresVerification: true,
        reason: 'First-time order requires ID verification',
        verificationUrl: '/verify',
      };
      mockedClientGet.mockResolvedValue(mockCheck);

      const result = await verificationService.checkVerificationRequired('store-1');

      expect(result).toEqual(mockCheck);
      expect(mockedClientGet).toHaveBeenCalledWith(
        expect.anything(),
        '/api/verify/checkout/check?storeId=store-1'
      );
    });

    it('should return requiresVerification: false on 404', async () => {
      mockedClientGet.mockRejectedValue({ response: { status: 404 } });

      const result = await verificationService.checkVerificationRequired('store-1');

      expect(result).toEqual({ requiresVerification: false });
    });

    it('should throw on other errors', async () => {
      mockedClientGet.mockRejectedValue(new Error('Server error'));

      await expect(verificationService.checkVerificationRequired('store-1')).rejects.toThrow(
        'Server error'
      );
    });
  });

  describe('getUserVerificationStatus', () => {
    it('should return user verification status', async () => {
      const mockStatus = {
        verified: true,
        verificationDate: '2026-01-15',
        expiresAt: '2027-01-15',
        status: 'approved' as const,
        method: 'automated' as const,
      };
      mockedClientGet.mockResolvedValue(mockStatus);

      const result = await verificationService.getUserVerificationStatus();

      expect(result).toEqual(mockStatus);
    });

    it('should return pending status on 404', async () => {
      mockedClientGet.mockRejectedValue({ response: { status: 404 } });

      const result = await verificationService.getUserVerificationStatus();

      expect(result).toEqual({ verified: false, status: 'pending' });
    });
  });

  describe('createVerificationSession', () => {
    it('should create a verification session', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'pending' as const,
        createdAt: '2026-01-22T10:00:00Z',
        expiresAt: '2026-01-22T11:00:00Z',
        documentType: 'drivers_license' as const,
        verificationUrl: '/verify/session-123',
      };
      mockedClientPost.mockResolvedValue(mockSession);

      const result = await verificationService.createVerificationSession({
        documentType: 'drivers_license',
      });

      expect(result).toEqual(mockSession);
      expect(mockedClientPost).toHaveBeenCalledWith(expect.anything(), '/api/verify/session', {
        documentType: 'drivers_license',
      });
    });
  });

  describe('getVerificationSession', () => {
    it('should get a verification session', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'processing' as const,
        createdAt: '2026-01-22T10:00:00Z',
        expiresAt: '2026-01-22T11:00:00Z',
        documentType: 'passport' as const,
      };
      mockedClientGet.mockResolvedValue(mockSession);

      const result = await verificationService.getVerificationSession('session-123');

      expect(result).toEqual(mockSession);
      expect(mockedClientGet).toHaveBeenCalledWith(
        expect.anything(),
        '/api/verify/session/session-123'
      );
    });
  });

  describe('submitVerification', () => {
    it('should submit verification data', async () => {
      const mockResponse = {
        success: true,
        status: 'approved' as const,
        message: 'Verification successful',
        verificationId: 'ver-123',
      };
      mockedClientPost.mockResolvedValue(mockResponse);

      const result = await verificationService.submitVerification('session-123', {
        dateOfBirth: '1990-05-15',
        state: 'CA',
        documentType: 'drivers_license',
        consentGiven: true,
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle 400 errors', async () => {
      mockedClientPost.mockRejectedValue({
        response: { status: 400, data: { message: 'Invalid date format' } },
      });

      const result = await verificationService.submitVerification('session-123', {
        dateOfBirth: 'invalid-date',
        state: 'CA',
        documentType: 'drivers_license',
        consentGiven: true,
      });

      expect(result).toEqual({
        success: false,
        status: 'rejected',
        error: 'Invalid date format',
      });
    });

    it('should handle 422 errors for age requirement', async () => {
      mockedClientPost.mockRejectedValue({
        response: { status: 422, data: { message: 'Must be 21 or older' } },
      });

      const result = await verificationService.submitVerification('session-123', {
        dateOfBirth: '2010-01-01',
        state: 'CA',
        documentType: 'drivers_license',
        consentGiven: true,
      });

      expect(result).toEqual({
        success: false,
        status: 'rejected',
        error: 'Must be 21 or older',
      });
    });

    it('should throw on other errors', async () => {
      mockedClientPost.mockRejectedValue(new Error('Network error'));

      await expect(
        verificationService.submitVerification('session-123', {
          dateOfBirth: '1990-05-15',
          state: 'CA',
          documentType: 'drivers_license',
          consentGiven: true,
        })
      ).rejects.toThrow('Network error');
    });
  });
});
