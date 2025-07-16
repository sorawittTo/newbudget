#!/bin/bash
# Update environment to use Supabase
echo "🔄 Updating environment variables..."

# Update .env file with Supabase URL
cat > .env << EOF
DATABASE_URL=postgresql://postgres.pytyjeugghucgeexhatr:0927895299Sorawitt@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
EOF

echo "✅ Environment updated to use Supabase"
echo "🔄 Restarting application..."