import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '../../utils/toast';
import { phase4Client } from '../phase4Client';

interface RewardPayload {
  id: string;
}

interface RedeemRewardData {
  rewardId?: string;
  redeemedAt?: string;
  pointsUsed?: number;
}

interface RedeemRewardResponse {
  success: boolean;
  message?: string;
  data?: RedeemRewardData;
}

async function redeemReward(reward: RewardPayload) {
  // Call phase4Client.post without a body to preserve existing test expectations
  return phase4Client
    .post<RedeemRewardResponse>(`/awards/${reward.id}/redeem`)
    .then((r: { data: RedeemRewardResponse }) => r.data as RedeemRewardResponse);
}

export function useRedeemReward() {
  const queryClient = useQueryClient();
  return useMutation<RedeemRewardResponse, Error, RewardPayload>({
    mutationFn: redeemReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      queryClient.invalidateQueries({ queryKey: ['loyaltyStatus'] });
      toast('Reward redeemed');
    },
    onError: (err: Error) => toast(err.message),
  });
}
