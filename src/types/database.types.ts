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
      branches: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      employees: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          daily_rate: number;
          hire_date: string;
          is_active: boolean;
          avatar_color: string | null;
          pay_frequency: "weekly" | "semi_monthly" | "monthly";
          created_at: string;
          updated_at: string;
          branch_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          daily_rate: number;
          hire_date: string;
          is_active?: boolean;
          avatar_color?: string | null;
          pay_frequency?: "weekly" | "semi_monthly" | "monthly";
          created_at?: string;
          updated_at?: string;
          branch_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          daily_rate?: number;
          hire_date?: string;
          is_active?: boolean;
          avatar_color?: string | null;
          pay_frequency?: "weekly" | "semi_monthly" | "monthly";
          created_at?: string;
          updated_at?: string;
          branch_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "manager" | "staff";
          created_at: string;
          updated_at: string;
          branch_id: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: "manager" | "staff";
          created_at?: string;
          updated_at?: string;
          branch_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "manager" | "staff";
          created_at?: string;
          updated_at?: string;
          branch_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      sales: {
        Row: {
          id: string;
          date: string;
          product_id: string;
          quantity_sold: number;
          unit_price: number;
          amount: number;
          notes: string | null;
          order_id: string | null;
          created_at: string;
          updated_at: string;
          branch_id: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          product_id: string;
          quantity_sold: number;
          unit_price: number;
          amount: number;
          notes?: string | null;
          order_id?: string | null;
          created_at?: string;
          updated_at?: string;
          branch_id?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          product_id?: string;
          quantity_sold?: number;
          unit_price?: number;
          amount?: number;
          notes?: string | null;
          order_id?: string | null;
          created_at?: string;
          updated_at?: string;
          branch_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sales_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sales_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          default_price: number;
          unit: string;
          is_active: boolean;
          reorder_threshold: number | null;
          estimated_cost_per_unit: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          default_price: number;
          unit: string;
          is_active?: boolean;
          reorder_threshold?: number | null;
          estimated_cost_per_unit?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          default_price?: number;
          unit?: string;
          is_active?: boolean;
          reorder_threshold?: number | null;
          estimated_cost_per_unit?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          date: string;
          category_id: string;
          description: string | null;
          amount: number;
          supplier: string | null;
          payment_method: string;
          fund_source: string | null;
          product_id: string | null;
          quantity_purchased: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          category_id: string;
          description?: string | null;
          amount: number;
          supplier?: string | null;
          payment_method: string;
          fund_source?: string | null;
          product_id?: string | null;
          quantity_purchased?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          category_id?: string;
          description?: string | null;
          amount?: number;
          supplier?: string | null;
          payment_method?: string;
          fund_source?: string | null;
          product_id?: string | null;
          quantity_purchased?: number | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          clock_in: string | null;
          clock_out: string | null;
          hours_worked: number | null;
          shift: "full" | "half" | null;
          status: "present" | "absent" | "closed" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date: string;
          clock_in?: string | null;
          clock_out?: string | null;
          hours_worked?: number | null;
          shift?: "full" | "half" | null;
          status?: "present" | "absent" | "closed" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          clock_in?: string | null;
          clock_out?: string | null;
          hours_worked?: number | null;
          shift?: "full" | "half" | null;
          status?: "present" | "absent" | "closed" | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_records_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      cash_advances: {
        Row: {
          id: string;
          employee_id: string;
          amount: number;
          date: string;
          status: "pending" | "deducted";
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          amount: number;
          date: string;
          status?: "pending" | "deducted";
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          amount?: number;
          date?: string;
          status?: "pending" | "deducted";
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cash_advances_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      loans: {
        Row: {
          id: string;
          employee_id: string;
          principal: number;
          remaining_balance: number;
          date_issued: string;
          status: "active" | "paid";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          principal: number;
          remaining_balance: number;
          date_issued: string;
          status?: "active" | "paid";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          principal?: number;
          remaining_balance?: number;
          date_issued?: string;
          status?: "active" | "paid";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loans_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      repayments: {
        Row: {
          id: string;
          loan_id: string;
          amount: number;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          loan_id: string;
          amount: number;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          loan_id?: string;
          amount?: number;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "repayments_loan_id_fkey";
            columns: ["loan_id"];
            isOneToOne: false;
            referencedRelation: "loans";
            referencedColumns: ["id"];
          },
        ];
      };
      payroll_runs: {
        Row: {
          id: string;
          employee_id: string;
          period_start: string;
          period_end: string;
          hours_worked: number;
          daily_rate: number;
          gross_pay: number;
          advance_deductions: number;
          loan_deductions: number;
          adjustments: number;
          adjustment_note: string | null;
          net_pay: number;
          status: string;
          paid_at: string | null;
          advance_ids: string[] | null;
          loan_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          period_start: string;
          period_end: string;
          hours_worked: number;
          daily_rate: number;
          gross_pay: number;
          advance_deductions: number;
          loan_deductions: number;
          adjustments: number;
          adjustment_note?: string | null;
          net_pay: number;
          status?: string;
          paid_at?: string | null;
          advance_ids?: string[] | null;
          loan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          period_start?: string;
          period_end?: string;
          hours_worked?: number;
          daily_rate?: number;
          gross_pay?: number;
          advance_deductions?: number;
          loan_deductions?: number;
          adjustments?: number;
          adjustment_note?: string | null;
          net_pay?: number;
          status?: string;
          paid_at?: string | null;
          advance_ids?: string[] | null;
          loan_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_runs_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"],
          },
        ];
      };
      pay_rule_settings: {
        Row: {
          id: string;
          default_reorder_threshold: number;
          default_opening_cash: number;
          spoilage_rate_threshold: number;
          standard_hours_per_day: number;
          half_day_threshold_hours: number;
          half_day_rate_multiplier: number;
          late_grace_minutes: number;
          late_deduction_per_minute: number;
          absence_deduction_mode: "full_day" | "none";
          rest_day_rate_multiplier: number;
          holiday_rate_multiplier: number;
          night_differential_percent: number;
          round_hours_to: number;
          payday_rules: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          default_reorder_threshold?: number;
          default_opening_cash?: number;
          spoilage_rate_threshold?: number;
          standard_hours_per_day?: number;
          half_day_threshold_hours?: number;
          half_day_rate_multiplier?: number;
          late_grace_minutes?: number;
          late_deduction_per_minute?: number;
          absence_deduction_mode?: "full_day" | "none";
          rest_day_rate_multiplier?: number;
          holiday_rate_multiplier?: number;
          night_differential_percent?: number;
          round_hours_to?: number;
          payday_rules?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          default_reorder_threshold?: number;
          default_opening_cash?: number;
          spoilage_rate_threshold?: number;
          standard_hours_per_day?: number;
          half_day_threshold_hours?: number;
          half_day_rate_multiplier?: number;
          late_grace_minutes?: number;
          late_deduction_per_minute?: number;
          absence_deduction_mode?: "full_day" | "none";
          rest_day_rate_multiplier?: number;
          holiday_rate_multiplier?: number;
          night_differential_percent?: number;
          round_hours_to?: number;
          payday_rules?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      employee_pay_overrides: {
        Row: {
          id: string;
          employee_id: string;
          half_day_rate_multiplier: number | null;
          late_deduction_per_minute: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          half_day_rate_multiplier?: number | null;
          late_deduction_per_minute?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          half_day_rate_multiplier?: number | null;
          late_deduction_per_minute?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_pay_overrides_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
        ];
      };
      cash_openings: {
        Row: {
          id: string;
          date: string;
          opening_cash: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          opening_cash: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          opening_cash?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cash_counts: {
        Row: {
          id: string;
          date: string;
          expected_cash: number;
          actual_cash: number;
          difference: number;
          remarks: string | null;
          counted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          expected_cash: number;
          actual_cash: number;
          difference: number;
          remarks?: string | null;
          counted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          expected_cash?: number;
          actual_cash?: number;
          difference?: number;
          remarks?: string | null;
          counted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      owner_withdrawals: {
        Row: {
          id: string;
          date: string;
          amount: number;
          reason: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          amount: number;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          amount?: number;
          reason?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_adjustments: {
        Row: {
          id: string;
          product_id: string;
          date: string;
          quantity: number;
          note: string | null;
          reason: string;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          date: string;
          quantity: number;
          note?: string | null;
          reason?: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          date?: string;
          quantity?: number;
          note?: string | null;
          reason?: string;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          date: string;
          scheduled_time: string | null;
          customer_name: string;
          contact_number: string;
          status: "scheduled" | "completed" | "cancelled";
          total: number;
          deposit_amount: number;
          balance_amount: number;
          cancel_reason: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          date: string;
          scheduled_time?: string | null;
          customer_name: string;
          contact_number?: string;
          status?: "scheduled" | "completed" | "cancelled";
          total?: number;
          deposit_amount?: number;
          balance_amount?: number;
          cancel_reason?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          date?: string;
          scheduled_time?: string | null;
          customer_name?: string;
          contact_number?: string;
          status?: "scheduled" | "completed" | "cancelled";
          total?: number;
          deposit_amount?: number;
          balance_amount?: number;
          cancel_reason?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          amount: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          amount: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          amount?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"],
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"],
          },
        ];
      };
      scheduled_order_payments: {
        Row: {
          id: string;
          order_id: string;
          payment_type: string;
          amount: number;
          payment_date: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          payment_type: string;
          amount: number;
          payment_date: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          payment_type?: string;
          amount?: number;
          payment_date?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scheduled_order_payments_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"],
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      pay_payroll_run: {
        Args: {
          p_employee_id: string;
          p_period_start: string;
          p_period_end: string;
          p_hours_worked: number;
          p_daily_rate: number;
          p_gross_pay: number;
          p_advance_ids: string[];
          p_advance_deductions: number;
          p_loan_id: string;
          p_loan_deduction: number;
          p_adjustments: number;
          p_adjustment_note: string;
          p_net_pay: number;
          p_paid_at: string;
          p_salaries_category_id: string;
          p_ready_run_id?: string;
        };
        Returns: void;
      };
    };
    Enums: {
      pay_frequency: "weekly" | "semi_monthly" | "monthly";
      payment_method: "cash" | "gcash" | "bank_transfer" | "credit";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};