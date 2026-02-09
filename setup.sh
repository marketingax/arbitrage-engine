#!/bin/bash
# Setup script for Arbitrage Engine

echo "🚀 Arbitrage Engine Setup"
echo "=========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check for .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo "⚠️  .env.local not found. Creating template..."
    cp .env.local.example .env.local 2>/dev/null || echo "Please configure .env.local manually"
    echo ""
    echo "📝 Edit .env.local with your Supabase credentials:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - MOLTBOOK_API_KEY (optional, for Phase 1 data source)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🗄️  Next steps:"
echo "1. Configure .env.local with your Supabase credentials"
echo "2. Run SQL migration in Supabase dashboard (supabase_schema.sql)"
echo "3. Start dev server: npm run dev"
echo "4. Open http://localhost:3000"
echo ""
