import type { BaseRecord } from "@/types";
import type { OrderStatus } from "@/lib/constants";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Order extends BaseRecord {
  date: string;
  scheduledTime?: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  notes?: string;
  createdBy?: string;
  items: OrderItem[];
}

export type NewOrder = Omit<Order, "id" | "createdAt" | "updatedAt" | "items"> & {
  items: Omit<OrderItem, "id" | "orderId">[];
};

export type UpdateOrder = Partial<Omit<Order, "id" | "createdAt" | "updatedAt" | "items">> & {
  id: string;
  items?: Omit<OrderItem, "id" | "orderId">[];
};
