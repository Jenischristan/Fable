import { posts } from "./data/posts"
import { users } from "./data/users"


 export const getCurrentUser = () => {
    return users.find((u) => u.id === "user_001") || null
}

export const getUserById = (userId) => {
    const user = users.find((u) => {u.id === userId}) || null
    return user
}

export const getPostById = (postId) => {
    const post = posts.find((p) => {p.id === postId}) || null
    return post
}

export const getAllPosts = () => {
    return posts;
}