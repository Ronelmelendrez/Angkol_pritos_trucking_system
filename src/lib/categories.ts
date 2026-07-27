import { supabase } from "./supabaseClient";

// Module-level cache: safe because categories are seed-data and rarely change.
// If categories are ever edited via Settings, call clearCategoryCache().
const nameToId = new Map<string, string>();
const idToName = new Map<string, string>();

export async function getCategoryIdByName(name: string): Promise<string> {
  const cached = nameToId.get(name);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("name", name)
    .eq("type", "expense")
    .single();

  if (error || !data) throw new Error(`Category not found: ${name}`);
  nameToId.set(name, data.id);
  idToName.set(data.id, name);
  return data.id;
}

export async function getCategoryNameById(id: string): Promise<string> {
  const cached = idToName.get(id);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();

  if (error || !data) throw new Error(`Category not found: ${id}`);
  idToName.set(id, data.name);
  nameToId.set(data.name, id);
  return data.name;
}

export function clearCategoryCache(): void {
  nameToId.clear();
  idToName.clear();
}
