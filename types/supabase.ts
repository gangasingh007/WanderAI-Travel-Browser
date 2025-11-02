/**
 * Supabase database types
 * This file will be auto-generated when we connect types
 * For now, we'll use a basic structure
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          user_type: "TRAVELER" | "CREATOR"
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          user_type?: "TRAVELER" | "CREATOR"
          bio?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          user_type?: "TRAVELER" | "CREATOR"
          bio?: string | null
        }
      }
      chat: {
        Row: {
          id: string
          title: string
          userId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          title?: string
          userId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          title?: string
          userId?: string
          createdAt?: string
          updatedAt?: string
        }
      }
      message: {
        Row: {
          id: string
          content: string
          sender: string
          chatId: string
          createdAt: string
        }
        Insert: {
          id?: string
          content: string
          sender: string
          chatId: string
          createdAt?: string
        }
        Update: {
          id?: string
          content?: string
          sender?: string
          chatId?: string
          createdAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "TRAVELER" | "CREATOR"
    }
  }
}

