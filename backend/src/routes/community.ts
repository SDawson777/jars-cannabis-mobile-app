import { Router, Request, Response } from 'express';

export const communityRouter = Router();

// Simple in-memory demo content to unblock the Community Garden screen.
// Shape matches the frontend expectation in CommunityGardenScreen.tsx
type Post = {
  id: string;
  user: string;
  time: string;
  text: string;
};

const demoPosts: Post[] = [
  {
    id: 'p1',
    user: 'Skylar',
    time: '2h ago',
    text: 'Loved the new seasonal drop. Anyone else try it yet? 🌿',
  },
  {
    id: 'p2',
    user: 'River',
    time: '4h ago',
    text: 'Pro tip: Pair a citrus-forward sativa with a short nature walk. Instant mood lift.',
  },
  {
    id: 'p3',
    user: 'J',
    time: 'Yesterday',
    text: 'Community event this weekend was awesome. Thanks to everyone who came by! 🎉',
  },
];

// GET /community/posts — return a list of community posts
communityRouter.get('/community/posts', (_req, res) => {
  res.json({ posts: demoPosts });
});

// ============================================
// Enhanced Community Routes
// ============================================

// User Profile Routes
communityRouter.get('/community/me', async (_req: Request, res: Response) => {
  try {
    res.json({
      id: 'user-123',
      username: 'cannabisuser',
      displayName: 'Cannabis User',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Cannabis enthusiast',
      joinedAt: '2023-01-15T00:00:00Z',
      isVerified: true,
      followerCount: 150,
      followingCount: 75,
      reviewCount: 25,
      badgeCount: 8,
      points: 2500,
      tier: 'gold',
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

communityRouter.post('/community/me', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    res.json({ id: 'user-123', ...updates });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

communityRouter.get('/community/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    res.json({
      id: userId,
      username: 'anotheruser',
      displayName: 'Another User',
      joinedAt: '2023-06-01T00:00:00Z',
      isVerified: false,
      followerCount: 50,
      followingCount: 100,
      reviewCount: 10,
      badgeCount: 3,
      points: 500,
      tier: 'silver',
      isFollowing: false,
      isFollowedBy: false,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Follow Routes
communityRouter.post('/community/users/:userId/follow', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

communityRouter.delete('/community/users/:userId/follow', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

communityRouter.get('/community/users/:userId/followers', async (_req: Request, res: Response) => {
  try {
    res.json({ users: [], nextCursor: undefined });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

communityRouter.get('/community/users/:userId/following', async (_req: Request, res: Response) => {
  try {
    res.json({ users: [], nextCursor: undefined });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// Feed Routes
communityRouter.get('/community/feed', async (_req: Request, res: Response) => {
  try {
    res.json({
      posts: [
        {
          id: 'post-1',
          authorId: 'user-456',
          author: { id: 'user-456', username: 'reviewer', displayName: 'Product Reviewer', isVerified: true },
          type: 'review',
          content: 'Great strain for relaxation!',
          productId: 'prod-123',
          productName: 'Blue Dream',
          rating: 5,
          effects: ['relaxed', 'happy', 'creative'],
          tags: ['indica', 'evening'],
          likeCount: 25,
          commentCount: 5,
          shareCount: 2,
          isLiked: false,
          isSaved: false,
          isReported: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      nextCursor: undefined,
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

communityRouter.get('/community/posts/:postId', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    res.json({
      id: postId,
      authorId: 'user-456',
      author: { id: 'user-456', username: 'reviewer', displayName: 'Product Reviewer', isVerified: true },
      type: 'review',
      content: 'Great strain!',
      rating: 5,
      tags: [],
      likeCount: 25,
      commentCount: 5,
      shareCount: 2,
      isLiked: false,
      isSaved: false,
      isReported: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

communityRouter.post('/community/posts', async (req: Request, res: Response) => {
  try {
    const post = req.body;
    res.status(201).json({
      id: `post-${Date.now()}`,
      authorId: 'user-123',
      author: { id: 'user-123', username: 'cannabisuser', displayName: 'Cannabis User', isVerified: true },
      ...post,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isLiked: false,
      isSaved: false,
      isReported: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

communityRouter.delete('/community/posts/:postId', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Like & Save Routes
communityRouter.post('/community/posts/:postId/like', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

communityRouter.delete('/community/posts/:postId/like', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Failed to unlike post' });
  }
});

communityRouter.post('/community/posts/:postId/save', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

communityRouter.delete('/community/posts/:postId/save', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error unsaving post:', error);
    res.status(500).json({ error: 'Failed to unsave post' });
  }
});

communityRouter.get('/community/saved', async (_req: Request, res: Response) => {
  try {
    res.json({ posts: [], nextCursor: undefined });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ error: 'Failed to fetch saved posts' });
  }
});

// Comment Routes
communityRouter.get('/community/posts/:postId/comments', async (_req: Request, res: Response) => {
  try {
    res.json({ comments: [], nextCursor: undefined });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

communityRouter.post('/community/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const { content, parentCommentId } = req.body;
    res.status(201).json({
      id: `comment-${Date.now()}`,
      postId: req.params.postId,
      authorId: 'user-123',
      author: { id: 'user-123', username: 'cannabisuser', displayName: 'Cannabis User', isVerified: true },
      content,
      likeCount: 0,
      isLiked: false,
      replyCount: 0,
      parentCommentId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

communityRouter.post('/community/comments/:commentId/like', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

communityRouter.delete('/community/comments/:commentId/like', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});

// Badge & Points Routes
communityRouter.get('/community/me/badges', async (_req: Request, res: Response) => {
  try {
    res.json({
      badges: [
        { id: 'badge-1', name: 'First Review', description: 'Posted your first review', iconUrl: '/badges/first-review.png', category: 'engagement', rarity: 'common', earnedAt: '2023-06-15T00:00:00Z' },
      ],
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

communityRouter.get('/community/users/:userId/badges', async (_req: Request, res: Response) => {
  try {
    res.json({ badges: [] });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

communityRouter.get('/community/badges', async (_req: Request, res: Response) => {
  try {
    res.json({
      badges: [
        { id: 'badge-1', name: 'First Review', description: 'Post your first review', iconUrl: '/badges/first-review.png', category: 'engagement', rarity: 'common', requirement: 'Post 1 review', progress: 100 },
        { id: 'badge-2', name: 'Connoisseur', description: 'Review 50 products', iconUrl: '/badges/connoisseur.png', category: 'expertise', rarity: 'epic', requirement: 'Review 50 products', progress: 50 },
      ],
    });
  } catch (error) {
    console.error('Error fetching available badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

communityRouter.get('/community/me/points', async (_req: Request, res: Response) => {
  try {
    res.json({
      total: 2500,
      history: [
        { id: 'pts-1', points: 100, reason: 'Posted a review', createdAt: new Date().toISOString() },
        { id: 'pts-2', points: 50, reason: 'Received 10 likes', createdAt: new Date().toISOString() },
      ],
    });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ error: 'Failed to fetch points' });
  }
});

communityRouter.get('/community/leaderboard', async (_req: Request, res: Response) => {
  try {
    res.json({
      leaderboard: [
        { rank: 1, userId: 'user-top', username: 'topreviewer', displayName: 'Top Reviewer', points: 10000, badgeCount: 25, tier: 'platinum' },
      ],
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Moderation Routes
communityRouter.post('/community/reports', async (_req: Request, res: Response) => {
  try {
    res.status(201).json({ reported: true });
  } catch (error) {
    console.error('Error reporting content:', error);
    res.status(500).json({ error: 'Failed to report content' });
  }
});

communityRouter.post('/community/users/:userId/block', async (_req: Request, res: Response) => {
  try {
    res.status(204).send();
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

communityRouter.get('/community/me/blocked', async (_req: Request, res: Response) => {
  try {
    res.json({ users: [] });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({ error: 'Failed to fetch blocked users' });
  }
});
