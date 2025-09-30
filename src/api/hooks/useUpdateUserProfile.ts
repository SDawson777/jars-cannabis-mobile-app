import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '../../utils/toast';
import { phase4Client } from '../phase4Client';

async function updateProfile(payload: any) {
  const res = await phase4Client.put('/profile', payload);
  return res.data;
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
