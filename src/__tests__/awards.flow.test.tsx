import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import renderer, { act } from 'react-test-renderer';

jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: ({ children }: any) => React.createElement('View', null, children),
    Text: ({ children }: any) => React.createElement('Text', null, children),
    SafeAreaView: ({ children }: any) => React.createElement('SafeAreaView', null, children),
    ScrollView: ({ children }: any) => React.createElement('ScrollView', null, children),
    FlatList: ({ data, renderItem, keyExtractor }: any) =>
      React.createElement(
        'FlatList',
        null,
        data.map((item: any, i: number) => {
          const rendered = renderItem({ item, index: i });
          // ensure a key prop to avoid React warnings in tests
          return React.cloneElement(rendered, {
            key: keyExtractor ? keyExtractor(item) : (item.id ?? i),
          });
        })
      ),
    Image: () => React.createElement('Image'),
    ActivityIndicator: () => React.createElement('ActivityIndicator'),
    Button: ({ title, onPress, ...rest }: any) =>
      React.createElement('button', { onClick: onPress, ...rest }, title),
    Pressable: ({ children, onPress, ...rest }: any) =>
      React.createElement('button', { onClick: onPress, ...rest }, children),
    Platform: { OS: 'ios' },
    UIManager: { setLayoutAnimationEnabledExperimental: () => {} },
    Animated: {
      Text: (props: any) => React.createElement('Text', props, props.children),
      View: (props: any) => React.createElement('View', props, props.children),
      Value: class {
        _v: any;
        constructor(v: any) {
          this._v = v;
        }
        interpolate(opts: any) {
          return typeof opts?.outputRange?.[1] !== 'undefined' ? opts.outputRange[1] : this._v;
        }
      },
      timing: () => ({ start: () => {} }),
      loop: (__x: any) => ({ start: () => {}, stop: () => {} }),
      sequence: (__a: any) => ({}),
    },
    LayoutAnimation: { configureNext: () => {}, Presets: { easeInEaseOut: {} } },
    StyleSheet: { create: (s: any) => s },
  };
});

jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');

jest.mock('../api/phase4Client');
jest.mock('lucide-react-native', () => ({ Settings: () => null, ChevronLeft: () => null }));
import { phase4Client } from '../api/phase4Client';
import AwardsScreen from '../screens/AwardsScreen';
import { toast } from '../utils/toast';

jest.mock('../utils/toast');

describe('Awards flow', () => {
  it('loads awards and redeems a reward', async () => {
    (phase4Client.get as jest.Mock).mockResolvedValue({
      data: {
        user: { name: 'Test', points: 500, tier: 'Gold', progress: 0.5 },
        awards: [
          { id: 'a1', title: 'Badge', description: 'Desc', iconUrl: '', earnedDate: '2025-01-01' },
        ],
      },
    });
    (phase4Client.post as jest.Mock).mockResolvedValue({ data: { success: true } });

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let tree: renderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = renderer.create(
        <QueryClientProvider client={client}>
          <AwardsScreen />
        </QueryClientProvider>
      );
      await new Promise(r => setTimeout(r, 0));
      await new Promise(r => setTimeout(r, 0));
    });

    // Ensure awards were rendered
    const texts = tree!.root
      .findAllByType('Text' as any)
      .map((n: any) =>
        Array.isArray(n.props.children) ? n.props.children.join('') : n.props.children
      );
    expect(texts.join(' ')).toContain('Badge');

    // Simulate pressing the first reward (REWARDS array uses static entries; ensure redeem is called)
    const buttons = tree!.root.findAllByType('button' as any);
    // find Redeem button by accessibilityLabel
    const redeemButton = buttons.find((b: any) =>
      (b.props.accessibilityLabel || '').startsWith('Redeem')
    );
    expect(redeemButton).toBeDefined();
    await act(async () => {
      redeemButton!.props.onClick();
      await new Promise(r => setTimeout(r, 0));
    });

    expect(phase4Client.post).toHaveBeenCalled();
    expect(toast).toHaveBeenCalled();
  });
});
