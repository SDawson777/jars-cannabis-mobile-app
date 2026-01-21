import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useUserProfile,
  useMyProfile,
  useUpdateProfile,
  useFollowUser,
  useUnfollowUser,
} from '../../hooks/useCommunity';
import * as http from '../../api/http';
import { logEvent } from '../../utils/analytics';

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
  clientDelete: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserProfile hook', () => {
  const mockProfile = {
    id: 'user-123',
    username: 'johndoe',
    displayName: 'John Doe',
    bio: 'Cannabis enthusiast',
    joinedAt: '2024-01-01',
    isVerified: true,
    followerCount: 100,
    followingCount: 50,
    reviewCount: 25,
    badgeCount: 5,
    points: 1500,
    tier: 'gold',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user profile', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockProfile);

    const { result } = renderHook(() => useUserProfile('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProfile);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/community/users/user-123');
  });

  it('should not fetch when userId is empty', () => {
    const { result } = renderHook(() => useUserProfile(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(http.clientGet).not.toHaveBeenCalled();
  });
});

describe('useMyProfile hook', () => {
  const mockMyProfile = {
    id: 'me-123',
    username: 'myusername',
    displayName: 'My Name',
    bio: 'About me',
    joinedAt: '2024-01-01',
    isVerified: false,
    followerCount: 10,
    followingCount: 20,
    reviewCount: 5,
    badgeCount: 2,
    points: 500,
    tier: 'silver',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch current user profile', async () => {
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockMyProfile);

    const { result } = renderHook(() => useMyProfile(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockMyProfile);
    expect(http.clientGet).toHaveBeenCalledWith(expect.anything(), '/community/me');
  });
});

describe('useUpdateProfile hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update profile', async () => {
    const updatedProfile = { displayName: 'New Name', bio: 'New bio' };
    (http.clientPost as jest.Mock).mockResolvedValueOnce({
      ...updatedProfile,
      id: 'me-123',
    });

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ displayName: 'New Name', bio: 'New bio' });
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/community/me', {
      displayName: 'New Name',
      bio: 'New bio',
    });
    expect(logEvent).toHaveBeenCalledWith('profile_updated', {
      fields: ['displayName', 'bio'],
    });
  });
});

describe('useFollowUser hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should follow a user', async () => {
    (http.clientPost as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useFollowUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('user-456');
    });

    expect(http.clientPost).toHaveBeenCalledWith(
      expect.anything(),
      '/community/users/user-456/follow',
      {}
    );
    expect(logEvent).toHaveBeenCalledWith('user_followed', { userId: 'user-456' });
  });
});

describe('useUnfollowUser hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should unfollow a user', async () => {
    (http.clientDelete as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUnfollowUser(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('user-456');
    });

    expect(http.clientDelete).toHaveBeenCalledWith(
      expect.anything(),
      '/community/users/user-456/follow'
    );
    expect(logEvent).toHaveBeenCalledWith('user_unfollowed', { userId: 'user-456' });
  });
});
