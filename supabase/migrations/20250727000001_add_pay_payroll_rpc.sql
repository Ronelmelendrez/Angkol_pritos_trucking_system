-- ============================================================
-- RPC: pay_payroll_run
-- Atomic payroll payment — handles payroll_runs insert,
-- advance settlement, loan repayment, and expense creation
-- in a single transaction.
-- ============================================================

CREATE OR REPLACE FUNCTION pay_payroll_run(
  p_employee_id        uuid,
  p_period_start       date,
  p_period_end         date,
  p_hours_worked       numeric,
  p_daily_rate         numeric,
  p_gross_pay          numeric,
  p_advance_ids        uuid[],
  p_advance_deductions numeric,
  p_loan_id            uuid,
  p_loan_deduction     numeric,
  p_adjustments        numeric,
  p_adjustment_note    text,
  p_net_pay            numeric,
  p_paid_at            timestamptz,
  p_salaries_category_id uuid
) RETURNS uuid AS $$
DECLARE
  v_run_id      uuid;
  v_remaining   numeric;
  v_advance_ids jsonb;
BEGIN
  -- Coalesce null array to empty jsonb array
  v_advance_ids := COALESCE(
    to_jsonb(p_advance_ids),
    '[]'::jsonb
  );

  -- 1. Insert the payroll run record
  INSERT INTO payroll_runs (
    employee_id, period_start, period_end, hours_worked,
    daily_rate, gross_pay, advance_deductions, loan_deductions,
    adjustments, adjustment_note, net_pay, status, paid_at,
    advance_ids, loan_id
  ) VALUES (
    p_employee_id, p_period_start, p_period_end, p_hours_worked,
    p_daily_rate, p_gross_pay, p_advance_deductions, p_loan_deduction,
    p_adjustments, p_adjustment_note, p_net_pay, 'paid', p_paid_at,
    v_advance_ids, p_loan_id
  ) RETURNING id INTO v_run_id;

  -- 2. Mark all referenced advances as deducted
  UPDATE cash_advances SET status = 'deducted'
    WHERE id = ANY(p_advance_ids) AND status = 'pending';

  -- 3. Apply loan repayment (single loan, per schema constraint)
  IF p_loan_id IS NOT NULL AND p_loan_deduction > 0 THEN
    SELECT remaining_balance INTO v_remaining
      FROM loans WHERE id = p_loan_id AND status = 'active';

    IF FOUND AND v_remaining > 0 THEN
      v_remaining := greatest(0, v_remaining - p_loan_deduction);

      UPDATE loans SET
        remaining_balance = v_remaining,
        status = CASE
          WHEN v_remaining <= 0 THEN 'paid'::loan_status
          ELSE 'active'::loan_status
        END
      WHERE id = p_loan_id;

      INSERT INTO repayments (loan_id, amount, date)
        VALUES (p_loan_id, p_loan_deduction, p_paid_at::date);
    END IF;
  END IF;

  -- 4. Create the expense record for the salary payout
  INSERT INTO expenses (date, category_id, description, amount, payment_method)
  VALUES (
    p_paid_at::date,
    p_salaries_category_id,
    'Payroll — ' || p_period_start || ' to ' || p_period_end,
    p_gross_pay,
    'cash'::payment_method
  );

  RETURN v_run_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
