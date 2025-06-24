import { DatabaseStorage } from "./storage";
import { createClient } from '@supabase/supabase-js';
import type { User, InsertUser, Post, InsertPost, DuaRequest, InsertDuaRequest, Comment, InsertComment, Community, InsertCommunity, Event, InsertEvent, Like, Bookmark, CommunityMember, EventAttendee } from "@shared/schema";

// Dual storage system that uses both PostgreSQL and Supabase
export class DualStorage {
  private postgresStorage: DatabaseStorage;
  private supabase: any;
  private supabaseEnabled: boolean = false;

  constructor() {
    this.postgresStorage = new DatabaseStorage();
    
    // Initialize Supabase if credentials are available
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.supabaseEnabled = true;
      console.log('✅ Dual storage initialized with PostgreSQL + Supabase');
    } else {
      console.log('⚠️ Supabase credentials not found, using PostgreSQL only');
    }
  }

  // Helper method to execute operations on both databases
  private async executeOnBoth<T>(
    postgresOp: () => Promise<T>,
    supabaseOp?: () => Promise<any>
  ): Promise<T> {
    let postgresResult: T;
    
    try {
      // Primary operation on PostgreSQL
      postgresResult = await postgresOp();
    } catch (error) {
      console.error('PostgreSQL operation failed:', error);
      
      // If PostgreSQL fails and Supabase is available, try fallback
      if (this.supabaseEnabled && supabaseOp) {
        try {
          console.log('Attempting Supabase fallback...');
          const supabaseResult = await supabaseOp();
          return supabaseResult?.data || supabaseResult;
        } catch (supabaseError) {
          console.error('Supabase fallback also failed:', supabaseError);
          throw error; // Re-throw original PostgreSQL error
        }
      }
      throw error;
    }

    // If PostgreSQL succeeded and Supabase is enabled, sync to Supabase
    if (this.supabaseEnabled && supabaseOp) {
      try {
        await supabaseOp();
        console.log('✅ Data synced to Supabase');
      } catch (supabaseError) {
        console.warn('⚠️ Supabase sync failed (PostgreSQL operation succeeded):', supabaseError);
      }
    }

    return postgresResult;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.executeOnBoth(
      () => this.postgresStorage.getUser(id),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        return data;
      } : undefined
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.executeOnBoth(
      () => this.postgresStorage.getUserByUsername(username),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();
        return data;
      } : undefined
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.executeOnBoth(
      () => this.postgresStorage.getUserByEmail(email),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        return data;
      } : undefined
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.executeOnBoth(
      () => this.postgresStorage.createUser(user),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('users')
          .insert(user)
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    return this.executeOnBoth(
      () => this.postgresStorage.updateUser(id, userData),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('users')
          .update(userData)
          .eq('id', id)
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  // Posts
  async getPosts(limit = 50): Promise<(Post & { users: User })[]> {
    return this.executeOnBoth(
      () => this.postgresStorage.getPosts(limit),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('posts')
          .select(`
            *,
            users (*)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        return data || [];
      } : undefined
    );
  }

  async getPostById(id: string): Promise<(Post & { users: User }) | undefined> {
    return this.executeOnBoth(
      () => this.postgresStorage.getPostById(id),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('posts')
          .select(`
            *,
            users (*)
          `)
          .eq('id', id)
          .single();
        return data;
      } : undefined
    );
  }

  async createPost(post: InsertPost): Promise<Post> {
    return this.executeOnBoth(
      () => this.postgresStorage.createPost(post),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('posts')
          .insert(post)
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  async deletePost(id: string): Promise<boolean> {
    return this.executeOnBoth(
      () => this.postgresStorage.deletePost(id),
      this.supabaseEnabled ? async () => {
        const { error } = await this.supabase
          .from('posts')
          .delete()
          .eq('id', id);
        return !error;
      } : undefined
    );
  }

  // Dua Requests
  async getDuaRequests(limit = 50): Promise<(DuaRequest & { users: User })[]> {
    return this.executeOnBoth(
      () => this.postgresStorage.getDuaRequests(limit),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('dua_requests')
          .select(`
            *,
            users (*)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        return data || [];
      } : undefined
    );
  }

  async createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest> {
    return this.executeOnBoth(
      () => this.postgresStorage.createDuaRequest(duaRequest),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('dua_requests')
          .insert(duaRequest)
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<(Comment & { users: User })[]> {
    return this.executeOnBoth(
      () => this.postgresStorage.getCommentsByPostId(postId),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('comments')
          .select(`
            *,
            users (*)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true });
        return data || [];
      } : undefined
    );
  }

  async getCommentsByDuaRequestId(duaRequestId: string): Promise<(Comment & { users: User })[]> {
    return this.executeOnBoth(
      () => this.postgresStorage.getCommentsByDuaRequestId(duaRequestId),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('comments')
          .select(`
            *,
            users (*)
          `)
          .eq('dua_request_id', duaRequestId)
          .order('created_at', { ascending: true });
        return data || [];
      } : undefined
    );
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    return this.executeOnBoth(
      () => this.postgresStorage.createComment(comment),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('comments')
          .insert(comment)
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  // Likes
  async toggleLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ liked: boolean }> {
    return this.executeOnBoth(
      () => this.postgresStorage.toggleLike(userId, postId, duaRequestId),
      this.supabaseEnabled ? async () => {
        // Check if like exists
        let query = this.supabase
          .from('likes')
          .select('id')
          .eq('user_id', userId);

        if (postId) query = query.eq('post_id', postId);
        if (duaRequestId) query = query.eq('dua_request_id', duaRequestId);

        const { data: existingLike } = await query.single();

        if (existingLike) {
          await this.supabase
            .from('likes')
            .delete()
            .eq('id', existingLike.id);
          return { liked: false };
        } else {
          await this.supabase
            .from('likes')
            .insert({
              user_id: userId,
              post_id: postId || null,
              dua_request_id: duaRequestId || null
            });
          return { liked: true };
        }
      } : undefined
    );
  }

  // Communities
  async getCommunities(limit = 50): Promise<(Community & { users: User })[]> {
    return this.executeOnBoth(
      () => this.postgresStorage.getCommunities(limit),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('communities')
          .select(`
            *,
            users (*)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        return data || [];
      } : undefined
    );
  }

  async createCommunity(community: InsertCommunity): Promise<Community> {
    return this.executeOnBoth(
      () => this.postgresStorage.createCommunity(community),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('communities')
          .insert(community)
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  async joinCommunity(communityId: string, userId: string): Promise<CommunityMember> {
    return this.executeOnBoth(
      () => this.postgresStorage.joinCommunity(communityId, userId),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('community_members')
          .insert({
            community_id: communityId,
            user_id: userId,
            role: 'member'
          })
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  // Bookmarks
  async getUserBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<Bookmark | undefined> {
    return this.executeOnBoth(
      () => this.postgresStorage.getUserBookmark(userId, postId, duaRequestId),
      this.supabaseEnabled ? async () => {
        let query = this.supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', userId);

        if (postId) query = query.eq('post_id', postId);
        if (duaRequestId) query = query.eq('dua_request_id', duaRequestId);

        const { data } = await query.single();
        return data;
      } : undefined
    );
  }

  async toggleBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<{ bookmarked: boolean }> {
    return this.executeOnBoth(
      () => this.postgresStorage.toggleBookmark(userId, postId, duaRequestId),
      this.supabaseEnabled ? async () => {
        // Check if bookmark exists
        let query = this.supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', userId);

        if (postId) query = query.eq('post_id', postId);
        if (duaRequestId) query = query.eq('dua_request_id', duaRequestId);

        const { data: existingBookmark } = await query.single();

        if (existingBookmark) {
          await this.supabase
            .from('bookmarks')
            .delete()
            .eq('id', existingBookmark.id);
          return { bookmarked: false };
        } else {
          await this.supabase
            .from('bookmarks')
            .insert({
              user_id: userId,
              post_id: postId || null,
              dua_request_id: duaRequestId || null
            });
          return { bookmarked: true };
        }
      } : undefined
    );
  }

  // Events
  async getEvents(limit = 50): Promise<(Event & { users: User })[]> {
    return this.executeOnBoth(
      () => this.postgresStorage.getEvents(limit),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('events')
          .select(`
            *,
            users (*)
          `)
          .order('created_at', { ascending: false })
          .limit(limit);
        return data || [];
      } : undefined
    );
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    return this.executeOnBoth(
      () => this.postgresStorage.createEvent(event),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('events')
          .insert(event)
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  async attendEvent(eventId: string, userId: string): Promise<EventAttendee> {
    return this.executeOnBoth(
      () => this.postgresStorage.attendEvent(eventId, userId),
      this.supabaseEnabled ? async () => {
        const { data } = await this.supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: userId
          })
          .select()
          .single();
        return data;
      } : undefined
    );
  }

  // Health check methods
  async checkPostgresHealth(): Promise<boolean> {
    try {
      // Simple database connection test
      const { db } = await import('./db');
      const { sql } = await import('drizzle-orm');
      await db.execute(sql`SELECT 1 as test`);
      return true;
    } catch {
      return false;
    }
  }

  async checkSupabaseHealth(): Promise<boolean> {
    if (!this.supabaseEnabled) return false;
    
    try {
      await this.supabase.from('users').select('id').limit(1);
      return true;
    } catch {
      return false;
    }
  }

  async getSystemHealth(): Promise<{
    postgres: boolean;
    supabase: boolean;
    status: 'healthy' | 'degraded' | 'down';
  }> {
    const postgres = await this.checkPostgresHealth();
    const supabase = await this.checkSupabaseHealth();
    
    let status: 'healthy' | 'degraded' | 'down';
    if (postgres && (supabase || !this.supabaseEnabled)) {
      status = 'healthy';
    } else if (postgres || supabase) {
      status = 'degraded';
    } else {
      status = 'down';
    }

    return { postgres, supabase, status };
  }
}

export const dualStorage = new DualStorage();