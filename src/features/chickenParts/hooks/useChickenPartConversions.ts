import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/database.types";
import type {
  ChickenPartConversion,
  ChickenPartItem,
  NewChickenPartConversion,
  UpdateChickenPartConversion,
} from "../types";
import { nextCopyName } from "../utils/nextCopyName";

const CONVERSIONS_KEY = ["chickenPartConversions"] as const;

interface ConversionRow {
  id: string;
  name: string;
  base_weight_kg: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ItemRow {
  id: string;
  conversion_id: string;
  part_name: string;
  quantity_per_base: number;
  price_per_piece: number;
}

function toApp(row: ConversionRow, items: ItemRow[]): ChickenPartConversion {
  return {
    id: row.id,
    name: row.name,
    baseWeightKg: Number(row.base_weight_kg),
    isActive: row.is_active,
    items: items.map((i) => ({
      id: i.id,
      partName: i.part_name,
      quantityPerBase: Number(i.quantity_per_base),
      pricePerPiece: Number(i.price_per_piece),
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Postgres unique-violation on either the active-name index or the
 * (conversion, part) index. Surfaced as a friendlier message by the form.
 */
function isDuplicateError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export function useChickenPartConversions(includeInactive = true) {
  return useQuery({
    queryKey: [...CONVERSIONS_KEY, { includeInactive }],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("chicken_part_conversions")
        .select("*")
        .order("name");
      if (error) throw error;

      const { data: itemRows, error: itemError } = await supabase
        .from("chicken_part_conversion_items")
        .select("*");
      if (itemError) throw itemError;

      const byConversion = new Map<string, ItemRow[]>();
      for (const item of itemRows) {
        const list = byConversion.get(item.conversion_id) ?? [];
        list.push(item);
        byConversion.set(item.conversion_id, list);
      }

      const conversions = (rows as ConversionRow[])
        .map((row) => toApp(row, byConversion.get(row.id) ?? []))
        .filter((c) => (includeInactive ? true : c.isActive));

      return conversions;
    },
  });
}

export function useAddChickenPartConversion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewChickenPartConversion) => {
      const { data, error } = await supabase
        .from("chicken_part_conversions")
        .insert({
          name: input.name,
          base_weight_kg: input.baseWeightKg,
          is_active: input.isActive,
        })
        .select()
        .single();
      if (error) throw error;

      const { error: itemError } = await supabase
        .from("chicken_part_conversion_items")
        .insert(
          input.items.map((item) => ({
            conversion_id: data.id,
            part_name: item.partName,
            quantity_per_base: item.quantityPerBase,
            price_per_piece: item.pricePerPiece,
          })),
        );
      if (itemError) {
        // Don't leave a headless conversion behind if its parts failed.
        await supabase.from("chicken_part_conversions").delete().eq("id", data.id);
        throw itemError;
      }

      return toApp(data as ConversionRow, []);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CONVERSIONS_KEY }),
  });
}

export function useUpdateChickenPartConversion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, items, ...patch }: UpdateChickenPartConversion) => {
      type ConversionPatch = Database["public"]["Tables"]["chicken_part_conversions"]["Update"];
      const row: ConversionPatch = {};
      if (patch.name !== undefined) row.name = patch.name;
      if (patch.baseWeightKg !== undefined) row.base_weight_kg = patch.baseWeightKg;
      if (patch.isActive !== undefined) row.is_active = patch.isActive;

      if (Object.keys(row).length > 0) {
        const { error } = await supabase
          .from("chicken_part_conversions")
          .update(row)
          .eq("id", id);
        if (error) throw error;
      }

      if (items) {
        // Parts are replaced wholesale: the set is small and always edited
        // as a unit, so diffing would add complexity without benefit.
        const { error: deleteError } = await supabase
          .from("chicken_part_conversion_items")
          .delete()
          .eq("conversion_id", id);
        if (deleteError) throw deleteError;

        if (items.length > 0) {
          const { error: insertError } = await supabase
            .from("chicken_part_conversion_items")
            .insert(
              items.map((item: ChickenPartItem) => ({
                conversion_id: id,
                part_name: item.partName,
                quantity_per_base: item.quantityPerBase,
                price_per_piece: item.pricePerPiece,
              })),
            );
          if (insertError) throw insertError;
        }
      }

      return id;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CONVERSIONS_KEY }),
  });
}

export function useToggleChickenPartConversion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("chicken_part_conversions")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CONVERSIONS_KEY }),
  });
}

export function useDuplicateChickenPartConversion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversion: ChickenPartConversion) => {
      const { data, error } = await supabase
        .from("chicken_part_conversions")
        .insert({
          name: nextCopyName(conversion.name),
          base_weight_kg: conversion.baseWeightKg,
          is_active: false,
        })
        .select()
        .single();
      if (error) throw error;

      const { error: itemError } = await supabase
        .from("chicken_part_conversion_items")
        .insert(
          conversion.items.map((item) => ({
            conversion_id: data.id,
            part_name: item.partName,
            quantity_per_base: item.quantityPerBase,
            price_per_piece: item.pricePerPiece,
          })),
        );
      if (itemError) {
        await supabase.from("chicken_part_conversions").delete().eq("id", data.id);
        throw itemError;
      }

      return data.id;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CONVERSIONS_KEY }),
  });
}

export function useDeleteChickenPartConversion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Items cascade via the FK.
      const { error } = await supabase
        .from("chicken_part_conversions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CONVERSIONS_KEY }),
  });
}

export { isDuplicateError };
