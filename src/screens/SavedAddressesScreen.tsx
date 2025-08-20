// src/screens/SavedAddressesScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, ChevronRight } from 'lucide-react-native';
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

import { ThemeContext } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight, hapticMedium } from '../utils/haptic';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SavedAddressesNavProp = NativeStackNavigationProp<RootStackParamList, 'SavedAddresses'>;

interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
}

const initial: Address[] = [
  { id: '1', label: 'Home', line1: '123 Main St', city: 'Detroit, MI' },
  { id: '2', label: 'Work', line1: '456 Elm St', city: 'Detroit, MI' },
];

export default function SavedAddressesScreen() {
  const navigation = useNavigation<SavedAddressesNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);
  const [addresses] = useState<Address[]>(initial);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [addresses]);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const handleEdit = (addr: Address) => {
    hapticMedium();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('EditAddress', { address: addr });
  };

  const handleAdd = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.navigate('AddAddress');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <FlatList
        data={addresses}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: jarsSecondary }]}
            android_ripple={{ color: `${jarsSecondary}20` }}
            onPress={() => handleEdit(item)}
          >
            <View>
              <Text style={[styles.label, { color: jarsPrimary }]}>{item.label}</Text>
              <Text style={[styles.subLabel, { color: jarsSecondary }]}>
                {item.line1}, {item.city}
              </Text>
            </View>
            <ChevronRight color={jarsPrimary} size={20} />
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable
            style={[styles.addBtn, { borderColor: jarsSecondary }]}
            android_ripple={{ color: `${jarsSecondary}20` }}
            onPress={handleAdd}
          >
            <Plus color={jarsSecondary} size={20} />
            <Text style={[styles.addText, { color: jarsSecondary }]}>Add New Address</Text>
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
  },
  label: { fontSize: 16, fontWeight: '600' },
  subLabel: { fontSize: 14, marginTop: 4 },
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
