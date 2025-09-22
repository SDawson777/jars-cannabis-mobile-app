import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { updatePaymentMethod } from '../../clients/paymentClient';
import EditPaymentScreen from '../../screens/EditPaymentScreen';
import { toast } from '../../utils/toast';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children }: any) => React.createElement('View', null, children),
    Text: ({ children }: any) => React.createElement('Text', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('SafeAreaView', null, children),
    TextInput: ({ onChangeText, value, ...props }: any) =>
      React.createElement('TextInput', { onChangeText, value, ...props }),
    Pressable: ({ children, onPress }: any) =>
      React.createElement('Pressable', { onClick: onPress }, children),
    ActivityIndicator: () => React.createElement('ActivityIndicator'),
    StyleSheet: { create: (s: any) => s },
    LayoutAnimation: { configureNext: jest.fn(), Presets: { easeInEaseOut: {} } },
    UIManager: { setLayoutAnimationEnabledExperimental: jest.fn() },
    Platform: { OS: 'ios' },
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({ params: { payment: { id: 'pm-1', cardNumber: '4242', name: 'Jane', expiry: '12/30', cvv: '123' } } }),
}));

jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));

jest.mock('../../clients/paymentClient');
jest.mock('../../utils/toast', () => ({ toast: jest.fn() }));
jest.mock('lucide-react-native', () => ({ ChevronLeft: () => null }));

jest.mock('../../context/ThemeContext', () => {
  const React = require('react');
  return {
    ThemeContext: React.createContext({
      colorTemp: 'neutral',
      jarsPrimary: '#000',
      jarsSecondary: '#888',
      jarsBackground: '#FFF',
    }),
  };
});

describe('EditPaymentScreen form', () => {
  async function render() {
    const client = new QueryClient();
    jest.spyOn(client, 'invalidateQueries');
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(
        <QueryClientProvider client={client}>
          <EditPaymentScreen />
        </QueryClientProvider>
      );
    });
    return { tree: tree!, client };
  }

  it('submits updated data', async () => {
    (updatePaymentMethod as jest.Mock).mockResolvedValue({});
    const { tree, client } = await render();
    const inputs = tree.root.findAllByType('TextInput' as any);
    await act(async () => {
      inputs[0].props.onChangeText('5555555555554444');
      inputs[1].props.onChangeText('Jane Doe Updated');
      inputs[2].props.onChangeText('01/31');
      inputs[3].props.onChangeText('999');
    });
    const button = tree.root.findAllByType('Pressable' as any).slice(-1)[0];
    await act(async () => {
      button.props.onClick();
    });
    expect(updatePaymentMethod).toHaveBeenCalledWith('pm-1', {
      cardNumber: '5555555555554444',
      name: 'Jane Doe Updated',
      expiry: '01/31',
      cvv: '999',
    });
    expect(client.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['paymentMethods'] });
  });

  it('shows toast on api error', async () => {
    (updatePaymentMethod as jest.Mock).mockRejectedValue(new Error('fail'));
    const { tree } = await render();
    const inputs = tree.root.findAllByType('TextInput' as any);
    await act(async () => {
      inputs[0].props.onChangeText('5555555555554444');
      inputs[1].props.onChangeText('Jane Doe Updated');
      inputs[2].props.onChangeText('01/31');
      inputs[3].props.onChangeText('999');
    });
    const button = tree.root.findAllByType('Pressable' as any).slice(-1)[0];
    await act(async () => {
      button.props.onClick();
    });
    expect(toast).toHaveBeenCalledWith('Unable to save payment method. Please try again.');
  });
});
