import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '../../utils/toast';
import { phase4Client } from '../phase4Client';

interface RewardPayload {
  id: string;
}

async function redeemReward(reward: RewardPayload) {
  return phase4Client.post(`/awards/${reward.id}/redeem`).then(r => r.data);
}

export function useRedeemReward() {
  const queryClient = useQueryClient();
  return useMutation<any, Error, RewardPayload>({
    mutationFn: redeemReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      queryClient.invalidateQueries({ queryKey: ['loyaltyStatus'] });
      toast('Reward redeemed');
    },
    onError: (err: Error) => toast(err.message),
  });
}
