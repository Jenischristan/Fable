import { getSessionUserId, login as authLogin, logout as authLogout, signup as authSignup } from "./auth";
import { notify, store } from "./store";

export { NOTIFICATION_TYPE } from "./data/notifications";

const canViewPost = (post, viewerId) => {
  if (!post) return false;
  if (post.authorId === viewerId) return true;

  const author = store.users.find((u) => u.id === post.authorId);
  if (!author || author.isDeactivated) return false;

  const viewer = store.users.find((u) => u.id === viewerId);
  if (viewer?.blockedUsers?.includes(post.authorId)) return false;
  if (author.blockedUsers?.includes(viewerId)) return false;

  if (post.visibility === "private") {
    return author.followerList?.includes(viewerId) ?? false;
  }
  return true;
};

export const login = (email, password) => authLogin(email, password);
export const signup = (payload) => authSignup(payload);
export const logout = () => authLogout();

export const getCurrentUser = () => {
  const userId = getSessionUserId();
  if (!userId) return null;
  const user = store.users.find((u) => u.id === userId) || null;
  if (user?.isDeactivated) return null;
  return user;
};

export const getUserById = (userId) => {
  return store.users.find((u) => u.id === userId) || null;
};

export const getUserByUsername = (username) => {
  return store.users.find((u) => u.username === username) || null;
};

export const searchUsers = (query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return [];
  const viewer = getCurrentUser();
  return store.users.filter((u) => {
    if (!viewer || u.id === viewer.id) return false;
    if (viewer.blockedUsers?.includes(u.id)) return false;
    if (u.blockedByUsers?.includes(viewer.id)) return false;
    const haystack = [u.username, u.firstName, u.lastName, u.email].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(q);
  });
};

export const getPostById = (postId) => {
  return store.posts.find((p) => p.id === postId) || null;
};

export const getHomePostFeed = () => {
  const viewerId = getCurrentUser()?.id;
  return store.posts.filter((p) => canViewPost(p, viewerId));
};

export const isPostSavedBy = (userId, postId) => {
  return store.posts.some((p) => p.id === postId && p.savedBy?.includes(userId));
};

export const isPostLikedBy = (userId, postId) => {
  return store.posts.some((p) => p.id === postId && p.likedBy?.includes(userId));
};

export const isFollowedBy = (userId, targetId) => {
  const targetUser = store.users.find((u) => u.id === targetId);
  return targetUser?.followerList?.includes(userId) ?? false;
};

export const isBlockedBy = (userId, targetId) => {
  const targetUser = store.users.find((u) => u.id === targetId);
  return targetUser?.blockedUsers?.includes(userId) ?? false;
};

export const getPostCommentsById = (postId) => {
  return store.comments.filter((c) => c.postId === postId && !c.isDeleted);
};

export const getCommentById = (commentId) => {
  return store.comments.find((c) => c.id === commentId) || null;
};

export const getCreatedPostsById = (userId) => {
  const user = getUserById(userId);
  if (!user?.createdPosts) return [];
  const viewerId = getCurrentUser()?.id;
  return user.createdPosts
    .map((id) => getPostById(id))
    .filter((post) => post && canViewPost(post, viewerId));
};

export const getSavedPostsById = (userId) => {
  const user = getUserById(userId);
  if (!user) return [];
  const viewerId = getCurrentUser()?.id;
  const savedIds = new Set([
    ...(user.bookmarkedPosts || []),
    ...store.posts.filter((p) => p.savedBy?.includes(userId)).map((p) => p.id),
  ]);
  return [...savedIds]
    .map((id) => getPostById(id))
    .filter((post) => post && canViewPost(post, viewerId));
};

