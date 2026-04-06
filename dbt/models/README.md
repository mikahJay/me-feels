# dbt Models

This directory contains dbt models for me-feels analytics.

## Structure

```
models/
├── staging/     # Raw source data from PostgreSQL via batch jobs
└── marts/       # Business-logic aggregations and metrics
```

## Usage

1. Copy `profiles.yml.example` to `~/.dbt/profiles.yml` and configure Snowflake credentials.
2. Run `dbt deps` to install packages.
3. Run `dbt run` to materialize models.
4. Run `dbt test` to validate models.
