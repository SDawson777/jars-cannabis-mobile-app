import React, { useRef, useEffect } from 'react';
import { Pressable, AccessibilityInfo, Alert } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

export default function PoweredByAIBadge({ onPress }: { onPress?: () => void }) {
  const animation = useRef<LottieView>(null);
  const navigation = useNavigation();

  useEffect(() => {
    animation.current?.play();
  }, []);

  const showTooltip = () => {
    Alert.alert(
      'Why am I seeing this?',
      'Your recommendations are powered by on-device AI and your preferences.'
    );
  };

  const handle = () => {
    onPress?.();
    // @ts-ignore next-line
    navigation.navigate('EthicalAIScreen');
  };

  return (
    <Pressable
      onPress={handle}
      onLongPress={showTooltip}
      testID="forYouCard_poweredByAI"
      accessibilityLabel="Powered by AI badge"
    >
      <LottieView
        ref={animation}
        loop
        source={require('../assets/lottie/ai-badge-bounce.json')}
        style={{ width: 40, height: 40 }}
      />
    </Pressable>
  );
}
