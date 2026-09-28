-- Enumerates the database objects that Prisma's schema language cannot express,
-- and that `prisma migrate diff` is therefore blind to. These are exactly the
-- things a baseline migration generated from schema.prisma would NOT recreate,
-- so anything listed here has to be reapplied by hand on a rebuilt database.
--
-- Read-only. Run with:  psql "$DATABASE_URL" -f list-non-prisma-objects.sql

\echo '================ 1. TRIGGERS ================'
SELECT c.relname AS table_name,
       t.tgname  AS trigger_name,
       pg_get_triggerdef(t.oid) AS definition
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE NOT t.tgisinternal AND n.nspname = 'public'
 ORDER BY 1, 2;

\echo '================ 2. FUNCTIONS / PROCEDURES ================'
SELECT p.proname AS name,
       pg_get_function_identity_arguments(p.oid) AS args,
       l.lanname AS language
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l ON l.oid = p.prolang
 WHERE n.nspname = 'public'
 ORDER BY 1;

\echo '================ 3. CHECK CONSTRAINTS ================'
SELECT c.relname AS table_name,
       con.conname AS constraint_name,
       pg_get_constraintdef(con.oid) AS definition
  FROM pg_constraint con
  JOIN pg_class c ON c.oid = con.conrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE con.contype = 'c' AND n.nspname = 'public'
   -- NOT NULL is reported as a check constraint in some tools; exclude the
   -- ones Postgres generates for itself.
   AND con.conname NOT LIKE '%_not_null'
 ORDER BY 1, 2;

\echo '================ 4. PARTIAL / EXPRESSION INDEXES ================'
\echo '(Prisma can express a plain column index; a WHERE clause or an expression it cannot.)'
SELECT tablename, indexname, indexdef
  FROM pg_indexes
 WHERE schemaname = 'public'
   AND (indexdef ILIKE '% WHERE %' OR indexdef ~ '\((?:[^)]*\()')
 ORDER BY 1, 2;

\echo '================ 5. NON-BTREE INDEXES (GIN / GIST / BRIN / HASH) ================'
SELECT tablename, indexname, indexdef
  FROM pg_indexes
 WHERE schemaname = 'public' AND indexdef !~* 'USING btree'
 ORDER BY 1, 2;

\echo '================ 6. VIEWS AND MATERIALIZED VIEWS ================'
SELECT table_name AS name, 'view' AS kind
  FROM information_schema.views WHERE table_schema = 'public'
UNION ALL
SELECT matviewname, 'materialized view' FROM pg_matviews WHERE schemaname = 'public'
 ORDER BY 2, 1;

\echo '================ 7. TABLE PRIVILEGES (the REVOKE/GRANT state) ================'
\echo '(A table absent here has had its privileges revoked; that is not in schema.prisma.)'
SELECT table_name, grantee, string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
  FROM information_schema.role_table_grants
 WHERE table_schema = 'public'
 GROUP BY 1, 2
 ORDER BY 1, 2;

\echo '================ 8. ROW LEVEL SECURITY ================'
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled, p.polname AS policy
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy p ON p.polrelid = c.oid
 WHERE n.nspname = 'public' AND c.relkind = 'r' AND (c.relrowsecurity OR p.polname IS NOT NULL)
 ORDER BY 1;

\echo '================ 9. INSTALLED EXTENSIONS ================'
SELECT extname, extversion FROM pg_extension ORDER BY 1;

\echo '================ 10. SEQUENCES AND THEIR CURRENT POSITION ================'
\echo '(Structure is recreated by a baseline; the CURRENT VALUE is data and is not.)'
SELECT sequencename, last_value, start_value, increment_by
  FROM pg_sequences WHERE schemaname = 'public'
 ORDER BY 1;

\echo '================ 11. COLUMN DEFAULTS WRITTEN AS SQL EXPRESSIONS ================'
\echo '(Anything beyond a literal, now(), or nextval() may not survive a round-trip.)'
SELECT table_name, column_name, column_default
  FROM information_schema.columns
 WHERE table_schema = 'public' AND column_default IS NOT NULL
   AND column_default !~* '^(nextval\(|now\(\)|CURRENT_TIMESTAMP|true|false|''|-?[0-9])'
 ORDER BY 1, 2;

\echo '================ 12. TABLE AND COLUMN COMMENTS ================'
SELECT c.relname AS table_name,
       COALESCE(a.attname, '(table)') AS column_name,
       COALESCE(col_description(c.oid, a.attnum), obj_description(c.oid, 'pg_class')) AS comment
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
 WHERE n.nspname = 'public' AND c.relkind = 'r'
   AND (col_description(c.oid, a.attnum) IS NOT NULL OR obj_description(c.oid, 'pg_class') IS NOT NULL)
 ORDER BY 1, 2;
