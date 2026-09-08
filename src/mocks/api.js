import { comments } from "./data/comments";
import { posts } from "./data/posts";
import { users } from "./data/users";

export const getCurrentUser = () => {
  return users.find((u) => u.id === "user_001") || null;
};

export const getUserById = (userId) => {
  return users.find((u) => u.id === userId) || null;
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

