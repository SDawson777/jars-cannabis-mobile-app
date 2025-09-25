import { Router } from 'express';

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
