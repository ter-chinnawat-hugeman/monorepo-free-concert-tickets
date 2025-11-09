#!/bin/sh
set -e

echo "🚀 Starting API container..."

cd /app

echo "📦 Ensuring dependencies are installed..."
npm install --prefer-offline --no-audit

cd /app/apps/api

echo "⏳ Waiting for database to be ready..."
if command -v psql > /dev/null 2>&1; then
  until PGPASSWORD="${POSTGRES_PASSWORD:-consert_password}" psql -h postgres -U "${POSTGRES_USER:-consert_user}" -d "${POSTGRES_DB:-consert_db}" -c "SELECT 1" > /dev/null 2>&1; do
    echo "   Database not ready, waiting..."
    sleep 2
  done
  echo "✅ Database is ready"
else
  echo "⚠️  psql not available, skipping database check"
  sleep 5
fi

echo "📦 Generating Prisma Client..."
npx prisma generate || {
  echo "⚠️  Prisma generate failed, but continuing..."
}

echo "🔄 Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed, but continuing..."
}


echo "🌱 Seeding database..."
npm run prisma:seed || {
  echo "⚠️  Seeding failed or already seeded, continuing..."
}

echo "✅ Prisma setup complete, starting server..."
cd /app


exec npm run dev --workspace=apps/api

