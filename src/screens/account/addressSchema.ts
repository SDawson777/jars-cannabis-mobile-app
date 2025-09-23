import * as yup from 'yup';

// NOTE: Previously this schema used `_state` which did not match the backend API (`state`).
// We have renamed the field to `state` end-to-end. If any persisted data or navigation params
// still provide `_state`, the screens now map it into `state` when setting default values.
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
