// src/hooks/useCommunity.ts
// Community and social engagement - followers, reviews, likes, comments, badges

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { phase4Client } from '../api/phase4Client';
import { clientGet, clientPost, clientDelete } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  reviewCount: number;
  badgeCount: number;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  author: Pick<UserProfile, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'isVerified'>;
  type: 'review' | 'question' | 'tip' | 'experience' | 'photo';
  content: string;
  images?: string[];
  productId?: string;
  productName?: string;
  rating?: number; // 1-5 for reviews
  effects?: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: Pick<UserProfile, 'id' | 'username' | 'displayName' | 'avatarUrl' | 'isVerified'>;
  content: string;
  likeCount: number;
  isLiked: boolean;
  replyCount: number;
  parentCommentId?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'engagement' | 'expertise' | 'loyalty' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt?: string;
  progress?: number; // 0-100 for in-progress badges
  requirement?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  points: number;
  badgeCount: number;
  tier: string;
}

// ============================================
// User Profile Hooks
// ============================================

/**
 * Hook to fetch a user profile
 */
export function useUserProfile(userId: string) {
  return useQuery<UserProfile, Error>({
    queryKey: ['community', 'profile', userId],
    queryFn: async () => {
      return await clientGet<UserProfile>(
        phase4Client,
        `/community/users/${userId}`
      );
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch current user's community profile
 */
export function useMyProfile() {
  return useQuery<UserProfile, Error>({
    queryKey: ['community', 'profile', 'me'],
    queryFn: async () => {
      return await clientGet<UserProfile>(phase4Client, '/community/me');
    },
  });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation<UserProfile, Error, Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl'>>>({
    mutationFn: async (updates: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl'>>) => {
      const result = await clientPost<typeof updates, UserProfile>(
        phase4Client,
        '/community/me',
        updates
      );
      logEvent('profile_updated', { fields: Object.keys(updates) });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'profile', 'me'] });
    },
  });
}

// ============================================
// Follow Hooks
// ============================================

/**
 * Hook to follow a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      await clientPost<Record<string, never>, void>(
        phase4Client,
        `/community/users/${userId}/follow`,
        {}
      );
      logEvent('user_followed', { userId });
    },
    onSuccess: (_: void, userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['community', 'followers'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'following'] });
    },
  });
}

/**
 * Hook to unfollow a user
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      await clientDelete(phase4Client, `/community/users/${userId}/follow`);
      logEvent('user_unfollowed', { userId });
    },
    onSuccess: (_: void, userId: string) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['community', 'followers'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'following'] });
    },
  });
}

/**
 * Hook to fetch followers
 */
