import { createClient } from '@supabase/supabase-js';
import type { 
  User, InsertUser, 
  Post, InsertPost,
  DuaRequest, InsertDuaRequest,
  Comment, InsertComment,
  Like, Bookmark,
  Community, InsertCommunity,
  CommunityMember,
  Event, InsertEvent,
  EventAttendee
} from '@shared/schema';

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export class SupabaseStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data || undefined;
  }

  // Posts
  async getPosts(limit = 50): Promise<(Post & { users: User })[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async getPostById(id: string): Promise<(Post & { users: User }) | undefined> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (*)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deletePost(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Dua Requests
  async getDuaRequests(limit = 50): Promise<(DuaRequest & { users: User })[]> {
    const { data, error } = await supabase
      .from('dua_requests')
      .select(`
        *,
        users (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async getDuaRequestById(id: string): Promise<(DuaRequest & { users: User }) | undefined> {
    const { data, error } = await supabase
      .from('dua_requests')
      .select(`
        *,
        users (*)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async createDuaRequest(duaRequest: InsertDuaRequest): Promise<DuaRequest> {
    const { data, error } = await supabase
      .from('dua_requests')
      .insert(duaRequest)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<(Comment & { users: User })[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getCommentsByDuaRequestId(duaRequestId: string): Promise<(Comment & { users: User })[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (*)
      `)
      .eq('dua_request_id', duaRequestId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update comment count using RPC function
    if (comment.post_id) {
      await supabase.rpc('increment_post_comments', { post_id: comment.post_id });
    } else if (comment.dua_request_id) {
      await supabase.rpc('increment_dua_comments', { dua_id: comment.dua_request_id });
    }
    
    return data;
  }

  // Likes
  async getUserLike(userId: string, postId?: string, duaRequestId?: string): Promise<Like | undefined> {
    let query = supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId);

    if (postId) {
      query = query.eq('post_id', postId);
    } else if (duaRequestId) {
      query = query.eq('dua_request_id', duaRequestId);
    }

    const { data, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async toggleLike(userId: string, postId?: string, duaRequestId?: string): Promise<{ liked: boolean }> {
    const existingLike = await this.getUserLike(userId, postId, duaRequestId);
    
    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) throw error;
      
      // Decrement count
      if (postId) {
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else if (duaRequestId) {
        await supabase.rpc('decrement_dua_prayers', { dua_id: duaRequestId });
      }
      
      return { liked: false };
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: userId,
          post_id: postId || null,
          dua_request_id: duaRequestId || null
        });
      
      if (error) throw error;
      
      // Increment count
      if (postId) {
        await supabase.rpc('increment_post_likes', { post_id: postId });
      } else if (duaRequestId) {
        await supabase.rpc('increment_dua_prayers', { dua_id: duaRequestId });
      }
      
      return { liked: true };
    }
  }

  // Bookmarks
  async getUserBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<Bookmark | undefined> {
    let query = supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId);

    if (postId) {
      query = query.eq('post_id', postId);
    } else if (duaRequestId) {
      query = query.eq('dua_request_id', duaRequestId);
    }

    const { data, error } = await query.single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || undefined;
  }

  async toggleBookmark(userId: string, postId?: string, duaRequestId?: string): Promise<{ bookmarked: boolean }> {
    const existingBookmark = await this.getUserBookmark(userId, postId, duaRequestId);
    
    if (existingBookmark) {
      // Remove bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);
      
      if (error) throw error;
      return { bookmarked: false };
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          post_id: postId || null,
          dua_request_id: duaRequestId || null
        });
      
      if (error) throw error;
      return { bookmarked: true };
    }
  }

  // Communities
  async getCommunities(limit = 50): Promise<(Community & { users: User })[]> {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        users (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async createCommunity(community: InsertCommunity): Promise<Community> {
    const { data, error } = await supabase
      .from('communities')
      .insert(community)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async joinCommunity(communityId: string, userId: string): Promise<CommunityMember> {
    const { data, error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: userId,
        role: 'member'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Events
  async getEvents(limit = 50): Promise<(Event & { users: User })[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        users (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async attendEvent(eventId: string, userId: string): Promise<EventAttendee> {
    const { data, error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Health check for Supabase
  async checkHealth(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }
}

export const storage = new SupabaseStorage();