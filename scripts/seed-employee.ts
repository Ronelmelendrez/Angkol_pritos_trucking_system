/**
 * Seed the employee user via Supabase Admin API.
 *
 * Usage (run once locally, never commit credentials):
 *   npx tsx scripts/seed-employee.ts
 *
 * Requires VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * SEED_EMPLOYEE_EMAIL, and SEED_EMPLOYEE_PASSWORD in .env.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const employeeEmail = process.env.SEED_EMPLOYEE_EMAIL;
const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !employeeEmail || !employeePassword) {
  console.error(
    "Missing env vars. Ensure VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, " +
    "SEED_EMPLOYEE_EMAIL, and SEED_EMPLOYEE_PASSWORD are set in .env"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log(`Creating employee user: ${employeeEmail}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: employeeEmail,
    password: employeePassword,
    email_confirm: true,
    user_metadata: { name: "Employee", role: "staff" },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already")) {
      console.log("User already exists. Updating profile...");

      const { data: existing } = await supabase.auth.admin.listUsers();
      const user = existing?.users?.find((u) => u.email === employeeEmail);

      if (user) {
        await supabase
          .from("profiles")
          .upsert(
            { id: user.id, name: "Employee", email: employeeEmail, role: "staff" },
            { onConflict: "id" }
          );
        console.log("Profile updated to staff.");
      }
      return;
    }
    console.error("Failed to create user:", error.message);
    process.exit(1);
  }

  console.log(`User created: ${data.user.id}`);

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: data.user.id, name: "Employee", email: employeeEmail, role: "staff" },
      { onConflict: "id" }
    );

  if (profileError) {
    console.error("Profile upsert failed:", profileError.message);
  } else {
    console.log("Profile created with staff role.");
  }

  console.log("Employee seeded successfully.");
}

main();
