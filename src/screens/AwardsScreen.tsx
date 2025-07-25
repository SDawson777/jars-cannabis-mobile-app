// src/screens/AwardsScreen.tsxg
import React, { useContext, useEffect, useState, useRef } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  FlatList,
  View,
  Text,
  Image,
  ActivityIndicator,
  Button,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  ListRenderItemInfo,
} from 'react-native';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import ConfettiCannon from 'react-native-confetti-cannon';
import { phase4Client } from '../api/phase4Client';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';
import { trackEvent } from '../utils/analytics';
import { useRedeemReward } from '../api/hooks/useRedeemReward';
import { ChevronLeft, Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { TerpeneWheel } from '../terpene_wheel/components/TerpeneWheel';
import { ALL_TERPENES_DATA } from '../terpene_wheel/data/allTerpenes';
import { TerpeneInfoModal } from '../terpene_wheel/components/TerpeneInfoModal';
import {
  AnimatedSoundPlayer,
  AnimatedSoundPlayerHandle,
} from '../terpene_wheel/components/AnimatedSoundPlayer';
import type { TerpeneInfo } from '../terpene_wheel/data/terpenes';
import type { TerpeneInfo } from '../terpene_wheel/data/terpenes';
import TerpeneInfoModal from '../components/TerpeneWheel/TerpeneInfoModal';

// Define Award type
interface Award {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  earnedDate: string;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AwardsNavProp = NativeStackNavigationProp<RootStackParamList, 'Awards'>;

export default function AwardsScreen() {
  const navigation = useNavigation<AwardsNavProp>();

  // Fetch awards with React Query
  const { data, isLoading, isError, error, refetch } = useQuery<
    { user: { name: string; points: number; tier: string; progress: number }; awards: Award[] },
    Error
  >({
    queryKey: ['awards'],
    queryFn: async () => {
      const res = await phase4Client.get('/awards');
      return res.data;
    },
  });

  const awards = data?.awards ?? [];

  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const [pulse] = useState(new Animated.Value(1));
  const confettiRef = useRef<ConfettiCannon | null>(null);
  const [selectedTerpene, setSelectedTerpene] = useState<TerpeneInfo | null>(null);
  const soundRef = useRef<AnimatedSoundPlayerHandle>(null);

  const user = data?.user ?? { name: '---', tier: '', points: 0, progress: 0 };
  const progressAnim = useRef(new Animated.Value(user.progress)).current;
  const REWARDS = [
    { id: '1', title: '10% Off', points: 100, image: '' },
    { id: '2', title: 'Free Pre-roll', points: 200, image: '' },
    { id: '3', title: 'VIP Event', points: 500, image: '' },
  ];

  const prevAwardsCount = useRef(awards.length);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedTerpene, setSelectedTerpene] = useState<TerpeneInfo | null>(null);

  const onSelectTerpene = (t: TerpeneInfo) => {
    setSelectedTerpene(t);
    bottomSheetRef.current?.present();
  };

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Animate progress bar and trigger confetti on new awards
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: user.progress,
      duration: 500,
      useNativeDriver: false,
    }).start();

    if (awards.length > prevAwardsCount.current) {
      confettiRef.current?.start();
    }
    prevAwardsCount.current = awards.length;
  }, [user.progress, awards.length]);

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const openSettings = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('AppSettings');
  };

  const redeemMutation = useRedeemReward();

  const redeemReward = (reward: (typeof REWARDS)[0]) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    trackEvent('award_item_tap', { id: reward.id });
    redeemMutation.mutate({ id: reward.id, points: reward.points });
  };

  const openFaq = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('HelpFAQ');
  };

  const handleSelectTerpene = (t: TerpeneInfo) => {
    setSelectedTerpene(t);
    soundRef.current?.play();
  };

  // Render each award item
  const renderItem = ({ item }: ListRenderItemInfo<Award>) => (
    <View
      style={[styles.card, { borderColor: jarsPrimary }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${item.title}. Earned ${item.earnedDate}`}
    >
      <Image
        source={{ uri: item.iconUrl }}
        style={styles.icon}
        accessibilityLabel={`${item.title} icon`}
        accessible
      />
      <Text style={[styles.title, { color: jarsPrimary }]}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.date}>Earned: {item.earnedDate}</Text>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: jarsPrimary }]}>Error: {error.message}</Text>
          <Button
            title="Retry"
            onPress={() => {
              hapticMedium();
              refetch();
            }}
            color={jarsPrimary}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
        <Pressable
          onPress={handleBack}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessible
        >
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]} accessibilityRole="header">
          Rewards & Recognition
        </Text>
        <Pressable
          onPress={openSettings}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          accessible
        >
          <Settings color={jarsPrimary} size={24} />
        </Pressable>
      </View>
      <ConfettiCannon
        ref={confettiRef}
        count={75}
        origin={{ x: 0, y: 0 }}
        autoStart={false}
        fadeOut
      />

      <ScrollView>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.name, { color: jarsPrimary }]}>{user.name}</Text>
          <Animated.Text
            style={[styles.points, { color: jarsPrimary, transform: [{ scale: pulse }] }]}
          >
            {user.points} pts
          </Animated.Text>
          <View style={[styles.progressBar, { borderColor: jarsSecondary }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: jarsPrimary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.tier, { color: jarsPrimary }]}>Tier: {user.tier}</Text>
        </View>

        {/* Rewards Carousel */}
        <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Available Rewards</Text>
        <FlatList
          data={REWARDS}
          keyExtractor={r => r.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => redeemReward(item)}
              style={[styles.rewardCard, { borderColor: jarsPrimary }]}
              android_ripple={{ color: `${jarsPrimary}20` }}
              accessibilityRole="button"
              accessibilityLabel={`Redeem ${item.title}`}
              accessible
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles.rewardImage}
                  accessibilityLabel={`${item.title} image`}
                  accessible
                />
              ) : (
                <View
                  style={styles.rewardImagePlaceholder}
                  accessibilityLabel="Placeholder image"
                  accessible
                />
              )}
              <Text style={[styles.rewardTitle, { color: jarsPrimary }]}>{item.title}</Text>
              <Text style={styles.rewardPoints}>{item.points} pts</Text>
            </Pressable>
          )}
        />
    <BottomSheetModalProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
          <Pressable onPress={handleBack} style={styles.iconBtn}>
            <ChevronLeft color={jarsPrimary} size={24} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Rewards & Recognition</Text>
          <Pressable onPress={openSettings} style={styles.iconBtn}>
            <Settings color={jarsPrimary} size={24} />
          </Pressable>
        </View>

        <ScrollView>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={[styles.name, { color: jarsPrimary }]}>{user.name}</Text>
            <Animated.Text
              style={[styles.points, { color: jarsPrimary, transform: [{ scale: pulse }] }]}
            >
              {user.points} pts
            </Animated.Text>
            <View style={[styles.progressBar, { borderColor: jarsSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: jarsPrimary, width: `${user.progress * 100}%` },
                ]}
              />
            </View>
            <Text style={[styles.tier, { color: jarsPrimary }]}>Tier: {user.tier}</Text>
          </View>


        {/* Terpene Wheel */}
        <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Exclusive Insights</Text>
        <View style={styles.wheelContainer}>
          <TerpeneWheel data={ALL_TERPENES_DATA} onSelect={handleSelectTerpene} />
        </View>
        <TerpeneInfoModal
          terpene={selectedTerpene}
          visible={!!selectedTerpene}
          onClose={() => setSelectedTerpene(null)}
        />
        <AnimatedSoundPlayer ref={soundRef} source={require('../assets/rustle_leaves_swipe.mp3')} />

          {/* Rewards Carousel */}
          <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Available Rewards</Text>
          <FlatList
            data={REWARDS}
            keyExtractor={r => r.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => redeemReward(item)}
                style={[styles.rewardCard, { borderColor: jarsPrimary }]}
                android_ripple={{ color: `${jarsPrimary}20` }}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.rewardImage} />
                ) : (
                  <View style={styles.rewardImagePlaceholder} />
                )}
                <Text style={[styles.rewardTitle, { color: jarsPrimary }]}>{item.title}</Text>
                <Text style={styles.rewardPoints}>{item.points} pts</Text>
              </Pressable>
            )}
          />



        {/* FAQ Link */}
        <Pressable
          onPress={openFaq}
          style={styles.linkRow}
          accessibilityRole="button"
          accessibilityLabel="Open Loyalty FAQs"
          accessible
        >
          <Text style={[styles.linkText, { color: jarsPrimary }]}>Loyalty FAQs</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>

          {/* Terpene Wheel */}
          <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Exclusive Insights</Text>
          <View style={styles.wheelWrapper}>
            <TerpeneWheel onSelect={onSelectTerpene} />
          </View>

          {/* Reward History */}
          <Text style={[styles.sectionTitle, { color: jarsPrimary }]}>Reward History</Text>
          <FlatList
            data={awards ?? []}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            scrollEnabled={false}
          />

          {/* FAQ Link */}
          <Pressable onPress={openFaq} style={styles.linkRow}>
            <Text style={[styles.linkText, { color: jarsPrimary }]}>Loyalty FAQs</Text>
          </Pressable>
        </ScrollView>
        <TerpeneInfoModal ref={bottomSheetRef} info={selectedTerpene} />
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  iconBtn: { width: 24, alignItems: 'center' },
  hero: { alignItems: 'center', padding: 16 },
  name: { fontSize: 18, marginBottom: 4 },
  points: { fontSize: 32, fontWeight: '700' },
  progressBar: {
    height: 8,
    width: '80%',
    borderWidth: 1,
    borderRadius: 4,
    marginVertical: 8,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  tier: { fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  carousel: { paddingHorizontal: 16 },
  rewardCard: {
    width: 140,
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    backgroundColor: '#FFF',
  },
  rewardImage: { width: '100%', height: 80, marginBottom: 8, borderRadius: 8 },
  rewardImagePlaceholder: {
    width: '100%',
    height: 80,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#EEE',
  },
  rewardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  rewardPoints: { fontSize: 12, color: '#777' },

  wheelContainer: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  wheelWrapper: { alignItems: 'center', marginVertical: 16 },

  list: { paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  icon: { width: 40, height: 40, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600' },
  desc: { fontSize: 14, marginVertical: 4 },
  date: { fontSize: 12, color: '#777' },
  linkRow: { alignItems: 'center', padding: 16 },
  linkText: { fontSize: 16, textDecorationLine: 'underline' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, marginBottom: 8 },
});
