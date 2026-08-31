import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:54322/postgres";

// Disable prefetch as it is not supported for "Transaction" pool mode if using Supabase pooling
export const client = postgres(connectionString, {
  prepare: false,
});

export const db = drizzle(client, { schema });
