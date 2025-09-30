import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '../../utils/toast';
import { phase4Client } from '../phase4Client';
import { clientGet, clientPost } from '../http';

export interface PrivacyPreferences {
  highContrast: boolean;
}

async function fetchPrefs(): Promise<PrivacyPreferences> {
  return clientGet<PrivacyPreferences>(phase4Client, '/profile/preferences');
}

async function updatePrefs(payload: PrivacyPreferences) {
  return clientPost<PrivacyPreferences, PrivacyPreferences>(
    phase4Client,
    '/profile/preferences',
    payload
  );
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
