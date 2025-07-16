// src/screens/StoreDetailsScreen.tsx
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { ChevronLeft, MapPin, Phone } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StoreDetailsScreen({ navigation, route }: any) {
  const store = route.params?.store || {
    name: 'Jars Downtown',
    address: '123 Main St, Detroit, MI',
    phone: '+1 (800) 555-1234',
    hours: '9am–9pm',
    image: require('../assets/store.jpg'),
  };
  const { colorTemp, jarsPrimary, jarsBackground } = useContext(ThemeContext);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { borderBottomColor: '#EEE' }]}>
        <Pressable onPress={handleBack}>
          <ChevronLeft color={jarsPrimary} size={24} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={store.image} style={styles.image} />
        <Text style={[styles.name, { color: jarsPrimary }]}>{store.name}</Text>
        <View style={styles.row}>
          <MapPin size={20} color={jarsPrimary} />
          <Text style={styles.text}>{store.address}</Text>
        </View>
        <View style={styles.row}>
          <Phone size={20} color={jarsPrimary} />
          <Text style={styles.text}>{store.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Hours:</Text>
          <Text style={styles.text}>{store.hours}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', padding: 16 },
  content: { padding: 16, alignItems: 'center' },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  text: { fontSize: 16, marginLeft: 8 },
  label: { fontSize: 16, fontWeight: '600', marginRight: 8 },
});
