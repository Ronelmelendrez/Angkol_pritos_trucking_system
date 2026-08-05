import type { BadgeProps } from "@/components/ui/Badge";
import type { AdjustmentReason } from "../types";

export const ADJUSTMENT_REASONS: AdjustmentReason[] = ["spoilage", "waste", "theft", "recount", "other"];

export interface ReasonMeta {
  label: string;
  variant: BadgeProps["variant"];
  color: string;
}

export const REASON_META: Record<AdjustmentReason, ReasonMeta> = {
  spoilage: { label: "Spoilage", variant: "danger", color: "#C0392B" },
  waste: { label: "Waste", variant: "warning", color: "#E67E22" },
  theft: { label: "Theft", variant: "default", color: "#8E44AD" },
  recount: { label: "Recount", variant: "neutral", color: "#3498DB" },
  other: { label: "Other", variant: "neutral", color: "#95A5A6" },
};

/** Reasons that represent product thrown out and therefore real losses. */
export const LOSS_REASONS: readonly AdjustmentReason[] = ["spoilage", "waste"] as const;

export function isLossReason(reason: AdjustmentReason): boolean {
  return LOSS_REASONS.includes(reason);
}
