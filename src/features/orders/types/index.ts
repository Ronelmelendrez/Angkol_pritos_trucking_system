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
  orderNumber: string;
  date: string;
  scheduledTime?: string;
  customerName: string;
  contactNumber: string;
  status: OrderStatus;
  total: number;
  depositAmount: number;
  balanceAmount: number;
  cancelReason?: string;
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

export type PaymentType = "deposit" | "final" | "extra";

export interface OrderPayment {
  id: string;
  orderId: string;
  paymentType: PaymentType;
  amount: number;
  paymentDate: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

export type NewOrderPayment = Omit<OrderPayment, "id" | "createdAt">;
