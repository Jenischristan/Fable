export const NOTIFICATION_TYPE = {
  FOLLOW: "follow",
  FOLLOW_REQUEST: "follow_request",
  FOLLOW_ACCEPT: "follow_accept",
  POST_LIKE: "post_like",
  COMMENT_LIKE: "comment_like",
  COMMENT: "comment",
  BOOKMARK: "bookmark",
};

export const notifications = [
  {
    id: "notif_001",
    recipientId: "user_001",  
    actorId: "user_002",        
    type: NOTIFICATION_TYPE.FOLLOW_ACCEPT,        
    targetId: null,               
    targetType: "user",          
    isRead: false,
    createdAt: "2026-09-06T18:30:00.000Z"
  },
  {
    id: "notif_002",
    recipientId: "user_001",
    actorId: "user_003",
    type: NOTIFICATION_TYPE.FOLLOW_REQUEST,
    targetId: null,
    targetType: "user",
    isRead: false,
    createdAt: "2026-09-06T17:10:00.000Z"
  },
  {
    id: "notif_003",
    recipientId: "user_001",
    actorId: "user_004",
    type: NOTIFICATION_TYPE.POST_LIKE,
    targetId: "post_003",         
    targetType: "post",
    isRead: true,
    createdAt: "2026-09-06T16:00:00.000Z"
  },
  {
    id: "notif_004",
    recipientId: "user_001",
    actorId: "user_002",
    type: NOTIFICATION_TYPE.COMMENT,
    targetId: "comment_001",      
    targetType: "comment",
    isRead: true,
    createdAt: "2026-09-06T15:00:00.000Z"
  }
];