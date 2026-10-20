import { comments } from "./data/comments";
import { notifications } from "./data/notifications";
import { posts } from "./data/posts";
import { tags } from "./data/tags";
import { users } from "./data/users";

export const getCurrentUser = () => {
  return users.find((u) => u.id === "user_001") || null;
};

export const getUserById = (userId) => {
  return users.find((u) => u.id === userId) || null;
};

export const getUserByUsername = (username) => {
  return users.find((u) => u.username === username) || null;
};


export const getPostById = (postId) => {
  return posts.find((p) => p.id === postId) || null;
};

export const getHomePostFeed = () => {
  return posts;
};

export const isPostSavedBy = (userId, postId) => {
  return posts.some((p) => p.id === postId && p.savedBy?.includes(userId));
};

export const isPostLikedBy = (userId, postId) => {
  return posts.some((p) => p.id === postId && p.likedBy?.includes(userId));
};

export const isFollowedBy = (userId, targetId) => {
  const targetUser = users.find((u) => u.id === targetId);
  return targetUser?.followerList?.includes(userId) ?? false;
};

export const getPostCommentsById = (postId) => {
  return comments.filter((c) => c.postId === postId) || null;
};

export const getCommentById = (commentId) => {
  return comments.find((c) => c.id === commentId) || null;
};

export const getCreatedPostsById = (userId) => {


  const user = getUserById(userId);

  if (!user || !user.createdPosts) {
    return [];
  }


  const mappedPosts = user.createdPosts.map((id) => {
    const post = getPostById(id);
    return post;
  });

  return mappedPosts.filter(Boolean);
};


export const getSavedPostsById = (userId) => {


  const user = getUserById(userId);

  if (!user || !user.bookmarkedPosts) {
    return [];
  }


  const mappedPosts = user.bookmarkedPosts.map((id) => {
    const post = getPostById(id);
    return post;
  });

  return mappedPosts.filter(Boolean);
};

export const getNotificationsByUserId = (userId) => {
  return notifications.filter((n) => n.recipientId === userId);
};

export const getTrendingTags = (limit = 12) => {
  const counts = new Map();
  for (const post of posts) {
    for (const tag of post.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  const tagMeta = new Map(tags.map((t) => [t.name, t]));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, postsCount]) => {
      const meta = tagMeta.get(name);
      return {
        id: meta?.id || `tag_${name}`,
        name,
        displayName: meta?.displayName || `#${name}`,
        postsCount: meta?.postsCount ?? postsCount,
        coverImageUrl:
          meta?.coverImageUrl ||
          `https://picsum.photos/seed/${encodeURIComponent(name)}/300/300`,
        isTrending: meta?.isTrending ?? postsCount > 1,
      };
    });
};

export const searchPosts = (query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return posts;
  return posts.filter((post) => {
    const author = getUserById(post.authorId);
    const haystack = [
      post.title,
      post.description,
      ...(post.tags || []),
      author?.username,
      author?.firstName,
      author?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
};

export const addPost = (post) => {
  posts.unshift(post);
  return post;
};

export const togglePostSaved = (userId, postId) => {
  const post = getPostById(postId);
  if (!post || !userId) return false;
  if (!Array.isArray(post.savedBy)) post.savedBy = [];
  const idx = post.savedBy.indexOf(userId);
  if (idx >= 0) {
    post.savedBy.splice(idx, 1);
    return false;
  }
  post.savedBy.push(userId);
  return true;
};