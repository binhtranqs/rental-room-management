#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ] && [ -z "${SPRING_DATASOURCE_URL:-}" ]; then
  database_url="${DATABASE_URL#postgresql://}"
  database_url="${database_url#postgres://}"
  credentials="${database_url%@*}"
  host_and_database="${database_url#*@}"
  database_name_with_query="${host_and_database#*/}"
  database_name="${database_name_with_query%%\?*}"
  host_and_port="${host_and_database%%/*}"
  database_user="${credentials%%:*}"
  database_password="${credentials#*:}"

  export SPRING_DATASOURCE_URL="jdbc:postgresql://${host_and_port}/${database_name}"
  export SPRING_DATASOURCE_USERNAME="${SPRING_DATASOURCE_USERNAME:-$database_user}"
  export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-$database_password}"
fi

exec java -jar ./app.jar
