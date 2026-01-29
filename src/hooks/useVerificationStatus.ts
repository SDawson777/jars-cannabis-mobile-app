// src/hooks/useVerificationStatus.ts
// Hook to fetch user's ID verification status

import { useQuery } from '@tanstack/react-query';
import verificationService, { UserVerificationStatus } from '../services/verificationService';

export const VERIFICATION_STATUS_KEY = ['verification', 'status'];

export function useVerificationStatus() {
  return useQuery<UserVerificationStatus>({
    queryKey: VERIFICATION_STATUS_KEY,
    queryFn: () => verificationService.getUserVerificationStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

export default useVerificationStatus;
