export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          city: string | null;
          county: string | null;
          is_business: boolean;
          slug: string | null;
          bio: string | null;
          public_location_label: string | null;
          profile_completed_at: string | null;
          phone_verified_at: string | null;
          email_verified_at: string | null;
          trust_score: number;
          average_rating: number | null;
          reviews_count: number;
          response_rate: number | null;
          average_response_minutes: number | null;
          last_seen_at: string | null;
          is_verified_seller: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          county?: string | null;
          is_business?: boolean;
          slug?: string | null;
          bio?: string | null;
          public_location_label?: string | null;
          profile_completed_at?: string | null;
          phone_verified_at?: string | null;
          email_verified_at?: string | null;
          trust_score?: number;
          average_rating?: number | null;
          reviews_count?: number;
          response_rate?: number | null;
          average_response_minutes?: number | null;
          last_seen_at?: string | null;
          is_verified_seller?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          county?: string | null;
          is_business?: boolean;
          slug?: string | null;
          bio?: string | null;
          public_location_label?: string | null;
          profile_completed_at?: string | null;
          phone_verified_at?: string | null;
          email_verified_at?: string | null;
          trust_score?: number;
          average_rating?: number | null;
          reviews_count?: number;
          response_rate?: number | null;
          average_response_minutes?: number | null;
          last_seen_at?: string | null;
          is_verified_seller?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profile_private_settings: {
        Row: {
          user_id: string;
          phone: string | null;
          contact_preference: Database["public"]["Enums"]["contact_preference"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          phone?: string | null;
          contact_preference?: Database["public"]["Enums"]["contact_preference"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          phone?: string | null;
          contact_preference?: Database["public"]["Enums"]["contact_preference"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          description: string;
          category_slug: string;
          subcategory: string | null;
          type: Database["public"]["Enums"]["listing_type"];
          condition: Database["public"]["Enums"]["listing_condition"];
          status: Database["public"]["Enums"]["listing_status"];
          price_cents: number | null;
          currency: string;
          is_negotiable: boolean;
          city: string;
          county: string;
          city_slug: string | null;
          county_slug: string | null;
          latitude: number | null;
          longitude: number | null;
          public_latitude: number | null;
          public_longitude: number | null;
          location_precision: Database["public"]["Enums"]["listing_location_precision"];
          location_label: string | null;
          location: unknown | null;
          public_location: unknown | null;
          attributes: Json;
          brand: string | null;
          model: string | null;
          year: number | null;
          search_text: string | null;
          contact_preference: Database["public"]["Enums"]["contact_preference"];
          search_document: unknown;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          slug: string;
          description: string;
          category_slug: string;
          subcategory?: string | null;
          type: Database["public"]["Enums"]["listing_type"];
          condition?: Database["public"]["Enums"]["listing_condition"];
          status?: Database["public"]["Enums"]["listing_status"];
          price_cents?: number | null;
          currency?: string;
          is_negotiable?: boolean;
          city: string;
          county: string;
          city_slug?: string | null;
          county_slug?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          public_latitude?: number | null;
          public_longitude?: number | null;
          location_precision?: Database["public"]["Enums"]["listing_location_precision"];
          location_label?: string | null;
          location?: unknown | null;
          public_location?: unknown | null;
          attributes?: Json;
          brand?: string | null;
          model?: string | null;
          year?: number | null;
          search_text?: string | null;
          contact_preference?: Database["public"]["Enums"]["contact_preference"];
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          category_slug?: string;
          subcategory?: string | null;
          type?: Database["public"]["Enums"]["listing_type"];
          condition?: Database["public"]["Enums"]["listing_condition"];
          status?: Database["public"]["Enums"]["listing_status"];
          price_cents?: number | null;
          currency?: string;
          is_negotiable?: boolean;
          city?: string;
          county?: string;
          city_slug?: string | null;
          county_slug?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          public_latitude?: number | null;
          public_longitude?: number | null;
          location_precision?: Database["public"]["Enums"]["listing_location_precision"];
          location_label?: string | null;
          location?: unknown | null;
          public_location?: unknown | null;
          attributes?: Json;
          brand?: string | null;
          model?: string | null;
          year?: number | null;
          search_text?: string | null;
          contact_preference?: Database["public"]["Enums"]["contact_preference"];
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      category_attribute_definitions: {
        Row: {
          id: string;
          category_slug: string;
          key: string;
          label: string;
          type: string;
          unit: string | null;
          options: Json;
          is_required: boolean;
          is_filterable: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_slug: string;
          key: string;
          label: string;
          type: string;
          unit?: string | null;
          options?: Json;
          is_required?: boolean;
          is_filterable?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_slug?: string;
          key?: string;
          label?: string;
          type?: string;
          unit?: string | null;
          options?: Json;
          is_required?: boolean;
          is_filterable?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      search_events: {
        Row: {
          id: string;
          user_id: string | null;
          query: string | null;
          filters: Json;
          results_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          query?: string | null;
          filters?: Json;
          results_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          query?: string | null;
          filters?: Json;
          results_count?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          storage_path?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          query: string | null;
          filters: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          query?: string | null;
          filters?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          query?: string | null;
          filters?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          status: Database["public"]["Enums"]["conversation_status"];
          last_message_at: string | null;
          last_message_preview: string | null;
          last_message_sender_id: string | null;
          buyer_last_read_at: string | null;
          seller_last_read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          status?: Database["public"]["Enums"]["conversation_status"];
          last_message_at?: string | null;
          last_message_preview?: string | null;
          last_message_sender_id?: string | null;
          buyer_last_read_at?: string | null;
          seller_last_read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_id?: string;
          seller_id?: string;
          status?: Database["public"]["Enums"]["conversation_status"];
          last_message_at?: string | null;
          last_message_preview?: string | null;
          last_message_sender_id?: string | null;
          buyer_last_read_at?: string | null;
          seller_last_read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
          edited_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
          edited_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          created_at?: string;
          edited_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          user_id: string;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          user_id?: string;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          entity_type: Database["public"]["Enums"]["report_entity_type"];
          reason: Database["public"]["Enums"]["report_reason"];
          status: Database["public"]["Enums"]["report_status"];
          description: string | null;
          listing_id: string | null;
          conversation_id: string | null;
          message_id: string | null;
          reported_user_id: string | null;
          assigned_admin_id: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          entity_type: Database["public"]["Enums"]["report_entity_type"];
          reason: Database["public"]["Enums"]["report_reason"];
          status?: Database["public"]["Enums"]["report_status"];
          description?: string | null;
          listing_id?: string | null;
          conversation_id?: string | null;
          message_id?: string | null;
          reported_user_id?: string | null;
          assigned_admin_id?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          entity_type?: Database["public"]["Enums"]["report_entity_type"];
          reason?: Database["public"]["Enums"]["report_reason"];
          status?: Database["public"]["Enums"]["report_status"];
          description?: string | null;
          listing_id?: string | null;
          conversation_id?: string | null;
          message_id?: string | null;
          reported_user_id?: string | null;
          assigned_admin_id?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      moderation_events: {
        Row: {
          id: string;
          report_id: string | null;
          admin_id: string | null;
          action: Database["public"]["Enums"]["moderation_action_type"];
          note: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id?: string | null;
          admin_id?: string | null;
          action: Database["public"]["Enums"]["moderation_action_type"];
          note?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string | null;
          admin_id?: string | null;
          action?: Database["public"]["Enums"]["moderation_action_type"];
          note?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      promotion_packages: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string;
          type: Database["public"]["Enums"]["promotion_package_type"];
          duration_days: number;
          price_cents: number;
          currency: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description: string;
          type: Database["public"]["Enums"]["promotion_package_type"];
          duration_days: number;
          price_cents: number;
          currency?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string;
          type?: Database["public"]["Enums"]["promotion_package_type"];
          duration_days?: number;
          price_cents?: number;
          currency?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      promotion_orders: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          package_id: string;
          status: Database["public"]["Enums"]["promotion_order_status"];
          amount_cents: number;
          currency: string;
          note: string | null;
          admin_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          package_id: string;
          status?: Database["public"]["Enums"]["promotion_order_status"];
          amount_cents: number;
          currency?: string;
          note?: string | null;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          package_id?: string;
          status?: Database["public"]["Enums"]["promotion_order_status"];
          amount_cents?: number;
          currency?: string;
          note?: string | null;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      listing_promotions: {
        Row: {
          id: string;
          listing_id: string;
          user_id: string;
          package_id: string;
          order_id: string | null;
          type: Database["public"]["Enums"]["promotion_package_type"];
          status: Database["public"]["Enums"]["listing_promotion_status"];
          starts_at: string;
          ends_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          user_id: string;
          package_id: string;
          order_id?: string | null;
          type: Database["public"]["Enums"]["promotion_package_type"];
          status?: Database["public"]["Enums"]["listing_promotion_status"];
          starts_at?: string;
          ends_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          user_id?: string;
          package_id?: string;
          order_id?: string | null;
          type?: Database["public"]["Enums"]["promotion_package_type"];
          status?: Database["public"]["Enums"]["listing_promotion_status"];
          starts_at?: string;
          ends_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          body: string;
          action_url: string | null;
          data: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          title: string;
          body: string;
          action_url?: string | null;
          data?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          title?: string;
          body?: string;
          action_url?: string | null;
          data?: Json;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          user_id: string;
          email_messages: boolean;
          email_listing_activity: boolean;
          email_saved_searches: boolean;
          email_promotions: boolean;
          email_moderation: boolean;
          email_system: boolean;
          in_app_messages: boolean;
          in_app_listing_activity: boolean;
          in_app_saved_searches: boolean;
          in_app_promotions: boolean;
          in_app_moderation: boolean;
          in_app_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email_messages?: boolean;
          email_listing_activity?: boolean;
          email_saved_searches?: boolean;
          email_promotions?: boolean;
          email_moderation?: boolean;
          email_system?: boolean;
          in_app_messages?: boolean;
          in_app_listing_activity?: boolean;
          in_app_saved_searches?: boolean;
          in_app_promotions?: boolean;
          in_app_moderation?: boolean;
          in_app_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email_messages?: boolean;
          email_listing_activity?: boolean;
          email_saved_searches?: boolean;
          email_promotions?: boolean;
          email_moderation?: boolean;
          email_system?: boolean;
          in_app_messages?: boolean;
          in_app_listing_activity?: boolean;
          in_app_saved_searches?: boolean;
          in_app_promotions?: boolean;
          in_app_moderation?: boolean;
          in_app_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_events: {
        Row: {
          id: string;
          user_id: string | null;
          notification_id: string | null;
          type: Database["public"]["Enums"]["notification_type"];
          to_email: string | null;
          subject: string;
          status: Database["public"]["Enums"]["email_delivery_status"];
          provider_message_id: string | null;
          error_message: string | null;
          created_at: string;
          sent_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          notification_id?: string | null;
          type: Database["public"]["Enums"]["notification_type"];
          to_email?: string | null;
          subject: string;
          status?: Database["public"]["Enums"]["email_delivery_status"];
          provider_message_id?: string | null;
          error_message?: string | null;
          created_at?: string;
          sent_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          notification_id?: string | null;
          type?: Database["public"]["Enums"]["notification_type"];
          to_email?: string | null;
          subject?: string;
          status?: Database["public"]["Enums"]["email_delivery_status"];
          provider_message_id?: string | null;
          error_message?: string | null;
          created_at?: string;
          sent_at?: string | null;
        };
        Relationships: [];
      };
      user_reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewed_user_id: string;
          listing_id: string | null;
          conversation_id: string | null;
          rating: number;
          comment: string | null;
          context: Database["public"]["Enums"]["review_context"];
          status: Database["public"]["Enums"]["review_status"];
          admin_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewed_user_id: string;
          listing_id?: string | null;
          conversation_id?: string | null;
          rating: number;
          comment?: string | null;
          context?: Database["public"]["Enums"]["review_context"];
          status?: Database["public"]["Enums"]["review_status"];
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          reviewed_user_id?: string;
          listing_id?: string | null;
          conversation_id?: string | null;
          rating?: number;
          comment?: string | null;
          context?: Database["public"]["Enums"]["review_context"];
          status?: Database["public"]["Enums"]["review_status"];
          admin_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_trust_badges: {
        Row: {
          id: string;
          user_id: string;
          badge: Database["public"]["Enums"]["trust_badge_code"];
          label: string;
          description: string | null;
          awarded_at: string;
          expires_at: string | null;
          awarded_by: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge: Database["public"]["Enums"]["trust_badge_code"];
          label: string;
          description?: string | null;
          awarded_at?: string;
          expires_at?: string | null;
          awarded_by?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge?: Database["public"]["Enums"]["trust_badge_code"];
          label?: string;
          description?: string | null;
          awarded_at?: string;
          expires_at?: string | null;
          awarded_by?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      profile_verification_requests: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          status: Database["public"]["Enums"]["verification_status"];
          submitted_data: Json;
          admin_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          status?: Database["public"]["Enums"]["verification_status"];
          submitted_data?: Json;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          status?: Database["public"]["Enums"]["verification_status"];
          submitted_data?: Json;
          admin_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      onboarding_events: {
        Row: {
          id: string;
          user_id: string;
          event: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      notification_preference_enabled: {
        Args: {
          target_user_id: string;
          notification_kind: Database["public"]["Enums"]["notification_type"];
          channel: Database["public"]["Enums"]["notification_channel"];
        };
        Returns: boolean;
      };
      normalize_romanian_slug: {
        Args: {
          input: string;
        };
        Returns: string;
      };
      recalculate_user_rating: {
        Args: {
          target_user_id: string;
        };
        Returns: undefined;
      };
      calculate_profile_completion: {
        Args: {
          target_user_id: string;
        };
        Returns: boolean;
      };
      update_profile_trust_score: {
        Args: {
          target_user_id: string;
        };
        Returns: number;
      };
    };
    Enums: {
      listing_type: "sell" | "buy" | "rent" | "swap";
      listing_status:
        | "draft"
        | "active"
        | "reserved"
        | "sold"
        | "expired"
        | "archived";
      listing_condition: "new" | "very_good" | "good" | "used" | "not_applicable";
      listing_location_precision: "city" | "approximate" | "exact_private";
      contact_preference: "chat" | "phone" | "both";
      conversation_status: "active" | "archived" | "blocked";
      report_entity_type: "listing" | "conversation" | "message" | "user";
      report_reason:
        | "fraud"
        | "spam"
        | "duplicate"
        | "wrong_category"
        | "inappropriate"
        | "prohibited"
        | "harassment"
        | "other";
      report_status: "open" | "in_review" | "resolved" | "dismissed";
      moderation_action_type:
        | "report_created"
        | "report_in_review"
        | "report_resolved"
        | "report_dismissed"
        | "note_added"
        | "listing_archived"
        | "listing_reactivated"
        | "listing_expired"
        | "listing_deleted"
        | "user_reviewed"
        | "conversation_reviewed"
        | "message_reviewed";
      promotion_package_type: "boost" | "featured";
      promotion_order_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
        | "cancelled";
      listing_promotion_status:
        | "scheduled"
        | "active"
        | "expired"
        | "cancelled";
      notification_type:
        | "message_received"
        | "listing_favorited"
        | "listing_status_changed"
        | "saved_search_match"
        | "promotion_order_created"
        | "promotion_order_approved"
        | "promotion_order_rejected"
        | "promotion_expiring"
        | "report_submitted"
        | "report_status_changed"
        | "system_announcement"
        | "review_received"
        | "verification_approved"
        | "verification_rejected"
        | "trust_badge_awarded";
      notification_channel: "in_app" | "email";
      email_delivery_status: "queued" | "sent" | "skipped" | "failed";
      verification_status: "unverified" | "pending" | "verified" | "rejected";
      trust_badge_code:
        | "email_verified"
        | "phone_verified"
        | "profile_complete"
        | "fast_responder"
        | "trusted_seller"
        | "business_seller"
        | "top_rated"
        | "new_member";
      review_status: "published" | "pending_review" | "hidden" | "removed";
      review_context: "listing_conversation" | "manual_admin" | "other";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
