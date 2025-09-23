import * as yup from 'yup';

// Address form schema (mobile <-> backend) uses `state`.
export const addressSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  phone: yup.string().required('Phone is required'),
  line1: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zipCode: yup.string().matches(/^\d+$/, 'ZIP must be numeric').required('ZIP is required'),
  country: yup.string().required('Country is required'),
  line2: yup.string().nullable().notRequired(),
  isDefault: yup.boolean().notRequired(),
});

export type AddressFormValues = yup.InferType<typeof addressSchema>;
