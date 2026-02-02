export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          checkout_data: Json | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          checkout_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          checkout_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_chat_history: {
        Row: {
          account_id: string | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          recommended_books: Json | null
          role: string
          session_id: string
        }
        Insert: {
          account_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recommended_books?: Json | null
          role: string
          session_id: string
        }
        Update: {
          account_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recommended_books?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_config: {
        Row: {
          api_key: string | null
          cloud_provider: string | null
          config: Json | null
          created_at: string | null
          deployment_type: string
          enable_book_recommend: boolean | null
          enable_book_search: boolean | null
          enable_rag: boolean | null
          enable_user_access: boolean | null
          id: string
          local_provider: string | null
          model: string | null
          ollama_model: string | null
          ollama_url: string | null
          system_prompt: string | null
          temperature: number | null
          top_p: number | null
          updated_at: string | null
          updated_by: string | null
          user_credits_limit: number | null
        }
        Insert: {
          api_key?: string | null
          cloud_provider?: string | null
          config?: Json | null
          created_at?: string | null
          deployment_type?: string
          enable_book_recommend?: boolean | null
          enable_book_search?: boolean | null
          enable_rag?: boolean | null
          enable_user_access?: boolean | null
          id?: string
          local_provider?: string | null
          model?: string | null
          ollama_model?: string | null
          ollama_url?: string | null
          system_prompt?: string | null
          temperature?: number | null
          top_p?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_credits_limit?: number | null
        }
        Update: {
          api_key?: string | null
          cloud_provider?: string | null
          config?: Json | null
          created_at?: string | null
          deployment_type?: string
          enable_book_recommend?: boolean | null
          enable_book_search?: boolean | null
          enable_rag?: boolean | null
          enable_user_access?: boolean | null
          id?: string
          local_provider?: string | null
          model?: string | null
          ollama_model?: string | null
          ollama_url?: string | null
          system_prompt?: string | null
          temperature?: number | null
          top_p?: number | null
          updated_at?: string | null
          updated_by?: string | null
          user_credits_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      author_of_the_day: {
        Row: {
          author_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          display_order: number | null
          featured_date: string
          id: string
        }
        Insert: {
          author_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          featured_date: string
          id?: string
        }
        Update: {
          author_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          featured_date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "author_of_the_day_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          book_count: number | null
          created_at: string | null
          created_by: string | null
          id: string
          is_featured: boolean | null
          metadata: Json
          name: string
          nationality: string | null
          social_links: Json | null
          status: string | null
          updated_at: string | null
          updated_by: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          book_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_featured?: boolean | null
          metadata?: Json
          name: string
          nationality?: string | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          book_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_featured?: boolean | null
          metadata?: Json
          name?: string
          nationality?: string | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string | null
          updated_by?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      book_categories: {
        Row: {
          book_id: string
          category_id: string
          created_at: string | null
        }
        Insert: {
          book_id: string
          category_id: string
          created_at?: string | null
        }
        Update: {
          book_id?: string
          category_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_categories_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      book_embeddings: {
        Row: {
          book_id: string
          created_at: string | null
          embedding: string | null
          embedding_model: string | null
          embedding_text: string
          id: string
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          book_id: string
          created_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          embedding_text: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string | null
          embedding?: string | null
          embedding_model?: string | null
          embedding_text?: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_embeddings_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: true
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_of_the_day: {
        Row: {
          book_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          display_order: number | null
          featured_date: string
          id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          featured_date: string
          id?: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          featured_date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_of_the_day_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author_id: string
          categories: string[] | null
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_percentage: number | null
          format: string | null
          id: string
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new_release: boolean | null
          isbn: string | null
          language: string | null
          metadata: Json
          original_price: number | null
          pages: number | null
          price: number
          published_date: string | null
          publisher: string | null
          rating: number | null
          rating_count: number | null
          status: string | null
          stock_quantity: number | null
          subtitle: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          author_id: string
          categories?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_percentage?: number | null
          format?: string | null
          id?: string
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_release?: boolean | null
          isbn?: string | null
          language?: string | null
          metadata?: Json
          original_price?: number | null
          pages?: number | null
          price: number
          published_date?: string | null
          publisher?: string | null
          rating?: number | null
          rating_count?: number | null
          status?: string | null
          stock_quantity?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          author_id?: string
          categories?: string[] | null
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_percentage?: number | null
          format?: string | null
          id?: string
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_release?: boolean | null
          isbn?: string | null
          language?: string | null
          metadata?: Json
          original_price?: number | null
          pages?: number | null
          price?: number
          published_date?: string | null
          publisher?: string | null
          rating?: number | null
          rating_count?: number | null
          status?: string | null
          stock_quantity?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "books_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          added_at: string | null
          book_id: string
          cart_id: string
          id: string
          quantity: number
        }
        Insert: {
          added_at?: string | null
          book_id: string
          cart_id: string
          id?: string
          quantity?: number
        }
        Update: {
          added_at?: string | null
          book_id?: string
          cart_id?: string
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          account_id: string | null
          coupon_id: string | null
          created_at: string | null
          id: string
          session_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          coupon_id?: string | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          coupon_id?: string | null
          created_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          book_count: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          book_count?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          book_count?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          free_shipping: boolean | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          metadata: Json
          min_purchase_amount: number | null
          updated_at: string | null
          updated_by: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          free_shipping?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          metadata?: Json
          min_purchase_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from: string
          valid_until: string
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          free_shipping?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          metadata?: Json
          min_purchase_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      homepage_config: {
        Row: {
          config: Json | null
          created_at: string | null
          display_order: number
          enabled: boolean | null
          id: string
          section_description: string | null
          section_id: string
          section_title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          display_order?: number
          enabled?: boolean | null
          id?: string
          section_description?: string | null
          section_id: string
          section_title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          display_order?: number
          enabled?: boolean | null
          id?: string
          section_description?: string | null
          section_id?: string
          section_title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homepage_config_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          book_id: string
          created_at: string | null
          discount_amount: number | null
          id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          book_id: string
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          book_id?: string
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          account_id: string | null
          actual_delivery_date: string | null
          admin_notes: string | null
          carrier: string | null
          city: string | null
          coupon_code: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          customer_notes: string | null
          delivery_status: Database["public"]["Enums"]["delivery_status"] | null
          delivery_type: string | null
          discount_amount: number | null
          estimated_delivery_date: string | null
          id: string
          order_number: string
          payment_id: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_amount: number | null
          shipping_city: string
          shipping_country: string | null
          shipping_email: string
          shipping_name: string
          shipping_phone: string | null
          shipping_postal_code: string | null
          shipping_state: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          tax_amount: number | null
          total: number
          tracking_number: string | null
          updated_at: string | null
          updated_by: string | null
          wilaya_code: string | null
        }
        Insert: {
          account_id?: string | null
          actual_delivery_date?: string | null
          admin_notes?: string | null
          carrier?: string | null
          city?: string | null
          coupon_code?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_notes?: string | null
          delivery_status?:
            | Database["public"]["Enums"]["delivery_status"]
            | null
          delivery_type?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          id?: string
          order_number: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_amount?: number | null
          shipping_city: string
          shipping_country?: string | null
          shipping_email: string
          shipping_name: string
          shipping_phone?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          tax_amount?: number | null
          total: number
          tracking_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
          wilaya_code?: string | null
        }
        Update: {
          account_id?: string | null
          actual_delivery_date?: string | null
          admin_notes?: string | null
          carrier?: string | null
          city?: string | null
          coupon_code?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_notes?: string | null
          delivery_status?:
            | Database["public"]["Enums"]["delivery_status"]
            | null
          delivery_type?: string | null
          discount_amount?: number | null
          estimated_delivery_date?: string | null
          id?: string
          order_number?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_amount?: number | null
          shipping_city?: string
          shipping_country?: string | null
          shipping_email?: string
          shipping_name?: string
          shipping_phone?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
          wilaya_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_ai_credits: {
        Row: {
          account_id: string
          created_at: string | null
          credits_limit: number
          credits_used: number
          id: string
          last_reset_date: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          credits_limit: number
          credits_used?: number
          id?: string
          last_reset_date?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          credits_limit?: number
          credits_used?: number
          id?: string
          last_reset_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_ai_credits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_author_preferences: {
        Row: {
          account_id: string
          author_id: string
          created_at: string | null
          id: string
          interest_level: number | null
          is_favorite: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          author_id: string
          created_at?: string | null
          id?: string
          interest_level?: number | null
          is_favorite?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          author_id?: string
          created_at?: string | null
          id?: string
          interest_level?: number | null
          is_favorite?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_author_preferences_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_author_preferences_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rating_preferences: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          min_rating: number | null
          preferred_categories: string[] | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          min_rating?: number | null
          preferred_categories?: string[] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          min_rating?: number | null
          preferred_categories?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rating_preferences_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reading_history: {
        Row: {
          account_id: string
          action_type: string
          book_id: string
          created_at: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          account_id: string
          action_type: string
          book_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          account_id?: string
          action_type?: string
          book_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reading_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reading_history_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          account_id: string
          book_id: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          review: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          book_id: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          review?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          book_id?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          review?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          account_id: string
          duration_seconds: number | null
          id: string
          ip_address: unknown | null
          metadata: Json
          page_views: number | null
          referrer: string | null
          session_end: string | null
          session_start: string
          user_agent: string | null
        }
        Insert: {
          account_id: string
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json
          page_views?: number | null
          referrer?: string | null
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
        }
        Update: {
          account_id?: string
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json
          page_views?: number | null
          referrer?: string | null
          session_end?: string | null
          session_start?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wishlist: {
        Row: {
          account_id: string
          book_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          account_id: string
          book_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          account_id?: string
          book_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wishlist_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_wishlist_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_to_cart: {
        Args: {
          book_id_param: string
          cart_id: string
          quantity_param?: number
        }
        Returns: string
      }
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      decrement_category_counts: {
        Args: { category_ids: string[] }
        Returns: undefined
      }
      get_or_create_cart: {
        Args: { user_id?: string }
        Returns: string
      }
      get_order_by_tracking_number: {
        Args: { tracking_number_param: string }
        Returns: {
          city: string
          created_at: string
          currency: string
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          delivery_type: string
          discount_amount: number
          id: string
          order_number: string
          shipping_address_line1: string
          shipping_amount: number
          shipping_city: string
          shipping_country: string
          shipping_email: string
          shipping_name: string
          shipping_phone: string
          shipping_state: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_number: string
          wilaya_code: string
        }[]
      }
      get_preferred_authors: {
        Args: { p_account_id: string; p_min_level?: number }
        Returns: {
          author_id: string
        }[]
      }
      get_reading_history_by_action: {
        Args: { p_account_id: string; p_action_type: string }
        Returns: {
          book_id: string
          created_at: string
        }[]
      }
      get_user_ai_credits: {
        Args: { p_account_id: string }
        Returns: {
          credits_limit: number
          credits_used: number
          is_admin: boolean
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_author_interest: {
        Args: { p_account_id: string; p_amount?: number; p_author_id: string }
        Returns: undefined
      }
      increment_category_counts: {
        Args: { category_ids: string[] }
        Returns: undefined
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_books: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          cover_image_url: string
          description: string
          id: string
          price: number
          similarity: number
          subtitle: string
          title: string
        }[]
      }
      save_checkout_data: {
        Args: {
          checkout_address_line: string
          checkout_city: string
          checkout_delivery_type: string
          checkout_email: string
          checkout_phone: string
          checkout_wilaya_code: string
          user_account_id: string
        }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      use_ai_credits: {
        Args: { p_account_id: string; p_amount?: number }
        Returns: boolean
      }
      validate_coupon: {
        Args: { cart_subtotal: number; coupon_code: string }
        Returns: Json
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      delivery_status:
        | "preparing"
        | "in_transit"
        | "out_for_delivery"
        | "delivered"
        | "failed"
        | "returned"
      discount_type: "percentage" | "fixed" | "buy_x_get_y"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_status: "pending" | "completed" | "failed" | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      delivery_status: [
        "preparing",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "failed",
        "returned",
      ],
      discount_type: ["percentage", "fixed", "buy_x_get_y"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const

