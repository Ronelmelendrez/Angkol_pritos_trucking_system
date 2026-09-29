import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ConversionForm } from "@/features/chickenParts/components/ConversionForm";
import { ConversionList } from "@/features/chickenParts/components/ConversionList";
import { ConversionOverview } from "@/features/chickenParts/components/ConversionOverview";
import { useChickenPartConversions } from "@/features/chickenParts/hooks/useChickenPartConversions";

export function ChickenPartsPage() {
  const { data: conversions = [] } = useChickenPartConversions();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCount = conversions.filter((c) => c.isActive).length;
  const partCount = conversions.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Chicken parts</CardTitle>
            <CardDescription>
              {conversions.length} conversion{conversions.length === 1 ? "" : "s"} ·{" "}
              {activeCount} active · {partCount} part{partCount === 1 ? "" : "s"} configured
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add conversion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New conversion</DialogTitle>
              </DialogHeader>
              <ConversionForm onDone={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ConversionOverview />
          </TabsContent>

          <TabsContent value="conversions">
            <ConversionList />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
