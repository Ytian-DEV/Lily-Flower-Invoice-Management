export type Json =
  string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type InvoiceStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'partially_paid' | 'paid';
export type ProductAvailability = 'available' | 'unavailable';
export type PaymentMethod = 'cash' | 'gcash' | 'bank_transfer' | 'maribank';
export type UserRole = 'admin' | 'staff';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          full_name: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          customer_code: string;
          full_name: string;
          phone_number: string;
          delivery_address: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_code: string;
          full_name: string;
          phone_number: string;
          delivery_address?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
        Relationships: [];
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          availability: ProductAvailability;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          availability?: ProductAvailability;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['product_categories']['Insert']>;
        Relationships: [];
      };
      colors: {
        Row: {
          id: string;
          color_name: string;
          hex_color: string;
          availability: ProductAvailability;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          color_name: string;
          hex_color: string;
          availability?: ProductAvailability;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['colors']['Insert']>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          product_name: string;
          stem_count: number | null;
          base_price: number;
          availability: ProductAvailability;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          product_name: string;
          stem_count?: number | null;
          base_price: number;
          availability?: ProductAvailability;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'product_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      product_colors: {
        Row: {
          product_id: string;
          color_id: string;
          created_at: string;
        };
        Insert: {
          product_id: string;
          color_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['product_colors']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'product_colors_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'product_colors_color_id_fkey';
            columns: ['color_id'];
            isOneToOne: false;
            referencedRelation: 'colors';
            referencedColumns: ['id'];
          },
        ];
      };
      addons: {
        Row: {
          id: string;
          addon_name: string;
          price: number;
          availability: ProductAvailability;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          addon_name: string;
          price: number;
          availability?: ProductAvailability;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['addons']['Insert']>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_id: string | null;
          customer_name: string;
          subtotal: number;
          discount_percent: number;
          discount_amount: number;
          delivery_fee: number;
          total_amount: number;
          downpayment_amount: number;
          remaining_balance: number;
          status: InvoiceStatus;
          notes: string | null;
          delivery_date: string | null;
          delivery_address: string | null;
          payment_method: PaymentMethod | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          customer_id?: string | null;
          customer_name: string;
          subtotal?: number;
          discount_percent?: number;
          discount_amount?: number;
          delivery_fee?: number;
          total_amount?: number;
          downpayment_amount?: number;
          remaining_balance?: number;
          status?: InvoiceStatus;
          notes?: string | null;
          delivery_date?: string | null;
          delivery_address?: string | null;
          payment_method?: PaymentMethod | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'invoices_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          color_id: string | null;
          color_name: string | null;
          custom_color_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          color_id?: string | null;
          color_name?: string | null;
          custom_color_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'invoice_items_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      invoice_addons: {
        Row: {
          id: string;
          invoice_id: string;
          addon_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          addon_id?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: Partial<Database['public']['Tables']['invoice_addons']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'invoice_addons_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_addons_addon_id_fkey';
            columns: ['addon_id'];
            isOneToOne: false;
            referencedRelation: 'addons';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          payment_method: PaymentMethod;
          amount: number;
          reference_number: string | null;
          payment_status: PaymentStatus;
          payment_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          payment_method: PaymentMethod;
          amount: number;
          reference_number?: string | null;
          payment_status?: PaymentStatus;
          payment_date?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'payments_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_receipts: {
        Row: {
          id: string;
          payment_id: string;
          image_url: string;
          ocr_reference: string | null;
          ocr_sender: string | null;
          ocr_amount: number | null;
          ocr_date: string | null;
          ocr_confidence: number | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          image_url: string;
          ocr_reference?: string | null;
          ocr_sender?: string | null;
          ocr_amount?: number | null;
          ocr_date?: string | null;
          ocr_confidence?: number | null;
          verified?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payment_receipts']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'payment_receipts_payment_id_fkey';
            columns: ['payment_id'];
            isOneToOne: false;
            referencedRelation: 'payments';
            referencedColumns: ['id'];
          },
        ];
      };
      settings: {
        Row: {
          id: string;
          business_name: string;
          business_address: string;
          phone_1: string;
          phone_2: string | null;
          facebook: string | null;
          invoice_prefix: string;
          default_downpayment_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          business_address: string;
          phone_1: string;
          phone_2?: string | null;
          facebook?: string | null;
          invoice_prefix?: string;
          default_downpayment_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      invoice_status: InvoiceStatus;
      payment_status: PaymentStatus;
      product_availability: ProductAvailability;
      payment_method: PaymentMethod;
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database['public']['Tables'];
export type TableRow<TTable extends TableName> =
  Database['public']['Tables'][TTable]['Row'];
export type TableInsert<TTable extends TableName> =
  Database['public']['Tables'][TTable]['Insert'];
export type TableUpdate<TTable extends TableName> =
  Database['public']['Tables'][TTable]['Update'];
