import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase credentials
export const hasValidCredentials = supabaseUrl && 
                           supabaseAnonKey &&
                           typeof supabaseUrl === 'string' &&
                           typeof supabaseAnonKey === 'string' &&
                           supabaseUrl.includes('.supabase.co') &&
                           supabaseUrl.length > 30 &&
                           supabaseAnonKey.length > 30;

// Only create client if we have valid credentials
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'X-Client-Info': 'islamic-social-platform'
        }
      }
    })
  : null;

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not found or invalid. Using demo mode.');
  console.warn('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
}

// Export configuration status
export const isSupabaseConfigured = hasValidCredentials;



// Database Types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          verified: boolean;
          role: 'user' | 'admin' | 'moderator';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          verified?: boolean;
          role?: 'user' | 'admin' | 'moderator';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          type: 'text' | 'image' | 'video';
          media_url: string | null;
          category: string;
          tags: string[];
          likes_count: number;
          comments_count: number;
          shares_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          type?: 'text' | 'image' | 'video';
          media_url?: string | null;
          category?: string;
          tags?: string[];
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          type?: 'text' | 'image' | 'video';
          media_url?: string | null;
          category?: string;
          tags?: string[];
          updated_at?: string;
        };
      };
      dua_requests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          is_urgent: boolean;
          is_anonymous: boolean;
          tags: string[];
          prayers_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category: string;
          is_urgent?: boolean;
          is_anonymous?: boolean;
          tags?: string[];
          prayers_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          category?: string;
          is_urgent?: boolean;
          is_anonymous?: boolean;
          tags?: string[];
          updated_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          dua_request_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          dua_request_id?: string | null;
          created_at?: string;
        };
        Update: {};
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          dua_request_id: string | null;
          content: string;
          is_prayer: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          dua_request_id?: string | null;
          content: string;
          is_prayer?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          dua_request_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          dua_request_id?: string | null;
          created_at?: string;
        };
        Update: {};
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          is_private: boolean;
          cover_image: string | null;
          location: string | null;
          member_count: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          category: string;
          is_private?: boolean;
          cover_image?: string | null;
          location?: string | null;
          member_count?: number;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          category?: string;
          is_private?: boolean;
          cover_image?: string | null;
          location?: string | null;
          updated_at?: string;
        };
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          role: 'member' | 'admin' | 'moderator';
          joined_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          role?: 'member' | 'admin' | 'moderator';
          joined_at?: string;
        };
        Update: {
          role?: 'member' | 'admin' | 'moderator';
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: string;
          date: string;
          time: string;
          location_name: string;
          location_address: string;
          location_city: string;
          organizer_name: string;
          organizer_contact: string | null;
          capacity: number;
          attendees_count: number;
          price: number;
          is_online: boolean;
          image_url: string | null;
          tags: string[];
          requirements: string[];
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: string;
          date: string;
          time: string;
          location_name: string;
          location_address: string;
          location_city: string;
          organizer_name: string;
          organizer_contact?: string | null;
          capacity?: number;
          attendees_count?: number;
          price?: number;
          is_online?: boolean;
          image_url?: string | null;
          tags?: string[];
          requirements?: string[];
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          type?: string;
          date?: string;
          time?: string;
          location_name?: string;
          location_address?: string;
          location_city?: string;
          organizer_name?: string;
          organizer_contact?: string | null;
          capacity?: number;
          price?: number;
          is_online?: boolean;
          image_url?: string | null;
          tags?: string[];
          requirements?: string[];
          updated_at?: string;
        };
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registered_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          registered_at?: string;
        };
        Update: {};
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Helper functions for database operations with error handling
export const dbHelpers = {
  // Users
  async getUser(userId: string) {
    try {
      if (!hasValidCredentials || !supabase) {
        return { data: null, error: { message: 'Supabase not configured' } };
      }
      
      const { data, error } = await supabase!
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateUser(userId: string, updates: Database['public']['Tables']['users']['Update']) {
    try {
      if (!hasValidCredentials || !supabase) {
        return { data: null, error: { message: 'Supabase not configured' } };
      }
      
      const { data, error } = await supabase!
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Posts
  async getPosts(limit = 20, offset = 0, filterTag?: string) {
    try {
      if (!hasValidCredentials) {
        // Return mock data when Supabase is not configured
        return { 
          data: [], 
          error: null 
        };
      }
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          users (
            id,
            name,
            username,
            avatar_url,
            verified,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Tag filtresi varsa uygula
      if (filterTag) {
        query = query.or(`tags.cs.{${filterTag}},category.ilike.%${filterTag}%,content.ilike.%${filterTag}%`);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: [], error };
    }
  },

  async createPost(post: Database['public']['Tables']['posts']['Insert']) {
    try {
      if (!hasValidCredentials) {
        return { data: null, error: { message: 'Supabase not configured' } };
      }
      
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select(`
          *,
          users (
            id,
            name,
            username,
            avatar_url,
            verified,
            role
          )
        `)
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async deletePost(postId: string, userId: string) {
    try {
      if (!hasValidCredentials) {
        return { data: null, error: { message: 'Supabase not configured' } };
      }
      
      // Önce kullanıcının yetkisini kontrol et
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      const { data, error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .or(`user_id.eq.${userId}${user?.role === 'admin' ? ',user_id.neq.null' : ''}`);
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Likes
  async toggleLike(userId: string, postId?: string, duaRequestId?: string) {
    try {
      if (!hasValidCredentials) {
        return { data: { liked: false }, error: { message: 'Supabase not configured' } };
      }
      
      // Check if like exists
      let query = supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId);

      if (postId) {
        query = query.eq('post_id', postId);
      } else if (duaRequestId) {
        query = query.eq('dua_request_id', duaRequestId);
      }

      const { data: existingLike } = await query.single();

      if (existingLike) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
        
        return { data: { liked: false }, error };
      } else {
        // Add like
        const { data, error } = await supabase
          .from('likes')
          .insert({
            user_id: userId,
            post_id: postId || null,
            dua_request_id: duaRequestId || null
          })
          .select()
          .single();
        
        return { data: { liked: true, ...data }, error };
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      return { data: null, error };
    }
  },

  // Comments
  async getComments(postId?: string, duaRequestId?: string) {
    try {
      if (!hasValidCredentials) {
        return { data: [], error: null };
      }
      
      let query = supabase
        .from('comments')
        .select(`
          *,
          users (
            id,
            name,
            username,
            avatar_url,
            verified,
            role
          )
        `)
        .order('created_at', { ascending: true });

      if (postId) {
        query = query.eq('post_id', postId);
      } else if (duaRequestId) {
        query = query.eq('dua_request_id', duaRequestId);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: [], error };
    }
  },

  async createComment(comment: Database['public']['Tables']['comments']['Insert']) {
    try {
      if (!hasValidCredentials) {
        return { data: null, error: { message: 'Supabase not configured' } };
      }
      
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select(`
          *,
          users (
            id,
            name,
            username,
            avatar_url,
            verified,
            role
          )
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Bookmarks
  async toggleBookmark(userId: string, postId?: string, duaRequestId?: string) {
    try {
      if (!hasValidCredentials) {
        return { data: { bookmarked: false }, error: { message: 'Supabase not configured' } };
      }
      
      // Check if bookmark exists
      let query = supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId);

      if (postId) {
        query = query.eq('post_id', postId);
      } else if (duaRequestId) {
        query = query.eq('dua_request_id', duaRequestId);
      }

      const { data: existingBookmark } = await query.single();

      if (existingBookmark) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existingBookmark.id);
        return { data: { bookmarked: false }, error };
      } else {
        // Add bookmark
        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            post_id: postId || null,
            dua_request_id: duaRequestId || null
          })
          .select()
          .single();
        return { data: { bookmarked: true, ...data }, error };
      }
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      return { data: null, error };
    }
  },

  // Share count
  async incrementShareCount(postId: string) {
    try {
      if (!hasValidCredentials) {
        return { data: null, error: { message: 'Supabase not configured' } };
      }
      
      const { data, error } = await supabase.rpc('increment_post_shares', { post_id: postId });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

