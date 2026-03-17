#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE auth_db;
  CREATE DATABASE podcast_db;
  CREATE DATABASE ai_db;
  CREATE DATABASE search_db;
  CREATE DATABASE analytics_db;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "search_db" <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS vector;
EOSQL
