// src/screens/ArticleDetailScreen.tsx
import React, { useContext, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ArticleDetailScreen() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const title = (params as any).title || 'Article';

  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  // Animate in on mount
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  // Dynamic background
  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticLight();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: '#EEEEEE' }]}>
        <Pressable onPress={handleBack} style={styles.iconBtn}>
          <ChevronLeft color="#333333" size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: jarsPrimary }]}>
          {title}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.articleText}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel dui
          vitae risus vulputate convallis. Sed quis lacus non turpis ullamcorper
          cursus. In hac habitasse platea dictumst. Duis nec hendrerit nunc.
          Pellentesque habitant morbi tristique senectus et netus et malesuada
          fames ac turpis egestas. Donec sit amet sapien sed nisi luctus
          ullamcorper. Maecenas quis ex nec sapien tincidunt mollis. Nulla
          facilisi. Curabitur ultrices sem eu tortor tincidunt, quis consequat
          metus suscipit.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  iconBtn: { width: 24, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  content: { padding: 16 },
  articleText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
  },
});
