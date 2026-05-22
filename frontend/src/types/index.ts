export interface Product {
  id: number;
  name: string;
  spec: string;
  unit: string;
  reference_price: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItemInput {
  product_name: string;
  spec: string;
  unit: string;
  qty: number;
  price: number;
  amount: number;
  remark: string;
}

export interface OrderItem {
  id: number;
  row_num: number;
  product_name: string;
  spec: string;
  unit: string;
  qty: number;
  price: number;
  amount: number;
  remark: string;
}

export interface Order {
  id: number;
  order_no: string;
  order_date: string;
  total_qty: number;
  total_amount: number;
  amount_cn: string;
  remark: string;
  created_at: string;
  items: OrderItem[];
}

export interface DashboardData {
  today_orders: number;
  today_amount: number;
  month_orders: number;
  month_amount: number;
  recent_orders: Order[];
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}
