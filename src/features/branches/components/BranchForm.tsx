import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, RotateCcw, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/AlertDialog";
import { useAddBranchWithStaff, useUpdateBranch, useBranchStaffEmail, useResetBranchPassword, useCheckEmailExists } from "../hooks/useBranches";
import { useToast } from "@/components/ui/useToast";
import type { Branch } from "../types";

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  // Branch login credentials (for employee dashboard access)
  branchEmail: z.string().min(1, "Login email is required"),
  branchPassword: z.string().optional(),
}).refine((data) => {
  // Only require password for new branches (when not editing)
  // This is handled by the form logic - we only validate on submit
  return true;
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface Props {
  branch?: Branch;
  onDone?: (result?: { credentials?: { email: string; password: string } }) => void;
}

export function BranchForm({ branch, onDone }: Props) {
  const { toast } = useToast();
  const addBranchWithStaff = useAddBranchWithStaff();
  const updateBranch = useUpdateBranch();
  const resetPassword = useResetBranchPassword();
  const { data: staffEmail } = useBranchStaffEmail(branch?.id ?? "");
  const isEditing = !!branch;
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema) as unknown as Resolver<BranchFormValues>,
    defaultValues: {
      name: branch?.name ?? "",
      address: branch?.address ?? "",
      phone: branch?.phone ?? "",
      isActive: branch?.isActive ?? true,
      branchEmail: isEditing ? (staffEmail ?? "") : "",
      branchPassword: "",
    },
  });

  const watchedEmail = watch("branchEmail");
  const { data: emailExists } = useCheckEmailExists(!isEditing ? watchedEmail : "");

  const isPending = addBranchWithStaff.isPending || updateBranch.isPending || resetPassword.isPending;

  async function onSubmit(values: BranchFormValues) {
    try {
      if (isEditing) {
        // Don't send password if not provided (keep existing)
        const patch = values.branchPassword ? values : { ...values, branchPassword: undefined };
        await updateBranch.mutateAsync({ id: branch.id, ...patch });
        toast({ title: "Branch updated", description: values.name, variant: "success" });
        onDone?.();
      } else {
        if (!values.branchPassword) {
          toast({ title: "Password is required for new branch", variant: "error" });
          return;
        }
        const result = await addBranchWithStaff.mutateAsync({
          name: values.name,
          address: values.address ?? "",
          phone: values.phone ?? "",
          isActive: values.isActive,
          branchEmail: values.branchEmail,
          branchPassword: values.branchPassword,
        });
        setCredentials(result.credentials);
        toast({ title: "Branch & login created", description: values.name, variant: "success" });
      }
    } catch (err) {
      console.error("Branch creation error:", err);
      const message = err instanceof Error ? err.message : "Couldn't save branch";
      toast({ title: message, variant: "error" });
    }
  }

  async function handleResetPassword() {
    const email = staffEmail;
    if (!email) {
      toast({ title: "No email found", variant: "error" });
      return;
    }
    try {
      await resetPassword.mutateAsync(email);
      toast({ title: "Reset email sent", description: `Password reset link sent to ${email}`, variant: "success" });
      setResetDialogOpen(false);
    } catch {
      toast({ title: "Failed to send reset email", variant: "error" });
    }
  }

  function handleCredentialsDone() {
    setCredentials(null);
    onDone?.();
  }

  if (credentials && !isEditing) {
    return (
      <div className="space-y-4">
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              Branch Created Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-bg/50 p-4 space-y-3">
              <p className="text-sm font-medium text-ink">Branch login credentials (for employee dashboard):</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-ink-soft">Email</Label>
                  <Input value={credentials.email} readOnly />
                </div>
                <div>
                  <Label className="text-xs text-ink-soft">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-[38px]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-warning">
                <strong>Important:</strong> Share these credentials with the branch staff to access the employee dashboard. 
                The password cannot be retrieved again.
              </p>
            </div>
            <Button className="w-full" onClick={handleCredentialsDone}>
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Branch name</Label>
        <Input id="name" placeholder="e.g. Main Branch" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="123 Main St, City" {...register("address")} />
      </div>
      <div>
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" placeholder="0917 234 5678" {...register("phone")} />
      </div>
      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox checked={field.value} onCheckedChange={(v: boolean) => field.onChange(v)} />
            <span className="text-sm text-ink">Active branch</span>
          </label>
        )}
      />

      {!isEditing && (
        <div className="pt-4 border-t border-line">
          <h4 className="mb-3 font-medium text-ink">Branch Login (for employee dashboard)</h4>
          <div>
            <Label htmlFor="branchEmail">Login email</Label>
            <Input id="branchEmail" type="email" placeholder="branch@company.com" {...register("branchEmail")} />
            {errors.branchEmail && <p className="mt-1 text-xs text-danger">{errors.branchEmail.message}</p>}
            {!isEditing && emailExists && watchedEmail && (
              <p className="mt-1 text-xs text-warning flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                This email already has an account. Using it may cause rate limit issues.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="branchPassword">Login password</Label>
            <div className="relative">
              <Input
                id="branchPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                {...register("branchPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-[38px]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.branchPassword && <p className="mt-1 text-xs text-danger">{errors.branchPassword.message}</p>}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="pt-4 border-t border-line">
          <h4 className="mb-3 font-medium text-ink">Branch Login</h4>
          <div>
            <Label htmlFor="branchEmail">Login email</Label>
            <div className="relative">
              <Input
                id="branchEmail"
                type="email"
                value={staffEmail ?? ""}
                readOnly
                className="bg-ink/3"
              />
              {staffEmail && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-[38px]"
                  onClick={() => setResetDialogOpen(true)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {staffEmail && (
              <p className="mt-1 text-xs text-ink-soft">
                Password is hidden for security. Click the refresh icon to send a reset link.
              </p>
            )}
            {!staffEmail && (
              <p className="mt-1 text-xs text-warning flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                No staff account linked to this branch yet.
              </p>
            )}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Saving..." : isEditing ? "Save changes" : "Create branch & login"}
      </Button>
    </form>
  );
}

function ResetPasswordDialog({ open, onOpenChange, email, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; email: string; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset password</AlertDialogTitle>
          <AlertDialogDescription>
            Send a password reset link to <span className="font-medium">{email}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Send reset link</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}