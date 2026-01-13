// Database types for Grohn Fabrics

export type ProductType = 'fabric' | 'pillow' | 'curtain' | 'tablecloth' | 'runner';
export type SalesModel = 'meter' | 'unit' | 'preset_sizes';
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type OptionType = 'select' | 'color' | 'size' | 'radio';
export type ReservationStatus = 'active' | 'released' | 'consumed';
export type UserRole = 'admin' | 'sales' | 'production' | 'warehouse' | 'customer';

export interface Company {
  id: string;
  code: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  address?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  name: string;
  company_id: string;
  default_currency: string;
  supported_currencies: string[];
  default_locale: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  parent_id?: string;
  slug: string;
  name_tr: string;
  name_en: string;
  description_tr?: string;
  description_en?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  code?: string;
  composition?: string;
  width_cm?: number;
  weight_gsm?: number;
  shrinkage_percent?: number;
  care_instructions_tr?: string;
  care_instructions_en?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  sku?: string;
  name_tr: string;
  name_en: string;
  description_tr?: string;
  description_en?: string;
  category_id?: string;
  product_type: ProductType;
  sales_model: SalesModel;
  material_id?: string;
  min_order_quantity: number;
  order_step: number;
  images: string[];
  thumbnail_url?: string;
  meta_title_tr?: string;
  meta_title_en?: string;
  meta_description_tr?: string;
  meta_description_en?: string;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  show_in_tr: boolean;
  show_in_global: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: Category;
  material?: Material;
  prices?: ProductPrice[];
  option_groups?: OptionGroup[];
  variants?: ProductVariant[];
  preset_sizes?: PresetSize[];
}

export interface ProductPrice {
  id: string;
  product_id: string;
  market_id: string;
  currency: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  created_at: string;
  updated_at: string;
}

export interface OptionGroup {
  id: string;
  product_id: string;
  name_tr: string;
  name_en: string;
  option_type: OptionType;
  is_required: boolean;
  affects_price: boolean;
  affects_stock: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  values?: OptionValue[];
}

export interface OptionValue {
  id: string;
  option_group_id: string;
  value_tr: string;
  value_en: string;
  sku_suffix?: string;
  hex_color?: string;
  image_url?: string;
  price_modifier: number;
  sort_order: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  options: Record<string, string>;
  stock_quantity: number;
  low_stock_threshold: number;
  price_override_tr?: number;
  price_override_usd?: number;
  price_override_eur?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PresetSize {
  id: string;
  product_id: string;
  name_tr: string;
  name_en: string;
  width_cm: number;
  height_cm: number;
  price_tr?: number;
  price_usd?: number;
  price_eur?: number;
  stock_quantity: number;
  sort_order: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface FabricRoll {
  id: string;
  product_id: string;
  variant_id?: string;
  roll_number?: string;
  lot_number?: string;
  total_meters: number;
  reserved_meters: number;
  available_meters: number;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  tax_id?: string;
  preferred_market?: string;
  preferred_currency?: string;
  preferred_locale?: string;
  is_wholesale: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  label?: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  phone?: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  guest_email?: string;
  guest_info?: Record<string, unknown>;
  market_id: string;
  company_id: string;
  currency: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: OrderStatus;
  shipping_address: Record<string, unknown>;
  billing_address: Record<string, unknown>;
  payment_provider?: string;
  payment_id?: string;
  payment_status?: string;
  shipping_provider?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  customer_notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  items?: OrderItem[];
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  preset_size_id?: string;
  product_name: string;
  product_sku?: string;
  variant_info?: Record<string, unknown>;
  quantity: number;
  unit_type: string;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface ShippingProfile {
  id: string;
  market_id: string;
  provider: string;
  name_tr: string;
  name_en: string;
  base_rate: number;
  per_kg_rate: number;
  free_shipping_threshold?: number;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  reason?: string;
  ip_address?: string;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}
