UPDATE pay_rule_settings
SET payday_rules = '[
  {"frequency": "weekly", "offsetDays": 0, "weekendAdjustment": "none", "fixedWeekday": 5},
  {"frequency": "semi_monthly", "offsetDays": 0, "weekendAdjustment": "none"},
  {"frequency": "monthly", "offsetDays": 0, "weekendAdjustment": "none"}
]'::jsonb
WHERE id = 'global';