export function useFollowers(userId: string) {
  return useInfiniteQuery<{ users: UserProfile[]; nextCursor?: string }, Error>({
    queryKey: ['community', 'followers', userId],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ users: UserProfile[]; nextCursor?: string }>(
        phase4Client,
        `/community/users/${userId}/followers`,
        { params: { cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { users: UserProfile[]; nextCursor?: string }) => lastPage.nextCursor,
    enabled: !!userId,
  });
}

/**
 * Hook to fetch following
 */
export function useFollowing(userId: string) {
  return useInfiniteQuery<{ users: UserProfile[]; nextCursor?: string }, Error>({
    queryKey: ['community', 'following', userId],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ users: UserProfile[]; nextCursor?: string }>(
        phase4Client,
        `/community/users/${userId}/following`,
        { params: { cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { users: UserProfile[]; nextCursor?: string }) => lastPage.nextCursor,
    enabled: !!userId,
  });
}

// ============================================
// Posts & Feed Hooks
// ============================================

/**
 * Hook to fetch community feed
 */
export function useCommunityFeed(options?: {
  type?: CommunityPost['type'];
  productId?: string;
  tag?: string;
  sortBy?: 'recent' | 'popular' | 'following';
}) {
  return useInfiniteQuery<{ posts: CommunityPost[]; nextCursor?: string }, Error>({
    queryKey: ['community', 'feed', options],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ posts: CommunityPost[]; nextCursor?: string }>(
        phase4Client,
        '/community/feed',
        { params: { ...options, cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { posts: CommunityPost[]; nextCursor?: string }) => lastPage.nextCursor,
  });
}

/**
 * Hook to fetch a single post
 */
export function usePost(postId: string) {
  return useQuery<CommunityPost, Error>({
    queryKey: ['community', 'post', postId],
    queryFn: async () => {
      return await clientGet<CommunityPost>(
        phase4Client,
        `/community/posts/${postId}`
      );
    },
    enabled: !!postId,
  });
}

/**
 * Hook to create a post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation<CommunityPost, Error, {
    type: CommunityPost['type'];
    content: string;
    images?: string[];
    productId?: string;
    rating?: number;
    effects?: string[];
    tags?: string[];
  }>({
    mutationFn: async (post: {
      type: CommunityPost['type'];
      content: string;
      images?: string[];
      productId?: string;
      rating?: number;
      effects?: string[];
      tags?: string[];
    }) => {
      const result = await clientPost<typeof post, CommunityPost>(
        phase4Client,
        '/community/posts',
        post
      );
      logEvent('post_created', { type: post.type, hasImages: !!post.images?.length });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'profile', 'me'] });
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (postId: string) => {
      await clientDelete(phase4Client, `/community/posts/${postId}`);
      logEvent('post_deleted', { postId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'feed'] });
    },
  });
}

// ============================================
// Like & Save Hooks
// ============================================

/**
 * Hook to like/unlike a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { postId: string; like: boolean }>({
    mutationFn: async ({ postId, like }: { postId: string; like: boolean }) => {
      if (like) {
        await clientPost<Record<string, never>, void>(phase4Client, `/community/posts/${postId}/like`, {});
      } else {
        await clientDelete(phase4Client, `/community/posts/${postId}/like`);
      }
      logEvent(like ? 'post_liked' : 'post_unliked', { postId });
    },
    onSuccess: (_: void, { postId }: { postId: string; like: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
      queryClient.invalidateQueries({ queryKey: ['community', 'feed'] });
    },
  });
}

/**
 * Hook to save/unsave a post
 */
export function useSavePost() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { postId: string; save: boolean }>({
    mutationFn: async ({ postId, save }: { postId: string; save: boolean }) => {
      if (save) {
        await clientPost<Record<string, never>, void>(phase4Client, `/community/posts/${postId}/save`, {});
      } else {
        await clientDelete(phase4Client, `/community/posts/${postId}/save`);
      }
      logEvent(save ? 'post_saved' : 'post_unsaved', { postId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'saved'] });
    },
  });
}

/**
 * Hook to fetch saved posts
 */
export function useSavedPosts() {
  return useInfiniteQuery<{ posts: CommunityPost[]; nextCursor?: string }, Error>({
    queryKey: ['community', 'saved'],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ posts: CommunityPost[]; nextCursor?: string }>(
        phase4Client,
        '/community/saved',
        { params: { cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { posts: CommunityPost[]; nextCursor?: string }) => lastPage.nextCursor,
  });
}

// ============================================
// Comment Hooks
// ============================================

/**
 * Hook to fetch comments for a post
 */
export function useComments(postId: string) {
  return useInfiniteQuery<{ comments: Comment[]; nextCursor?: string }, Error>({
    queryKey: ['community', 'comments', postId],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      return await clientGet<{ comments: Comment[]; nextCursor?: string }>(
        phase4Client,
        `/community/posts/${postId}/comments`,
        { params: { cursor: pageParam } }
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { comments: Comment[]; nextCursor?: string }) => lastPage.nextCursor,
    enabled: !!postId,
  });
}

/**
 * Hook to add a comment
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation<Comment, Error, { postId: string; content: string; parentCommentId?: string }>({
    mutationFn: async ({ postId, content, parentCommentId }: { postId: string; content: string; parentCommentId?: string }) => {
      const result = await clientPost<{ content: string; parentCommentId?: string }, Comment>(
        phase4Client,
        `/community/posts/${postId}/comments`,
        { content, parentCommentId }
      );
      logEvent('comment_added', { postId, isReply: !!parentCommentId });
      return result;
    },
    onSuccess: (_: Comment, { postId }: { postId: string; content: string; parentCommentId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] });
    },
  });
}

/**
 * Hook to like a comment
 */
export function useLikeComment() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { postId: string; commentId: string; like: boolean }>({
    mutationFn: async ({ commentId, like }: { postId: string; commentId: string; like: boolean }) => {
      if (like) {
        await clientPost<Record<string, never>, void>(phase4Client, `/community/comments/${commentId}/like`, {});
      } else {
        await clientDelete(phase4Client, `/community/comments/${commentId}/like`);
      }
    },
    onSuccess: (_: void, { postId }: { postId: string; commentId: string; like: boolean }) => {
      queryClient.invalidateQueries({ queryKey: ['community', 'comments', postId] });
    },
  });
}

// ============================================
// Badge & Points Hooks
// ============================================

/**
 * Hook to fetch user badges
 */
export function useUserBadges(userId?: string) {
  return useQuery<Badge[], Error>({
    queryKey: ['community', 'badges', userId || 'me'],
    queryFn: async () => {
      const endpoint = userId ? `/community/users/${userId}/badges` : '/community/me/badges';
      return await clientGet<{ badges: Badge[] }>(phase4Client, endpoint).then(r => r.badges);
    },
  });
}

/**
 * Hook to fetch available badges
 */
export function useAvailableBadges() {
  return useQuery<Badge[], Error>({
    queryKey: ['community', 'badges', 'available'],
    queryFn: async () => {
      const res = await clientGet<{ badges: Badge[] }>(phase4Client, '/community/badges');
      return res.badges;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Hook to fetch points history
 */
export function usePointsHistory() {
  return useQuery<{
    total: number;
    history: {
      id: string;
      points: number;
      reason: string;
      createdAt: string;
    }[];
  }, Error>({
    queryKey: ['community', 'points', 'history'],
    queryFn: async () => {
      return await clientGet(phase4Client, '/community/me/points');
    },
  });
}

/**
 * Hook to fetch leaderboard
 */
export function useLeaderboard(timeframe: 'weekly' | 'monthly' | 'alltime' = 'weekly') {
  return useQuery<LeaderboardEntry[], Error>({
    queryKey: ['community', 'leaderboard', timeframe],
    queryFn: async () => {
      const res = await clientGet<{ leaderboard: LeaderboardEntry[] }>(
        phase4Client,
        '/community/leaderboard',
        { params: { timeframe } }
      );
      return res.leaderboard;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// Content Moderation Hooks
// ============================================

/**
 * Hook to report content
 */
export function useReportContent() {
  return useMutation<void, Error, {
    contentType: 'post' | 'comment' | 'user';
    contentId: string;
    reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
    details?: string;
  }>({
    mutationFn: async (report: {
      contentType: 'post' | 'comment' | 'user';
      contentId: string;
      reason: 'spam' | 'harassment' | 'inappropriate' | 'misinformation' | 'other';
      details?: string;
    }) => {
      await clientPost<typeof report, void>(phase4Client, '/community/reports', report);
      logEvent('content_reported', { contentType: report.contentType, reason: report.reason });
    },
  });
}

/**
 * Hook to block a user
 */
export function useBlockUser() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      await clientPost<Record<string, never>, void>(phase4Client, `/community/users/${userId}/block`, {});
      logEvent('user_blocked', { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'feed'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'blocked'] });
    },
  });
}

/**
 * Hook to fetch blocked users
 */
export function useBlockedUsers() {
  return useQuery<UserProfile[], Error>({
    queryKey: ['community', 'blocked'],
    queryFn: async () => {
      const res = await clientGet<{ users: UserProfile[] }>(phase4Client, '/community/me/blocked');
      return res.users;
    },
  });
}
