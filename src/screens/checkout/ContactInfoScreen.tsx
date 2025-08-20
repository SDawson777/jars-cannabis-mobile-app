import { Formik } from 'formik';
import React from 'react';
import {
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Yup from 'yup';

export const contactInfoSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  email: Yup.string().email('Invalid').required('Required'),
  phone: Yup.string().required('Required'),
});

interface Props {
  onNext: (values: { name: string; email: string; phone: string }) => void;
}

export default function ContactInfoScreen({ onNext }: Props) {
  return (
    <Formik
      initialValues={{ name: '', email: '', phone: '' }}
      validationSchema={contactInfoSchema}
      onSubmit={onNext}
    >
      {({ handleChange, handleSubmit, values, errors, touched }) => (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={values.name}
            onChangeText={handleChange('name')}
          />
          {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={values.email}
            onChangeText={handleChange('email')}
            keyboardType="email-address"
          />
          {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}
          <TextInput
            placeholder="Phone"
            style={styles.input}
            value={values.phone}
            onChangeText={handleChange('phone')}
            keyboardType="phone-pad"
          />
          {touched.phone && errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
          <Pressable onPress={() => handleSubmit()} style={styles.button}>
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        </KeyboardAvoidingView>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
  button: {
    backgroundColor: '#2E5D46',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#B00020', fontSize: 12, marginBottom: 4 },
});
