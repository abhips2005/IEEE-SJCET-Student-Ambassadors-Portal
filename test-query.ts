import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking standard user:profiles");
  const { data, error } = await supabase
    .from("task_assignments")
    .select("*, user:profiles(id)")
    .limit(1);

  if (error) {
    console.error("Error with user:profiles:", error.message);
  } else {
    console.log("Success with user:profiles:", data);
  }

  console.log("Checking disambiguated user:profiles!task_assignments_user_id_fkey");
  const { data: d2, error: e2 } = await supabase
    .from("task_assignments")
    .select("*, user:profiles!task_assignments_user_id_fkey(id)")
    .limit(1);

  if (e2) {
    console.error("Error with disambiguated:", e2.message);
  } else {
    console.log("Success with disambiguated:", d2);
  }
}

run();
