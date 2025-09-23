import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { getAddresses } from '../../api/phase4Client';
import SavedAddressesScreen from '../../screens/SavedAddressesScreen';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children }: any) => React.createElement('View', null, children),
    Text: ({ children }: any) => React.createElement('Text', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('SafeAreaView', null, children),
    FlatList: (props: any) =>
      React.createElement(
        'View',
        null,
        // render each item via renderItem to mimic RN FlatList
        Array.isArray(props.data)
          ? props.data.map((d: any, i: number) =>
              React.createElement(
                'View',
                { key: d.id || `item-${i}` },
                props.renderItem({ item: d, index: i })
              )
            )
          : null,
        props.ListFooterComponent
          ? React.createElement('View', { key: 'footer' }, props.ListFooterComponent)
          : null
      ),
    Pressable: ({ children, onPress }: any) =>
      React.createElement('Pressable', { onClick: onPress }, children),
    StyleSheet: { create: (s: any) => s },
    LayoutAnimation: { configureNext: jest.fn(), Presets: { easeInEaseOut: {} } },
    UIManager: { setLayoutAnimationEnabledExperimental: jest.fn() },
    Platform: { OS: 'ios' },
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('../../api/phase4Client', () => ({
  __esModule: true,
  getAddresses: jest.fn(),
}));

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

describe('SavedAddressesScreen', () => {
  async function render() {
    const client = new QueryClient();
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(
        <QueryClientProvider client={client}>
          <SavedAddressesScreen />
        </QueryClientProvider>
      );
    });
    return { tree: tree!, client };
  }

  it('renders addresses and default badge', async () => {
    const mockAddrs = [
      { id: '1', fullName: 'Jane Doe', line1: '123 Main', city: 'Detroit', isDefault: true },
      { id: '2', fullName: 'Work', line1: '456 Elm', city: 'Detroit', isDefault: false },
    ];
    (getAddresses as jest.Mock).mockResolvedValue(mockAddrs);
    const { tree } = await render();
    // wait for React Query to settle
    await act(async () => {
      await new Promise(r => process.nextTick(r));
    });
    // should render two address rows
    const texts = tree.root.findAllByType('Text' as any);
    const combined = texts.map(t => (t.props.children || '').toString());
    expect(combined.join('|')).toContain('Jane Doe');
    expect(combined.join('|')).toContain('Default');
    expect(combined.join('|')).toContain('456 Elm');
  });
});
