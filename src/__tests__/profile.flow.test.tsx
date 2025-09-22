import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import EditProfileScreen from '../screens/EditProfileScreen';
import * as phase4 from '../api/phase4Client';

jest.mock('../api/phase4Client');

const mocked = phase4 as jest.Mocked<typeof phase4>;

const mockNavigation = { goBack: jest.fn() } as any;
const params = { profile: { id: 'u-1', name: 'Old Name', email: 'old@example.com', phone: '+10000000000' } } as any;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params }),
}));

describe('EditProfileScreen flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends PUT with name and phone and navigates back', async () => {
    const qc = new QueryClient();
    // phase4Client is exported from the module; ensure its `put` is mocked
    if ((mocked as any).phase4Client) {
      (mocked as any).phase4Client.put = jest.fn().mockResolvedValue({ data: { id: 'u-1', name: 'New Name', email: 'old@example.com', phone: '+15551234567' } });
    } else if ((mocked as any).put) {
      (mocked as any).put.mockResolvedValue({ data: { id: 'u-1', name: 'New Name', email: 'old@example.com', phone: '+15551234567' } });
    } else {
      // Fallback: create a phase4Client mock
      (mocked as any).phase4Client = { put: jest.fn().mockResolvedValue({ data: { id: 'u-1', name: 'New Name', email: 'old@example.com', phone: '+15551234567' } }) };
    }

    const { getByPlaceholderText, getByText } = render(
      <QueryClientProvider client={qc}>
        <EditProfileScreen />
      </QueryClientProvider>
    );

    const nameInput = getByPlaceholderText('Full Name');
    const phoneInput = getByPlaceholderText('Phone Number');

    fireEvent.changeText(nameInput, 'New Name');
    fireEvent.changeText(phoneInput, '+15551234567');

  const saveBtn = getByText('Save Profile');
  fireEvent.press(saveBtn);

  // phase4Client is exported as `phase4Client`; assert the put on that object
  const client = (mocked as any).phase4Client;
  await waitFor(() => expect(client.put).toHaveBeenCalledWith('/profile', expect.objectContaining({ name: 'New Name', phone: '+15551234567' })));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
