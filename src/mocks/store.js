import { comments as commentsSeed } from "./data/comments";
import { notifications as notificationsSeed } from "./data/notifications";
import { posts as postsSeed } from "./data/posts";
import { tags as tagsSeed } from "./data/tags";
import { users as usersSeed } from "./data/users";
import { mockCredentials as credentialsSeed } from "./data/credentials";

export const store = {
  users: usersSeed,
  posts: postsSeed,
  comments: commentsSeed,
  notifications: notificationsSeed,
  tags: tagsSeed,
  credentials: credentialsSeed,
};

let version = 0;
const listeners = new Set();

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getStoreVersion = () => version;

export const notify = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};
