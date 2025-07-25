import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { phase4Client } from '../phase4Client';
import { hapticError, hapticSuccess } from '../../utils/haptic';
import { trackEvent } from '../../utils/analytics';

interface RewardPayload {
  id: string;
  points: number;
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RewardPayload, { previous: any | undefined }>({
    mutationFn: async reward => {
      trackEvent('reward_redeem_attempt', { id: reward.id });
      await phase4Client.post(`/rewards/${reward.id}/redeem`);
    },
    onMutate: async reward => {
      await queryClient.cancelQueries({ queryKey: ['awards'] });
      const previous = queryClient.getQueryData<any>(['awards']);
      queryClient.setQueryData(['awards'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          user: { ...old.user, points: old.user.points - reward.points },
        };
      });
      return { previous };
    },
    onError: (err, reward, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['awards'], context.previous);
      }
      trackEvent('reward_redeem_failed', { id: reward.id, message: err.message });
      hapticError();
      Alert.alert('Redemption Failed', err.message);
    },
    onSuccess: (_, reward) => {
      trackEvent('reward_redeemed', { id: reward.id });
      hapticSuccess();
      Alert.alert('Reward Redeemed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      queryClient.invalidateQueries({ queryKey: ['awards-status'] });
    },
  });
}
