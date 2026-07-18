/**
 * Seed the initial admin user via Supabase Admin API.
 *
 * Usage (run once locally, never commit credentials):
 *   npx tsx scripts/seed-admin.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or shell env.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars. Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
  );
  process.exit(1);
}

const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@angkolpritos.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD || "angkolpritos123";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log(`Creating admin user: ${adminEmail}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { name: "Admin", role: "manager" },
  });

  if (error) {
    if (error.message.includes("already exists")) {
      console.log("User already exists. Updating role to manager...");

      const { data: existing } = await supabase.auth.admin.listUsers();
      const user = existing?.users?.find((u) => u.email === adminEmail);

      if (user) {
        await supabase
          .from("profiles")
          .update({ role: "manager", name: "Admin" })
          .eq("id", user.id);
        console.log("Profile updated to manager.");
      }
      return;
    }
    console.error("Failed to create user:", error.message);
    process.exit(1);
  }

  console.log(`User created: ${data.user.id}`);
  console.log("Admin seeded successfully.");
}

main();
