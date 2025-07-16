// src/screens/SavedPaymentsScreen.tsx
import React, { useEffect, useContext, useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Plus, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Typed navigation prop
type SavedPaymentsNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'SavedPayments'
>;

interface PaymentMethod {
  id: string;
  label: string;
}

const initialMethods: PaymentMethod[] = [
  { id: '1', label: 'Visa ****1234' },
  { id: '2', label: 'Mastercard ****5678' },
];

export default function SavedPaymentsScreen() {
  const navigation = useNavigation<SavedPaymentsNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [methods]);

  const bgColor =
    colorTemp === 'warm'
      ? '#FAF8F4'
      : colorTemp === 'cool'
      ? '#F7F9FA'
      : jarsBackground;

  const handleEdit = (pm: PaymentMethod) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('EditPayment', { payment: pm });
  };

  const handleAdd = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('AddPayment');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={methods}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => handleEdit(item)}>
            <Text style={[styles.label, { color: jarsPrimary }]}>{item.label}</Text>
            <ChevronRight color={jarsPrimary} size={20} />
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable
            style={[styles.addBtn, { borderColor: jarsSecondary }]}
            onPress={handleAdd}
          >
            <Plus color={jarsSecondary} size={20} />
            <Text style={[styles.addText, { color: jarsSecondary }]}>
              Add New Payment
            </Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: { fontSize: 16 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addText: { marginLeft: 8, fontSize: 16, fontWeight: '600' },
});
