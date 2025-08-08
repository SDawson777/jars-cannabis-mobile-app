import * as yup from 'yup';

export const addressSchema = yup.object({
  label: yup.string().required('Label is required'),
  line1: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zip: yup
    .string()
    .matches(/^\d+$/, 'ZIP must be numeric')
    .required('ZIP is required'),
});

export type AddressFormValues = yup.InferType<typeof addressSchema>;
