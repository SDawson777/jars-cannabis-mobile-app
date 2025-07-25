import { useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../phase4Client';
import { toast } from '../../utils/toast';

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
    onError: err => {
      toast((err as Error).message);
    },
  });
}
