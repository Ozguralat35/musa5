import { db } from "./db";
import { users, posts, duaRequests, likes, comments, bookmarks, communities, communityMembers, events, eventAttendees } from "@shared/schema";
import type { User, InsertUser, Post, InsertPost, DuaRequest, InsertDuaRequest, Comment, InsertComment, Community, InsertCommunity, Event, InsertEvent, Like, Bookmark, CommunityMember, EventAttendee } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Posts
  getPosts(limit?: number): Promise<(Post & { users: User })[]>;
  getPostById(id: string): Promise<(Post & { users: User }) | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  deletePost(id: string): Promise<boolean>;
  
  // Dua Requests
  getDuaRequests(limit?: number): Promise<(DuaRequest & { users: User })[]>;
  getDuaRequestById(id: string): Promise<(DuaRequest & { users: User }) | undefined>;
  createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest>;
  
  // Comments
  getCommentsByPostId(postId: string): Promise<(Comment & { users: User })[]>;
  getCommentsByDuaRequestId(duaRequestId: string): Promise<(Comment & { users: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Likes
  getUserLike(userId: string, postId?: string, duaRequestId?: string): Promise<Like | undefined>;
  toggleLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ liked: boolean }>;
  
  // Bookmarks
  getUserBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<Bookmark | undefined>;
  toggleBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<{ bookmarked: boolean }>;
  
  // Communities
  getCommunities(limit?: number): Promise<(Community & { users: User })[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  joinCommunity(communityId: string, userId: string): Promise<CommunityMember>;
  
  // Events
  getEvents(limit?: number): Promise<(Event & { users: User })[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  attendEvent(eventId: string, userId: string): Promise<EventAttendee>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user as any).returning();
    return result[0];
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(userData as any).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Posts
  async getPosts(limit = 50): Promise<(Post & { users: User })[]> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.user_id, users.id))
      .orderBy(desc(posts.created_at))
      .limit(limit);
    
    return result.map(row => ({
      ...row.posts,
      users: row.users!
    }));
  }

  async getPostById(id: string): Promise<(Post & { users: User }) | undefined> {
    const result = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.user_id, users.id))
      .where(eq(posts.id, id))
      .limit(1);
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].posts,
      users: result[0].users!
    };
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post as any).returning();
    return result[0];
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Dua Requests
  async getDuaRequests(limit = 50): Promise<(DuaRequest & { users: User })[]> {
    const result = await db
      .select()
      .from(duaRequests)
      .leftJoin(users, eq(duaRequests.user_id, users.id))
      .orderBy(desc(duaRequests.created_at))
      .limit(limit);
    
    return result.map(row => ({
      ...row.dua_requests,
      users: row.users!
    }));
  }

  async getDuaRequestById(id: string): Promise<(DuaRequest & { users: User }) | undefined> {
    const result = await db
      .select()
      .from(duaRequests)
      .leftJoin(users, eq(duaRequests.user_id, users.id))
      .where(eq(duaRequests.id, id))
      .limit(1);
    
    if (result.length === 0) return undefined;
    
    return {
      ...result[0].dua_requests,
      users: result[0].users!
    };
  }

  async createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest> {
    const result = await db.insert(duaRequests).values(duaRequest).returning();
    return result[0];
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<(Comment & { users: User })[]> {
    const result = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.user_id, users.id))
      .where(eq(comments.post_id, postId))
      .orderBy(desc(comments.created_at));
    
    return result.map(row => ({
      ...row.comments,
      users: row.users!
    }));
  }

  async getCommentsByDuaRequestId(duaRequestId: string): Promise<(Comment & { users: User })[]> {
    const result = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.user_id, users.id))
      .where(eq(comments.dua_request_id, duaRequestId))
      .orderBy(desc(comments.created_at));
    
    return result.map(row => ({
      ...row.comments,
      users: row.users!
    }));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }

  // Likes
  async getUserLike(userId: string, postId?: string, duaRequestId?: string): Promise<Like | undefined> {
    const conditions = [eq(likes.user_id, userId)];
    if (postId) conditions.push(eq(likes.post_id, postId));
    if (duaRequestId) conditions.push(eq(likes.dua_request_id, duaRequestId));
    
    const result = await db.select().from(likes).where(and(...conditions)).limit(1);
    return result[0];
  }

  async toggleLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ liked: boolean }> {
    const existingLike = await this.getUserLike(userId, postId, duaRequestId);
    
    if (existingLike) {
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      return { liked: false };
    } else {
      await db.insert(likes).values({
        user_id: userId,
        post_id: postId || null,
        dua_request_id: duaRequestId || null
      });
      return { liked: true };
    }
  }

  // Bookmarks
  async getUserBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<Bookmark | undefined> {
    const conditions = [eq(bookmarks.user_id, userId)];
    if (postId) conditions.push(eq(bookmarks.post_id, postId));
    if (duaRequestId) conditions.push(eq(bookmarks.dua_request_id, duaRequestId));
    
    const result = await db.select().from(bookmarks).where(and(...conditions)).limit(1);
    return result[0];
  }

  async toggleBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<{ bookmarked: boolean }> {
    const existingBookmark = await this.getUserBookmark(userId, postId, duaRequestId);
    
    if (existingBookmark) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existingBookmark.id));
      return { bookmarked: false };
    } else {
      await db.insert(bookmarks).values({
        user_id: userId,
        post_id: postId || null,
        dua_request_id: duaRequestId || null
      });
      return { bookmarked: true };
    }
  }

  // Communities
  async getCommunities(limit = 50): Promise<(Community & { users: User })[]> {
    const result = await db
      .select()
      .from(communities)
      .leftJoin(users, eq(communities.created_by, users.id))
      .orderBy(desc(communities.created_at))
      .limit(limit);
    
    return result.map(row => ({
      ...row.communities,
      users: row.users!
    }));
  }

  async createCommunity(community: InsertCommunity): Promise<Community> {
    const result = await db.insert(communities).values(community).returning();
    return result[0];
  }

  async joinCommunity(communityId: string, userId: string): Promise<CommunityMember> {
    const result = await db.insert(communityMembers).values({
      community_id: communityId,
      user_id: userId,
      role: 'member'
    }).returning();
    return result[0];
  }

  // Events
  async getEvents(limit = 50): Promise<(Event & { users: User })[]> {
    const result = await db
      .select()
      .from(events)
      .leftJoin(users, eq(events.created_by, users.id))
      .orderBy(desc(events.created_at))
      .limit(limit);
    
    return result.map(row => ({
      ...row.events,
      users: row.users!
    }));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async attendEvent(eventId: string, userId: string): Promise<EventAttendee> {
    const result = await db.insert(eventAttendees).values({
      event_id: eventId,
      user_id: userId
    }).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
