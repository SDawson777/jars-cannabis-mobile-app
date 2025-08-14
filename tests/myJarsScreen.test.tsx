import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import MyJarsScreen from '../src/screens/MyJarsScreen';
import { ThemeContext } from '../src/context/ThemeContext';
import { getStash } from '../src/api/phase4Client';
import type { StashItem } from '../src/@types/jars';

jest.mock('../src/api/phase4Client');

describe('MyJarsScreen', () => {
  it('renders fetched items', async () => {
    const sample: StashItem[] = [
      {
        id: '1',
        name: 'Blue Dream',
        strainType: 'Hybrid',
        purchaseDate: '2025-07-20',
        status: 'in_stock',
      },
    ];
    (getStash as jest.Mock).mockResolvedValue(sample);
    const queryClient = new QueryClient();
    let tree: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <NavigationContainer>
          <ThemeContext.Provider
            value={{
              colorTemp: 'neutral',
              jarsPrimary: '#2E5D46',
              jarsSecondary: '#8CD24C',
              jarsBackground: '#F9F9F9',
              loading: false,
            }}
          >
            <QueryClientProvider client={queryClient}>
              <MyJarsScreen />
            </QueryClientProvider>
          </ThemeContext.Provider>
        </NavigationContainer>
      );
    });
    await act(async () => {});
    expect(tree!.root.findAllByProps({ children: 'Blue Dream' }).length).toBeGreaterThan(0);
  });
});
