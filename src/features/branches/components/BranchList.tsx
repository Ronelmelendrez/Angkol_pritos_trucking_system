import { Edit, Trash2, Package, MapPin, Phone, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import type { Branch } from "../types";

interface Props {
  branches: Branch[];
  isLoading?: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
}

export function BranchList({ branches, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3 text-ink-soft">
            <Package className="h-8 w-8 animate-flame text-primary" />
            <p className="text-sm">Loading branches...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-soft border-b">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Address</th>
                <th className="pb-2 font-medium">Phone</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-soft">
                    No branches yet. Click "Add branch" to create one.
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} className="border-b last:border-0 hover:bg-accent-subtle">
                    <td className="py-3 font-medium">{branch.name}</td>
                    <td className="py-3 text-ink-soft">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-ink-soft" />
                        {branch.address || "—"}
                      </div>
                    </td>
                    <td className="py-3 text-ink-soft">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-ink-soft" />
                        {branch.phone || "—"}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={branch.isActive ? "success" : "neutral"}>
                        {branch.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" /> Inactive
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(branch)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(branch)}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}