import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export type Message = Database['public']['Tables']['messages']['Row'];
export type NewMessage = Database['public']['Tables']['messages']['Insert'];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qxuvqrfqkdpfjfwkqatf.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dXZxcmZxa2RwZmpmd2txYXRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjcxNTIsImV4cCI6MjA3NTAwMzE1Mn0.mAiL1p6YqlSaSFOIDW_G-3e_Mqck0cFqLl74_jyNpk8';

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

export const messageService = {
  async sendMessage(newMessage: Omit<NewMessage, 'id' | 'created_at' | 'updated_at' | 'is_read'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        ...newMessage,
        is_read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return data;
  },

  async getConversations(userId: string) {
    // Get conversation summaries for the user
    const { data, error } = await supabase
      .from('conversation_summaries')
      .select('*')
      .order('last_message_time', { ascending: false });

    if (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }

    return data;
  },

  async getMessages(conversationId: string, userId: string) {
    // Fetch messages without joins for now (until migration is applied)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error getting messages:', error);
      throw error;
    }

    return data;
  },

  async markAsRead(messageIds: string[], userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)
      .eq('receiver_id', userId);

    if (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }

    return count || 0;
  }
};