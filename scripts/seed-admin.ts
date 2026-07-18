/**
 * Seed the initial admin user via Supabase Admin API.
 *
 * Usage (run once locally, never commit credentials):
 *   npx tsx scripts/seed-admin.ts
 *
 * Requires VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD in .env.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.SEED_ADMIN_EMAIL;
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !adminEmail || !adminPassword) {
  console.error(
    "Missing env vars. Ensure VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, " +
    "SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD are set in .env"
  );
  process.exit(1);
}

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
    const msg = error.message.toLowerCase();
    if (msg.includes("already")) {
      console.log("User already exists. Updating profile...");

      const { data: existing } = await supabase.auth.admin.listUsers();
      const user = existing?.users?.find((u) => u.email === adminEmail);

      if (user) {
        await supabase
          .from("profiles")
          .upsert(
            { id: user.id, name: "Admin", email: adminEmail, role: "manager" },
            { onConflict: "id" }
          );
        console.log("Profile updated to manager.");
      }
      return;
    }
    console.error("Failed to create user:", error.message);
    process.exit(1);
  }

  console.log(`User created: ${data.user.id}`);

  // Ensure profile exists with manager role (upsert in case trigger didn't fire)
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: data.user.id, name: "Admin", email: adminEmail, role: "manager" },
      { onConflict: "id" }
    );

  if (profileError) {
    console.error("Profile upsert failed:", profileError.message);
  } else {
    console.log("Profile created with manager role.");
  }

  console.log("Admin seeded successfully.");
}

main();
