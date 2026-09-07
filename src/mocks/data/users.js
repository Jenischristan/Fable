export const users = [
  {
    id: "user_001",
    firstName: "Jenis",
    lastName: "Christan",
    username: "jenischristan",
    email: "jenischristan@email.com",
    dob: "2007-06-11T00:00:00.000Z",
    bio: "I like chocolates, Yummy 😋",
    avatarUrl: "https://picsum.photos/seed/jenischristan/200/200",
    joinedAt: "2026-09-06T15:23:40.381Z",
    visibility: "public",
    isDeactivated : false,

    followersCount: 3,
    followingCount: 2,
    uploadsCount: 2,
    bookmarkedCount: 2,

    blockedUsers : ["user_007", "user_008"],
    blockedByUsers : ["user_011", "user_012"],

    bookmarkedPosts: ["post_001", "post_002"],
    createdPosts: ["post_003", "post_004"],
    pendingFollowRequests: ["user_006"],
    followerList: ["user_002", "user_003", "user_004"],
    followingList: ["user_004", "user_005"],
  },
];
