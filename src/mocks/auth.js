import { notify, store } from "./store";

const SESSION_KEY = "fable_session_user_id";

export const getSessionUserId = () => {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

const setSessionUserId = (userId) => {
  try {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable — session stays in-memory for this page load */
  }
};

export const login = (email, password) => {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const credential = store.credentials.find(
    (c) => c.email.toLowerCase() === normalizedEmail && c.password === password,
  );
  if (!credential) return null;
  setSessionUserId(credential.userId);
  notify();
  return credential.userId;
};

export const signup = ({ firstName, lastName, email, password }) => {
  const normalizedEmail = (email || "").trim().toLowerCase();
  if (store.credentials.some((c) => c.email.toLowerCase() === normalizedEmail)) {
    return null;
  }

  const baseUsername = normalizedEmail.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase() || "user";
  let username = baseUsername;
  let suffix = 1;
  while (store.users.some((u) => u.username === username)) {
    username = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  const userId = `user_${Date.now()}`;
  const now = new Date().toISOString();
  store.users.push({
    id: userId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    username,
    email: normalizedEmail,
    dob: "",
    bio: "",
    avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(username)}/200/200`,
    joinedAt: now,
    visibility: "public",
    isDeactivated: false,
    followersCount: 0,
    followingCount: 0,
    uploadsCount: 0,
    bookmarkedCount: 0,
    blockedUsers: [],
    blockedByUsers: [],
    bookmarkedPosts: [],
    createdPosts: [],
    pendingFollowRequests: [],
    followerList: [],
    followingList: [],
  });
  store.credentials.push({
    id: `auth_${Date.now()}`,
    userId,
    email: normalizedEmail,
    username,
    password,
  });
  setSessionUserId(userId);
  notify();
  return userId;
};

export const logout = () => {
  setSessionUserId(null);
  notify();
};
