// src/screens/ConciergeChatScreen.tsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Send } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ThemeContext } from '../context/ThemeContext';
import { hapticLight, hapticMedium } from '../utils/haptic';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'ConciergeChat'>;

export default function ConciergeChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const { colorTemp, jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : jarsBackground;

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi, how can I assist you today?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticMedium();
    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Let me look that up for you…',
          sender: 'bot',
        },
      ]);
    }, 1000);
  };

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: jarsSecondary }]}>
          <Pressable onPress={handleBack}>
            <Send color={jarsPrimary} size={24} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: jarsPrimary }]}>Concierge Chat</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContainer}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === 'user'
                  ? [styles.userBubble, { backgroundColor: jarsPrimary }]
                  : [styles.botBubble, { backgroundColor: jarsBackground }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.sender === 'user' ? { color: '#FFFFFF' } : { color: jarsPrimary },
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            { borderTopColor: jarsSecondary, backgroundColor: jarsBackground },
          ]}
        >
          <TextInput
            style={[styles.input, { backgroundColor: jarsBackground, color: jarsPrimary }]}
            placeholder="Type your message..."
            placeholderTextColor={jarsSecondary}
            value={input}
            onChangeText={text => {
              hapticLight();
              setInput(text);
            }}
          />
          <Pressable
            style={[styles.sendButton, { backgroundColor: jarsPrimary }]}
            onPress={sendMessage}
          >
            <Send size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  chatContainer: { padding: 16, paddingBottom: 80 },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  userBubble: { alignSelf: 'flex-end' },
  botBubble: {
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
