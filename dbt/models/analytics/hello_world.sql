-- hello_world: simplest possible model to verify dbt ↔ postgres connectivity.
-- Renders as a view in the analytics schema.

select
    'hello from dbt' as message,
    current_timestamp  as run_at,
    current_database() as database_name,
    current_schema()   as schema_name
