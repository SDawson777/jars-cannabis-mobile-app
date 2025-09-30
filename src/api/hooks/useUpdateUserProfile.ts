import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '../../utils/toast';
import { phase4Client } from '../phase4Client';
import { clientPut } from '../http';
import type { UserProfile } from './useUserProfile';

async function updateProfile(payload: Partial<UserProfile>) {
  const data = await clientPut<Partial<UserProfile>, UserProfile>(
    phase4Client,
    '/profile',
    payload
  );
  return data;
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) toast(err.message);
      else toast(String(err));
    },
  });
}
