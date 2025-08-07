export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  store: string;
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  fees: number;
}

export interface OrdersResponse {
  orders: Order[];
  nextPage?: number;
}
