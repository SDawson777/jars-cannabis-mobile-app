import * as yup from 'yup';

export const profileSchema = yup.object({
  name: yup.string().min(2, 'Name too short').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
});

export type ProfileFormValues = yup.InferType<typeof profileSchema>;
