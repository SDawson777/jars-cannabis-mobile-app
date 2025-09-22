import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import ArticleListScreen from '../screens/ArticleListScreen';
import AwardsScreen from '../screens/AwardsScreen';
import CommunityGardenScreen from '../screens/CommunityGardenScreen';
import ConciergeChatScreen from '../screens/ConciergeChatScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
import DataTransparencyScreen from '../screens/DataTransparencyScreen';
import EducationalGreenhouseScreen from '../screens/EducationalGreenhouseScreen';
import EthicalAIDashboardScreen from '../screens/EthicalAIDashboardScreen';
import HelpFAQScreen from '../screens/HelpFAQScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import PrivacyIntelligenceScreen from '../screens/PrivacyIntelligenceScreen';
import TerpeneWheelScreen from '../screens/TerpeneWheelScreen';
import LegalScreen from '../screens/profile/LegalScreen';

export type ContentStackParamList = {
  EducationalGreenhouse: undefined;
  ArticleList: undefined;
  ArticleDetail: { slug: string };
  TerpeneWheel: undefined;
  CommunityGarden: undefined;
  DataTransparency: undefined;
  PrivacyIntelligence: undefined;
  Awards: undefined;
  EthicalAIDashboard: undefined;
  HelpFAQ: undefined;
  ContactUs: undefined;
  ConciergeChat: undefined;
  Legal: undefined;
  LanguageSelection: undefined;
};

const Stack = createNativeStackNavigator<ContentStackParamList>();

export default function ContentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EducationalGreenhouse" component={EducationalGreenhouseScreen} />
      <Stack.Screen name="ArticleList" component={ArticleListScreen} />
      <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
      <Stack.Screen name="TerpeneWheel" component={TerpeneWheelScreen} />
      <Stack.Screen name="CommunityGarden" component={CommunityGardenScreen} />
      <Stack.Screen name="DataTransparency" component={DataTransparencyScreen} />
      <Stack.Screen name="PrivacyIntelligence" component={PrivacyIntelligenceScreen} />
      <Stack.Screen name="Awards" component={AwardsScreen} />
      <Stack.Screen name="EthicalAIDashboard" component={EthicalAIDashboardScreen} />
      <Stack.Screen name="HelpFAQ" component={HelpFAQScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="ConciergeChat" component={ConciergeChatScreen} />
      <Stack.Screen name="Legal" component={LegalScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
    </Stack.Navigator>
  );
}
