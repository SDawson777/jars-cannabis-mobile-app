import { useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../phase4Client';
import { toast } from '../../utils/toast';

interface RewardPayload {
  id: string;
  points: number;
}

async function redeemReward(reward: RewardPayload) {
  await phase4Client.post(`/rewards/${reward.id}/redeem`);
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  const optimisticRollback = async (
    reward: RewardPayload
  ): Promise<{ previous: any | undefined }> => {
    await queryClient.cancelQueries({ queryKey: ['loyaltyStatus'] });
    const previous = queryClient.getQueryData(['loyaltyStatus']);
    queryClient.setQueryData(['loyaltyStatus'], (old: any) => {
      if (!old) return old;
      return { ...old, points: old.points - reward.points };
    });
    return { previous };
  };

  const rollback = (err: Error, _reward: RewardPayload, context?: { previous?: any }) => {
    if (context?.previous) {
      queryClient.setQueryData(['loyaltyStatus'], context.previous);
    }
    toast(err.message);
  };

  return useMutation<void, Error, RewardPayload, { previous?: any }>({
    mutationFn: redeemReward,
    onMutate: optimisticRollback,
    onError: rollback,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['loyaltyStatus'] });
    },
  });
}