export const getNotificationsByUserId = (userId) => {
  return store.notifications
    .filter((n) => n.recipientId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const markNotificationRead = (notificationId) => {
  const notif = store.notifications.find((n) => n.id === notificationId);
  if (!notif || notif.isRead) return;
  notif.isRead = true;
  notify();
};

export const markAllNotificationsRead = (userId) => {
  let changed = false;
  for (const n of store.notifications) {
    if (n.recipientId === userId && !n.isRead) {
      n.isRead = true;
      changed = true;
    }
  }
  if (changed) notify();
};

export const removeNotification = (notificationId) => {
  const idx = store.notifications.findIndex((n) => n.id === notificationId);
  if (idx < 0) return;
  store.notifications.splice(idx, 1);
  notify();
};

export const clearNotifications = (userId) => {
  const before = store.notifications.length;
  store.notifications = store.notifications.filter((n) => n.recipientId !== userId);
  if (store.notifications.length !== before) notify();
};

export const getTrendingTags = (limit = 12) => {
  const counts = new Map();
  const viewerId = getCurrentUser()?.id;
  for (const post of store.posts) {
    if (!canViewPost(post, viewerId)) continue;
    for (const tag of post.tags || []) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  const tagMeta = new Map(store.tags.map((t) => [t.name, t]));

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
  const viewerId = getCurrentUser()?.id;
  const visible = store.posts.filter((p) => canViewPost(p, viewerId));
  const q = (query || "").trim().toLowerCase();
  if (!q) return visible;
  return visible.filter((post) => {
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

export const getRecommendedCreators = (limit = 6) => {
  const viewer = getCurrentUser();
  if (!viewer) return [];
  return store.users
    .filter(
      (u) =>
        u.id !== viewer.id &&
        !u.isDeactivated &&
        !viewer.blockedUsers?.includes(u.id) &&
        !u.blockedByUsers?.includes(viewer.id) &&
        !viewer.followingList?.includes(u.id),
    )
    .slice(0, limit);
};

export const addPost = (post) => {
  store.posts.unshift(post);
  const author = getUserById(post.authorId);
  if (author) {
    if (!Array.isArray(author.createdPosts)) author.createdPosts = [];
    author.createdPosts.unshift(post.id);
    author.uploadsCount = (author.uploadsCount || 0) + 1;
  }
  notify();
  return post;
};

export const togglePostSaved = (userId, postId) => {
  const post = getPostById(postId);
  if (!post || !userId) return false;
  if (!Array.isArray(post.savedBy)) post.savedBy = [];
  const idx = post.savedBy.indexOf(userId);
  const user = getUserById(userId);
  if (!Array.isArray(user?.bookmarkedPosts)) {
    if (user) user.bookmarkedPosts = [];
  }

  let nowSaved;
  if (idx >= 0) {
    post.savedBy.splice(idx, 1);
    if (user) {
      const bIdx = user.bookmarkedPosts.indexOf(postId);
      if (bIdx >= 0) user.bookmarkedPosts.splice(bIdx, 1);
      user.bookmarkedCount = Math.max(0, (user.bookmarkedCount || 1) - 1);
    }
    nowSaved = false;
  } else {
    post.savedBy.push(userId);
    if (user && !user.bookmarkedPosts.includes(postId)) {
      user.bookmarkedPosts.push(postId);
      user.bookmarkedCount = (user.bookmarkedCount || 0) + 1;
    }
    nowSaved = true;
  }
  notify();
  return nowSaved;
};

export const togglePostLiked = (userId, postId) => {
  const post = getPostById(postId);
  if (!post || !userId) return false;
  if (!Array.isArray(post.likedBy)) post.likedBy = [];
  const idx = post.likedBy.indexOf(userId);
  let nowLiked;
  if (idx >= 0) {
    post.likedBy.splice(idx, 1);
    post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
    nowLiked = false;
  } else {
    post.likedBy.push(userId);
    post.likesCount = (post.likesCount || 0) + 1;
    nowLiked = true;
    if (post.authorId !== userId) {
      store.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: post.authorId,
        actorId: userId,
        type: "post_like",
        targetId: post.id,
        targetType: "post",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }
  notify();
  return nowLiked;
};

export const addComment = (postId, authorId, content) => {
  const post = getPostById(postId);
  if (!post || !authorId || !content?.trim()) return null;
  const comment = {
    id: `comment_${Date.now()}`,
    postId,
    authorId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likesCount: 0,
    likedBy: [],
    isDeleted: false,
  };
  store.comments.push(comment);
  post.commentsCount = (post.commentsCount || 0) + 1;
  if (post.authorId !== authorId) {
    store.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: post.authorId,
      actorId: authorId,
      type: "comment",
      targetId: comment.id,
      targetType: "comment",
      isRead: false,
      createdAt: comment.createdAt,
    });
  }
  notify();
  return comment;
};

export const toggleCommentLiked = (userId, commentId) => {
  const comment = getCommentById(commentId);
  if (!comment || !userId) return false;
  if (!Array.isArray(comment.likedBy)) comment.likedBy = [];
  const idx = comment.likedBy.indexOf(userId);
  let nowLiked;
  if (idx >= 0) {
    comment.likedBy.splice(idx, 1);
    comment.likesCount = Math.max(0, (comment.likesCount || 1) - 1);
    nowLiked = false;
  } else {
    comment.likedBy.push(userId);
    comment.likesCount = (comment.likesCount || 0) + 1;
    nowLiked = true;
    if (comment.authorId !== userId) {
      store.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: comment.authorId,
        actorId: userId,
        type: "comment_like",
        targetId: comment.id,
        targetType: "comment",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }
  notify();
  return nowLiked;
};

export const deleteComment = (userId, commentId) => {
  const comment = getCommentById(commentId);
  if (!comment || comment.authorId !== userId) return false;
  if (comment.isDeleted) return false;
  comment.isDeleted = true;
  const post = getPostById(comment.postId);
  if (post) post.commentsCount = Math.max(0, (post.commentsCount || 1) - 1);
  notify();
  return true;
};

export const setFollowUser = (userId, targetId, follow) => {
  const user = getUserById(userId);
  const target = getUserById(targetId);
  if (!user || !target || userId === targetId) return false;

  if (!Array.isArray(user.followingList)) user.followingList = [];
  if (!Array.isArray(target.followerList)) target.followerList = [];

  const alreadyFollowing = target.followerList.includes(userId);
  if (follow && !alreadyFollowing) {
    if (target.visibility === "private") {
      if (!Array.isArray(target.pendingFollowRequests)) target.pendingFollowRequests = [];
      if (!target.pendingFollowRequests.includes(userId)) {
        target.pendingFollowRequests.push(userId);
        store.notifications.unshift({
          id: `notif_${Date.now()}`,
          recipientId: targetId,
          actorId: userId,
          type: "follow_request",
          targetId: null,
          targetType: "user",
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
      notify();
      return "requested";
    }
    target.followerList.push(userId);
    user.followingList.push(targetId);
    target.followersCount = (target.followersCount || 0) + 1;
    user.followingCount = (user.followingCount || 0) + 1;
    store.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: targetId,
      actorId: userId,
      type: "follow",
      targetId: null,
      targetType: "user",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    notify();
    return true;
  }

  if (!follow && alreadyFollowing) {
    const tIdx = target.followerList.indexOf(userId);
    target.followerList.splice(tIdx, 1);
    const uIdx = user.followingList.indexOf(targetId);
    if (uIdx >= 0) user.followingList.splice(uIdx, 1);
    target.followersCount = Math.max(0, (target.followersCount || 1) - 1);
    user.followingCount = Math.max(0, (user.followingCount || 1) - 1);
    notify();
    return true;
  }

  if (!follow) {
    if (Array.isArray(target.pendingFollowRequests)) {
      const pIdx = target.pendingFollowRequests.indexOf(userId);
      if (pIdx >= 0) target.pendingFollowRequests.splice(pIdx, 1);
    }
    notify();
    return true;
  }

  return false;
};

export const hasPendingFollowRequest = (userId, targetId) => {
  const target = getUserById(targetId);
  return target?.pendingFollowRequests?.includes(userId) ?? false;
};

export const acceptFollowRequest = (currentUserId, requesterId) => {
  const user = getUserById(currentUserId);
  const requester = getUserById(requesterId);
  if (!user || !requester) return false;
  if (!Array.isArray(user.pendingFollowRequests)) return false;
  const idx = user.pendingFollowRequests.indexOf(requesterId);
  if (idx < 0) return false;
  user.pendingFollowRequests.splice(idx, 1);
  if (!Array.isArray(user.followerList)) user.followerList = [];
  if (!Array.isArray(requester.followingList)) requester.followingList = [];
  if (!user.followerList.includes(requesterId)) {
    user.followerList.push(requesterId);
    user.followersCount = (user.followersCount || 0) + 1;
  }
  if (!requester.followingList.includes(currentUserId)) {
    requester.followingList.push(currentUserId);
    requester.followingCount = (requester.followingCount || 0) + 1;
  }
  store.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: requesterId,
    actorId: currentUserId,
    type: "follow_accept",
    targetId: null,
    targetType: "user",
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  notify();
  return true;
};

export const declineFollowRequest = (currentUserId, requesterId) => {
  const user = getUserById(currentUserId);
  if (!user || !Array.isArray(user.pendingFollowRequests)) return false;
  const idx = user.pendingFollowRequests.indexOf(requesterId);
  if (idx < 0) return false;
  user.pendingFollowRequests.splice(idx, 1);
  notify();
  return true;
};

export const blockUser = (userId, targetId) => {
  const user = getUserById(userId);
  const target = getUserById(targetId);
  if (!user || !target || userId === targetId) return false;
  if (!Array.isArray(user.blockedUsers)) user.blockedUsers = [];
  if (!Array.isArray(target.blockedByUsers)) target.blockedByUsers = [];
  if (!user.blockedUsers.includes(targetId)) {
    user.blockedUsers.push(targetId);
    target.blockedByUsers.push(userId);
  }
  setFollowUser(userId, targetId, false);
  setFollowUser(targetId, userId, false);
  notify();
  return true;
};

export const unblockUser = (userId, targetId) => {
  const user = getUserById(userId);
  const target = getUserById(targetId);
  if (!user || !target) return false;
  if (Array.isArray(user.blockedUsers)) {
    const idx = user.blockedUsers.indexOf(targetId);
    if (idx >= 0) user.blockedUsers.splice(idx, 1);
  }
  if (Array.isArray(target.blockedByUsers)) {
    const idx = target.blockedByUsers.indexOf(userId);
    if (idx >= 0) target.blockedByUsers.splice(idx, 1);
  }
  notify();
  return true;
};

export const updateCurrentUser = (updates) => {
  const user = getCurrentUser();
  if (!user) return null;
  const allowed = ["firstName", "lastName", "username", "bio", "avatarUrl", "email", "dob", "visibility"];
  for (const key of allowed) {
    if (updates[key] !== undefined) user[key] = updates[key];
  }
  if (updates.password) {
    const cred = store.credentials.find((c) => c.userId === user.id);
    if (cred) cred.password = updates.password;
  }
  notify();
  return user;
};

export const deactivateAccount = () => {
  const user = getCurrentUser();
  if (!user) return false;
  user.isDeactivated = true;
  authLogout();
  notify();
  return true;
};

export const deleteAccount = () => {
  const user = getCurrentUser();
  if (!user) return false;
  const userId = user.id;
  store.posts = store.posts.filter((p) => p.authorId !== userId);
  store.comments = store.comments.filter((c) => c.authorId !== userId);
  store.notifications = store.notifications.filter(
    (n) => n.recipientId !== userId && n.actorId !== userId,
  );
  for (const u of store.users) {
    if (Array.isArray(u.followerList)) u.followerList = u.followerList.filter((id) => id !== userId);
    if (Array.isArray(u.followingList)) u.followingList = u.followingList.filter((id) => id !== userId);
    if (Array.isArray(u.blockedUsers)) u.blockedUsers = u.blockedUsers.filter((id) => id !== userId);
    if (Array.isArray(u.blockedByUsers)) u.blockedByUsers = u.blockedByUsers.filter((id) => id !== userId);
    if (Array.isArray(u.pendingFollowRequests)) {
      u.pendingFollowRequests = u.pendingFollowRequests.filter((id) => id !== userId);
    }
    if (Array.isArray(u.bookmarkedPosts)) {
      for (const p of store.posts) {
        if (p.savedBy) p.savedBy = p.savedBy.filter((id) => id !== userId);
      }
    }
  }
  const uIdx = store.users.findIndex((u) => u.id === userId);
  if (uIdx >= 0) store.users.splice(uIdx, 1);
  store.credentials = store.credentials.filter((c) => c.userId !== userId);
  authLogout();
  notify();
  return true;
};
