import React, { useContext } from 'react';
import { SafeAreaView, View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ThemeContext } from '../../context/ThemeContext';
import { requestPasswordReset } from '../../clients/authClient';
import { toast } from '../../utils/toast';
import { forgotPasswordSchema } from './forgotPasswordSchema';
import type { RootStackParamList } from '../../navigation/types';

type FormData = { email: string };

type ForgotPasswordNavProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavProp>();
  const { jarsPrimary, jarsSecondary, jarsBackground } = useContext(ThemeContext);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async ({ email }: FormData) => {
    try {
      await requestPasswordReset(email);
      toast('Check your email for reset instructions.');
      navigation.goBack();
    } catch {
      toast('Unable to send reset email. Please try again.');
    }
  };

  return (
    <SafeAreaView
      className="flex-1 p-4"
      style={{ backgroundColor: jarsBackground }}
      accessibilityViewIsModal
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        accessibilityHint="Return to the previous screen"
        onPress={() => navigation.goBack()}
        className="mb-6 w-20"
      >
        <Text style={{ color: jarsPrimary }}>{'<'} Back</Text>
      </Pressable>
      <View className="flex-1">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="border rounded-lg p-3 mb-2"
              style={{
                borderColor: errors.email ? 'red' : jarsSecondary,
                color: jarsPrimary,
                backgroundColor: '#FFF',
              }}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              accessibilityLabel="Email address"
              accessibilityHint="Enter the email associated with your account"
            />
          )}
        />
        {errors.email && <Text className="text-red-500 mb-4">{errors.email.message}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send reset link"
          accessibilityHint="Sends a password reset email"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          className={`rounded-lg py-3 items-center ${isValid ? '' : 'opacity-50'}`}
          style={{ backgroundColor: jarsPrimary }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={{ color: '#FFF', fontWeight: '600' }}>Send Reset Link</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
