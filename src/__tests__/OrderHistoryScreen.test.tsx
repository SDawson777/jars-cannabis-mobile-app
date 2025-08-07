import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children }: any) => React.createElement('View', null, children),
    Text: ({ children }: any) => React.createElement('Text', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('SafeAreaView', null, children),
    FlatList: ({ data, renderItem }: any) =>
      React.createElement(
        'FlatList',
        null,
        data.map((item: any, index: number) => renderItem({ item, index }))
      ),
    RefreshControl: () => null,
    ActivityIndicator: () => React.createElement('ActivityIndicator'),
    Pressable: ({ children, onPress }: any) =>
      React.createElement('Pressable', { onClick: onPress }, children),
    Modal: ({ children }: any) => React.createElement('Modal', null, children),
    ScrollView: ({ children }: any) => React.createElement('ScrollView', null, children),
    StyleSheet: { create: (s: any) => s },
  };
});

jest.mock('lucide-react-native', () => ({
  X: () => null,
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('../context/ThemeContext', () => {
  const React = require('react');
  return {
    ThemeContext: React.createContext({
      colorTemp: 'neutral',
      jarsPrimary: '#000',
      jarsSecondary: '#888',
      jarsBackground: '#FFF',
      loading: false,
    }),
  };
});

import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import * as orderClient from '../clients/orderClient';

jest.mock('../clients/orderClient');
jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
  hapticMedium: jest.fn(),
}));
jest.mock('../components/useSkeletonText', () => () => null);

describe('OrderHistoryScreen', () => {
  it('renders orders from api', async () => {
    (orderClient.fetchOrders as jest.Mock).mockResolvedValue({
      orders: [
        {
          id: '1',
          createdAt: '2025-01-01',
          total: 10,
          status: 'Completed',
          store: 'Store',
          items: [],
          subtotal: 8,
          taxes: 1,
          fees: 1,
        },
      ],
    });

    const client = new QueryClient();
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(
        <QueryClientProvider client={client}>
          <OrderHistoryScreen />
        </QueryClientProvider>
      );
    });
    await act(async () => {});

    const texts = tree!.root
      .findAllByType('Text' as any)
      .map(n => (Array.isArray(n.props.children) ? n.props.children.join('') : n.props.children));
    expect(texts).toContain('Order #1');
  });
});
