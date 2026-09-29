import { Controller, useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  chickenPartConversionSchema,
  type ChickenPartConversionFormValues,
} from "@/utils/Validators";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/useToast";
import {
  isDuplicateError,
  useAddChickenPartConversion,
  useUpdateChickenPartConversion,
} from "../hooks/useChickenPartConversions";
import { formatCurrency } from "@/utils/currency";
import type { ChickenPartConversion } from "../types";

interface Props {
  initial?: ChickenPartConversion;
  onDone?: () => void;
}

const EMPTY_ITEM = { partName: "", quantityPerBase: 0, pricePerPiece: 0 };

export function ConversionForm({ initial, onDone }: Props) {
  const { toast } = useToast();
  const addConversion = useAddChickenPartConversion();
  const updateConversion = useUpdateChickenPartConversion();
  const isEditing = !!initial;
  const isPending = addConversion.isPending || updateConversion.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ChickenPartConversionFormValues>({
    resolver: zodResolver(chickenPartConversionSchema) as unknown as Resolver<
      ChickenPartConversionFormValues
    >,
    defaultValues: initial
      ? {
          name: initial.name,
          baseWeightKg: initial.baseWeightKg,
          isActive: initial.isActive,
          items: initial.items.map((i) => ({
            partName: i.partName,
            quantityPerBase: i.quantityPerBase,
            pricePerPiece: i.pricePerPiece,
          })),
        }
      : {
          name: "",
          baseWeightKg: 1,
          isActive: true,
          items: [{ ...EMPTY_ITEM }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = useWatch({ control, name: "items" }) ?? [];
  const perUnitValue = items.reduce(
    (sum, i) => sum + (Number(i.quantityPerBase) || 0) * (Number(i.pricePerPiece) || 0),
    0,
  );

  function addPart() {
    append({ ...EMPTY_ITEM });
  }

  async function onSubmit(values: ChickenPartConversionFormValues) {
    const items = values.items.map((i) => ({
      partName: i.partName.trim(),
      quantityPerBase: i.quantityPerBase,
      pricePerPiece: i.pricePerPiece,
    }));

    try {
      if (isEditing && initial) {
        await updateConversion.mutateAsync({
          id: initial.id,
          name: values.name.trim(),
          baseWeightKg: values.baseWeightKg,
          isActive: values.isActive,
          items,
        });
        toast({ title: "Conversion updated", description: values.name, variant: "success" });
      } else {
        await addConversion.mutateAsync({
          name: values.name.trim(),
          baseWeightKg: values.baseWeightKg,
          isActive: values.isActive,
          items,
        });
        toast({ title: "Conversion added", description: values.name, variant: "success" });
      }
      reset();
      onDone?.();
    } catch (err) {
      if (isDuplicateError(err)) {
        toast({
          title: "Duplicate conversion",
          description: "An active conversion with this name already exists.",
          variant: "error",
        });
        return;
      }
      toast({
        title: `Couldn't ${isEditing ? "update" : "add"} conversion`,
        variant: "error",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="conversion-name">Conversion name</Label>
        <Input
          id="conversion-name"
          placeholder="e.g. Standard Chicken"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="conversion-weight">Base weight (kg)</Label>
          <Input
            id="conversion-weight"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            placeholder="0.65"
            {...register("baseWeightKg")}
          />
          {errors.baseWeightKg && (
            <p className="mt-1 text-xs text-danger">{errors.baseWeightKg.message}</p>
          )}
        </div>
        <div className="flex items-end pb-1">
          <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
            <Label htmlFor="conversion-active" className="text-sm font-medium">
              Active
            </Label>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  id="conversion-active"
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              )}
            />
          </div>
        </div>
      </div>
      <p className="-mt-2 text-xs text-ink-faint">
        Base weight is for one whole chicken, not per kilogram. A 0.65 kg small
        chicken can use the same part counts as a 1 kg one.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Parts
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addPart} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add part
          </Button>
        </div>

        <div className="hidden grid-cols-[1fr_5rem_6rem] gap-2 px-1 sm:grid">
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            Part
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            Qty
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
            Price
          </span>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 sm:grid sm:grid-cols-[1fr_5rem_6rem_auto] sm:items-end sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0"
          >
            <div className="min-w-0">
              <Label className="text-xs sm:hidden">Part</Label>
              <Input
                placeholder="e.g. Wings"
                {...register(`items.${index}.partName`)}
              />
              {errors.items?.[index]?.partName && (
                <p className="mt-1 text-xs text-danger">
                  {errors.items[index]?.partName?.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs sm:hidden">Qty per base</Label>
              <Input
                type="number"
                step="0.001"
                min="0"
                inputMode="decimal"
                placeholder="0"
                {...register(`items.${index}.quantityPerBase`)}
              />
              {errors.items?.[index]?.quantityPerBase && (
                <p className="mt-1 text-xs text-danger">
                  {errors.items[index]?.quantityPerBase?.message}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs sm:hidden">Price / piece</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="0"
                {...register(`items.${index}.pricePerPiece`)}
              />
              {errors.items?.[index]?.pricePerPiece && (
                <p className="mt-1 text-xs text-danger">
                  {errors.items[index]?.pricePerPiece?.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 self-end text-ink-faint hover:text-danger"
              onClick={() => remove(index)}
              aria-label={`Remove part ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {typeof errors.items?.message === "string" && (
          <p className="text-xs text-danger">{errors.items.message}</p>
        )}

        {items.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-line px-3 py-2 text-xs">
            <span className="text-ink-soft">Value per base unit</span>
            <span className="font-semibold text-ink">{formatCurrency(perUnitValue)}</span>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEditing ? "Update conversion" : "Save conversion"}
      </Button>
    </form>
  );
}
