import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { PayRuleSettingsForm } from "@/features/settings/components/PayRuleSettingsForm";

export function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Pay rule settings</CardTitle>
          <CardDescription>Business-wide defaults — per-employee overrides are set on each employee profile.</CardDescription>
        </div>
      </CardHeader>
      <PayRuleSettingsForm />
    </Card>
  );
}
