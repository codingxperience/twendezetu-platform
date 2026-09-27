-- Supabase exposes the public schema through its REST and GraphQL APIs to the
-- `anon` and `authenticated` roles. Twendezetu never uses those APIs: the
-- Next.js server talks to Postgres directly as the table owner. So every
-- table gets Row Level Security with no policies (deny by default) and the
-- API roles lose every grant. Safe to run repeatedly; the migrate script runs
-- it after each deploy so new tables are covered automatically.

DO $$
DECLARE
  t record;
  api_role text;
BEGIN
  FOR t IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN ('public', 'legacy')
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', t.schemaname, t.tablename);
  END LOOP;

  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated']
  LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', api_role);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', api_role);
      EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', api_role);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I', api_role);
      IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'legacy') THEN
        EXECUTE format('REVOKE ALL ON SCHEMA legacy FROM %I', api_role);
        EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA legacy FROM %I', api_role);
      END IF;
      IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'app_private') THEN
        EXECUTE format('REVOKE ALL ON SCHEMA app_private FROM %I', api_role);
      END IF;
    END IF;
  END LOOP;
END
$$;
