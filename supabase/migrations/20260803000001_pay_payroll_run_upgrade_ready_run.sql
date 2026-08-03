-- ============================================================
-- RPC: pay_payroll_run (v2)
-- Extends the original RPC so that when an employee already has
-- a payroll_runs row with status 'ready' (created when a cash
-- advance deduction is confirmed), the ready run is upgraded to
-- 'paid' instead of inserting a duplicate run for the same period.
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
  p_salaries_category_id uuid,
  p_ready_run_id       uuid DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_run_id         uuid;
  v_remaining      numeric;
  v_advance_ids    jsonb;
  v_existing_ids   jsonb;
  v_existing_ded   numeric := 0;
  v_total_ded      numeric;
BEGIN
  v_advance_ids := COALESCE(to_jsonb(p_advance_ids), '[]'::jsonb);

  IF p_ready_run_id IS NOT NULL THEN
    SELECT COALESCE(advance_ids, '[]'::jsonb), COALESCE(advance_deductions, 0)
      INTO v_existing_ids, v_existing_ded
      FROM payroll_runs
      WHERE id = p_ready_run_id;

    IF FOUND THEN
      -- Merge any extra advances into the ready run's list
      v_advance_ids := v_existing_ids || v_advance_ids;
      SELECT COALESCE(jsonb_agg(DISTINCT value), '[]'::jsonb)
        INTO v_advance_ids
        FROM jsonb_array_elements(v_advance_ids);

      v_total_ded := v_existing_ded + p_advance_deductions;

      UPDATE payroll_runs SET
        hours_worked       = p_hours_worked,
        daily_rate         = p_daily_rate,
        gross_pay          = p_gross_pay,
        advance_ids        = v_advance_ids,
        advance_deductions = v_total_ded,
        loan_deductions    = p_loan_deduction,
        adjustments        = p_adjustments,
        adjustment_note    = p_adjustment_note,
        net_pay            = greatest(0, p_gross_pay - v_total_ded - p_loan_deduction + p_adjustments),
        status             = 'paid',
        paid_at            = p_paid_at
      WHERE id = p_ready_run_id
      RETURNING id INTO v_run_id;

      -- Mark this run's advances as deducted
      UPDATE cash_advances SET status = 'deducted'
        WHERE id = ANY(p_advance_ids) AND status = 'pending';
    ELSE
      -- Ready run was removed; fall back to inserting a new paid run
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

      UPDATE cash_advances SET status = 'deducted'
        WHERE id = ANY(p_advance_ids) AND status = 'pending';
    END IF;
  ELSE
    -- No ready run: normal insert of a paid run
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

    UPDATE cash_advances SET status = 'deducted'
      WHERE id = ANY(p_advance_ids) AND status = 'pending';
  END IF;

  -- Apply loan repayment (single loan, per schema constraint)
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

  -- Create the expense record for the salary payout
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
