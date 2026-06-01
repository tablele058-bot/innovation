import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

let _db: any;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set — using fallback dummy db for development.");

  class DummyQuery {
    async from() { return []; }
    async where() { return []; }
    async orderBy() { return []; }
    async returning() { return []; }
    async values() { return []; }
    async set() { return; }
  }

  class DummyDB {
    select(): DummyQuery { return new DummyQuery(); }
    insert(): DummyQuery { return new DummyQuery(); }
    update(): DummyQuery { return new DummyQuery(); }
    delete(): DummyQuery { return new DummyQuery(); }
  }

  _db = new DummyDB() as any;
} else {
  const url = new URL(process.env.DATABASE_URL);
  const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    ssl: { rejectUnauthorized: false },
  });
  _db = drizzle(pool, { schema });
}

export const db = _db;
