import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '../../utils/toast';
import { phase4Client } from '../phase4Client';

export interface PrivacyPreferences {
  highContrast: boolean;
}

async function fetchPrefs(): Promise<PrivacyPreferences> {
  const res = await phase4Client.get('/profile/preferences');
  return res.data;
}

async function updatePrefs(payload: PrivacyPreferences) {
  const res = await phase4Client.put('/profile/preferences', payload);
  return res.data;
}

export function usePrivacyPreferences() {
  const queryClient = useQueryClient();
  const query = useQuery<PrivacyPreferences, Error>({
    queryKey: ['privacy-preferences'],
    queryFn: fetchPrefs,
  });

  const mutation = useMutation({
    mutationFn: updatePrefs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-preferences'] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) toast(err.message);
      else toast(String(err));
    },
  });

  return { ...query, updatePreferences: mutation.mutate };
}
