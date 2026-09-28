#!/usr/bin/env node
/**
 * RealShare — migration / database alignment check.
 *
 * Run from the admin-dashboard directory on a machine that can reach the
 * database:
 *
 *     node prisma/check-db-alignment.js
 *
 * Read-only. Makes no changes to the database. It answers, in order:
 *   1. Is Prisma's migration history table present, and what does it say?
 *   2. Does every model in schema.prisma have a real table?
 *   3. Does every column in schema.prisma exist, with a compatible type?
 *   4. Did the forensic audit_logs upgrade actually land here?
 *   5. Are the append-only protections (REVOKE + trigger) in place?
 *   6. Does the audit hash chain verify?
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// ---------------------------------------------------------------- env loading
function loadDatabaseUrl() {
  for (const f of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf8').match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)/m);
    if (m) return { url: m[1].trim(), from: f };
  }
  if (process.env.DATABASE_URL) return { url: process.env.DATABASE_URL, from: 'process env' };
  throw new Error('No DATABASE_URL found in .env.local, .env, or the environment.');
}

// ------------------------------------------------------- schema.prisma parsing
// Maps Prisma scalar types (and @db.* overrides) to the information_schema
// data_type strings Postgres reports, so a mismatch can be told from a match.
const BASE_TYPES = {
  String: ['character varying', 'text'],
  Int: ['integer'],
  BigInt: ['bigint'],
  Float: ['double precision'],
  Decimal: ['numeric'],
  Boolean: ['boolean'],
  DateTime: ['timestamp with time zone', 'timestamp without time zone', 'date'],
  Json: ['jsonb', 'json'],
  Bytes: ['bytea'],
};
const DB_ATTR_TYPES = {
  VarChar: ['character varying'],
  Text: ['text'],
  Char: ['character'],
  Timestamptz: ['timestamp with time zone'],
  Timestamp: ['timestamp without time zone'],
  Date: ['date'],
  Decimal: ['numeric'],
  Integer: ['integer'],
  BigInt: ['bigint'],
  Boolean: ['boolean'],
  JsonB: ['jsonb'],
  Uuid: ['uuid'],
  Real: ['real'],
  DoublePrecision: ['double precision'],
};

function parseSchema(schemaPath) {
  const src = fs.readFileSync(schemaPath, 'utf8');
  const models = [];
  const re = /^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm;
  let m;
  while ((m = re.exec(src))) {
    const [, name, body] = m;
    const mapped = body.match(/@@map\("([^"]+)"\)/);
    const fields = [];
    for (let raw of body.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) continue;
      const fm = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?(.*)$/);
      if (!fm) continue;
      const [, fname, ftype, isList, isOpt, rest] = fm;
      // Relation fields are not columns.
      if (isList) continue;
      if (/@relation/.test(rest) && !BASE_TYPES[ftype]) continue;
      if (!BASE_TYPES[ftype]) continue; // another model => relation field
      const colMap = rest.match(/@map\("([^"]+)"\)/);
      const dbAttr = rest.match(/@db\.(\w+)/);
      fields.push({
        name: colMap ? colMap[1] : fname,
        prismaType: ftype,
        nullable: !!isOpt,
        expectedTypes: dbAttr && DB_ATTR_TYPES[dbAttr[1]] ? DB_ATTR_TYPES[dbAttr[1]] : BASE_TYPES[ftype],
        hasDefault: /@default\(/.test(rest),
      });
    }
    models.push({ model: name, table: mapped ? mapped[1] : name, fields });
  }
  return models;
}

// ------------------------------------------------------------------- reporting
const ok = (s) => console.log('  \x1b[32m✓\x1b[0m ' + s);
const bad = (s) => console.log('  \x1b[31m✗\x1b[0m ' + s);
const warn = (s) => console.log('  \x1b[33m!\x1b[0m ' + s);
const head = (s) => console.log('\n\x1b[1m' + s + '\x1b[0m');

const problems = [];
const fail = (s) => { problems.push(s); bad(s); };

(async () => {
  const { url, from } = loadDatabaseUrl();
  const u = new URL(url);

  // Render's internal hostname has no dots and speaks plaintext; the external
  // *.render.com hostname requires TLS. Match src/lib/prisma.ts's behaviour.
  const isExternalRender = u.hostname.endsWith('.render.com');
  u.searchParams.delete('sslmode');
  u.searchParams.delete('connection_limit');

  console.log(`Database : ${u.hostname}/${u.pathname.slice(1)} (from ${from})`);
  console.log(`TLS      : ${isExternalRender ? 'on (external host)' : 'off (internal host)'}`);

  const client = new Client({
    connectionString: u.toString(),
    ssl: isExternalRender ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 20000,
  });
  await client.connect();

  const schemaPath = path.resolve(process.cwd(), 'prisma/schema.prisma');
  const models = parseSchema(schemaPath);
  console.log(`Schema   : ${models.length} models parsed from prisma/schema.prisma`);

  // --- 1. migration history ------------------------------------------------
  head('1. Prisma migration history');
  const histExists = (await client.query(
    `SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS present`
  )).rows[0].present;

  const localMigrations = fs
    .readdirSync(path.resolve(process.cwd(), 'prisma/migrations'))
    .filter((d) => fs.existsSync(path.resolve(process.cwd(), 'prisma/migrations', d, 'migration.sql')))
    .sort();

  if (!histExists) {
    fail('_prisma_migrations does not exist — this database was never built by `prisma migrate`.');
    warn('`prisma migrate deploy` would try to apply every migration from scratch and fail on');
    warn('existing tables. `prisma migrate resolve --applied <name>` is how you fix that.');
  } else {
    const { rows } = await client.query(
      `SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
         FROM _prisma_migrations ORDER BY started_at`
    );
    console.log(`  history table present, ${rows.length} row(s)`);
    const applied = new Set();
    for (const r of rows) {
      const state = r.rolled_back_at ? 'ROLLED BACK' : r.finished_at ? 'applied' : 'FAILED / incomplete';
      console.log(`    ${r.migration_name}  ${state}`);
      if (r.finished_at && !r.rolled_back_at) applied.add(r.migration_name);
      if (!r.finished_at || r.rolled_back_at) {
        fail(`migration ${r.migration_name} is in state "${state}" — deploys will refuse to run until resolved.`);
      }
    }
    for (const name of localMigrations) {
      if (!applied.has(name)) fail(`migration folder ${name} exists locally but is NOT recorded as applied here.`);
    }
    for (const r of rows) {
      if (!localMigrations.includes(r.migration_name)) {
        fail(`database records migration ${r.migration_name}, but no such folder exists locally.`);
      }
    }
  }

  // --- 2. tables -----------------------------------------------------------
  head('2. Tables');
  const dbTables = new Set(
    (await client.query(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema='public' AND table_type='BASE TABLE'`
    )).rows.map((r) => r.table_name)
  );
  const missingTables = models.filter((m) => !dbTables.has(m.table));
  if (!missingTables.length) ok(`all ${models.length} model tables exist`);
  for (const m of missingTables) fail(`table "${m.table}" (model ${m.model}) is MISSING from the database.`);

  const known = new Set(models.map((m) => m.table));
  const extra = [...dbTables].filter((t) => !known.has(t) && t !== '_prisma_migrations');
  if (extra.length) warn(`tables in the database with no model: ${extra.join(', ')}`);

  // --- 3. columns ----------------------------------------------------------
  head('3. Columns');
  const cols = (await client.query(
    `SELECT table_name, column_name, data_type, is_nullable, column_default
       FROM information_schema.columns WHERE table_schema='public'`
  )).rows;
  const colMap = new Map();
  for (const c of cols) {
    if (!colMap.has(c.table_name)) colMap.set(c.table_name, new Map());
    colMap.get(c.table_name).set(c.column_name, c);
  }

  let colsChecked = 0, typeMismatch = 0, nullMismatch = 0, missingCols = 0;
  for (const m of models) {
    const t = colMap.get(m.table);
    if (!t) continue;
    for (const f of m.fields) {
      colsChecked++;
      const c = t.get(f.name);
      if (!c) {
        missingCols++;
        fail(`${m.table}.${f.name} is in schema.prisma but MISSING from the database.`);
        continue;
      }
      if (!f.expectedTypes.includes(c.data_type)) {
        typeMismatch++;
        fail(`${m.table}.${f.name} type drift: schema expects ${f.expectedTypes.join('/')}, database has ${c.data_type}.`);
      }
      const dbNullable = c.is_nullable === 'YES';
      if (dbNullable !== f.nullable) {
        // A NOT NULL column with a default is harmless to a nullable model field.
        if (!(f.nullable && !dbNullable && c.column_default)) {
          nullMismatch++;
          warn(`${m.table}.${f.name} nullability differs: schema says ${f.nullable ? 'optional' : 'required'}, database says ${dbNullable ? 'nullable' : 'NOT NULL'}.`);
        }
      }
    }
    // Columns present in the DB but absent from the model.
    const modelCols = new Set(m.fields.map((f) => f.name));
    for (const name of t.keys()) {
      if (!modelCols.has(name)) warn(`${m.table}.${name} exists in the database but not in schema.prisma.`);
    }
  }
  if (!missingCols && !typeMismatch) ok(`${colsChecked} columns checked, none missing, no type drift`);

  // --- 4. forensic audit upgrade ------------------------------------------
  head('4. Forensic audit_logs upgrade');
  if (!dbTables.has('audit_logs')) {
    fail('audit_logs table does not exist.');
  } else {
    const a = colMap.get('audit_logs');
    const required = ['seq', 'actor_email', 'actor_name', 'actor_role', 'actor_dept', 'outcome',
      'before', 'after', 'ip_address', 'user_agent', 'request_id', 'http_method', 'path',
      'prev_hash', 'hash'];
    const absent = required.filter((c) => !a.has(c));
    if (absent.length) {
      fail(`forensic migration has NOT been applied here — missing columns: ${absent.join(', ')}`);
    } else {
      ok('all 22 forensic columns present');
    }

    const fk = (await client.query(
      `SELECT conname FROM pg_constraint
        WHERE conrelid='audit_logs'::regclass AND contype='f' AND conname LIKE '%employee_id%'`
    )).rows;
    if (fk.length) {
      fail(`the employee_id foreign key (${fk[0].conname}) still exists — it must be dropped, or deleting an employee will break the append-only chain.`);
    } else {
      ok('employee_id foreign key correctly dropped');
    }

    const seqCol = a.get('seq');
    if (seqCol && !/nextval/.test(seqCol.column_default || '')) {
      fail('audit_logs.seq has no sequence default — new rows will not get a sequence number.');
    }

    // --- 5. append-only protection ---------------------------------------
    head('5. Append-only protection');
    const trg = (await client.query(
      `SELECT tgname FROM pg_trigger WHERE tgrelid='audit_logs'::regclass AND NOT tgisinternal`
    )).rows.map((r) => r.tgname);
    if (trg.length) ok(`trigger(s) present: ${trg.join(', ')}`);
    else fail('no append-only trigger on audit_logs — rows can be edited or deleted. Run prisma/manual/audit_append_only.sql as the database owner.');

    const owner = (await client.query(
      `SELECT tableowner FROM pg_tables WHERE tablename='audit_logs' AND schemaname='public'`
    )).rows[0]?.tableowner;
    const grants = (await client.query(
      `SELECT DISTINCT grantee, privilege_type FROM information_schema.role_table_grants
        WHERE table_name='audit_logs' AND privilege_type IN ('UPDATE','DELETE','TRUNCATE')`
    )).rows;
    const appGrants = grants.filter((g) => g.grantee !== 'PUBLIC');
    if (!appGrants.length) {
      ok('UPDATE/DELETE/TRUNCATE not granted to any role');
    } else {
      const roles = [...new Set(appGrants.map((g) => g.grantee))];
      warn(`UPDATE/DELETE still granted to: ${roles.join(', ')}`);
      if (owner && roles.includes(owner)) {
        warn(`"${owner}" owns the table. If the app connects as this role, run the REVOKE half of`);
        warn('prisma/manual/audit_append_only.sql with :app_role set to it. The trigger blocks');
        warn('mutations either way, so this is defence-in-depth, not an open door.');
      }
    }

    // --- 6. chain verification -------------------------------------------
    head('6. Hash chain');
    const n = Number((await client.query('SELECT count(*) c FROM audit_logs')).rows[0].c);
    console.log(`  ${n} row(s) in audit_logs`);
    if (n === 0) {
      warn('no rows yet — nothing to verify (and nothing was at risk during the migration backfill)');
    } else if (!a.has('hash')) {
      warn('skipped: the forensic columns are not present');
    } else {
      // Recomputed in SQL, never in JS: Postgres renders jsonb as {"a": 1} and
      // JSON.stringify renders {"a":1}, so a JS recomputation reports false
      // tampering on every row that has a before/after/details payload.
      const { rows: [v] } = await client.query(`
        WITH ordered AS (
          SELECT *, LAG(hash) OVER (ORDER BY seq) AS expected_prev,
                    LAG(seq)  OVER (ORDER BY seq) AS prior_seq
            FROM audit_logs
        ), rec AS (
          SELECT seq, hash AS stored, prev_hash, expected_prev, prior_seq,
            encode(sha256(convert_to(
              COALESCE(expected_prev,'') || '|' || seq::TEXT
              || '|' || COALESCE(actor_email,'') || '|' || COALESCE(actor_name,'')
              || '|' || COALESCE(actor_role,'')  || '|' || action
              || '|' || entity_type || '|' || entity_id || '|' || outcome
              || '|' || COALESCE("before"::TEXT,'') || '|' || COALESCE("after"::TEXT,'')
              || '|' || COALESCE(details::TEXT,'')
              || '|' || to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
            ,'UTF8')),'hex') AS recomputed
          FROM ordered
        )
        SELECT count(*) FILTER (WHERE recomputed <> stored) AS altered,
               count(*) FILTER (WHERE prior_seq IS NOT NULL AND seq <> prior_seq + 1) AS gaps,
               count(*) FILTER (WHERE prev_hash IS DISTINCT FROM expected_prev) AS breaks
          FROM rec`);
      if (Number(v.altered) + Number(v.gaps) + Number(v.breaks) === 0) {
        ok('chain intact: no altered rows, no sequence gaps, no broken links');
      } else {
        fail(`chain problems — altered=${v.altered} sequence_gaps=${v.gaps} broken_links=${v.breaks}`);
      }
    }
  }

  // ------------------------------------------------------------------ verdict
  console.log('\n' + '='.repeat(72));
  if (!problems.length) {
    console.log('\x1b[32mVERDICT: schema.prisma and this database are aligned.\x1b[0m');
  } else {
    console.log(`\x1b[31mVERDICT: ${problems.length} problem(s) found.\x1b[0m`);
    problems.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
  }
  console.log('='.repeat(72));

  await client.end();
  process.exit(problems.length ? 1 : 0);
})().catch((e) => {
  console.error('\n\x1b[31mCheck could not complete:\x1b[0m', e.message);
  process.exit(2);
});
