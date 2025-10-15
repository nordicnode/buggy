#!/usr/bin/env bash

# Generate secure admin token for Ultimate Buggy Lapping Tournament

set -euo pipefail

echo ""
echo "🔐 Generating secure admin token..."
echo ""

# Try OpenSSL first (most common)
if command -v openssl >/dev/null 2>&1; then
    TOKEN=$(openssl rand -hex 32)
    echo "✅ Token generated using OpenSSL"
# Fallback to Node.js if available
elif command -v node >/dev/null 2>&1; then
    TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "✅ Token generated using Node.js"
else
    echo "❌ Error: Neither OpenSSL nor Node.js found."
    echo "   Please install one of these tools to generate a secure token."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Your secure admin token:"
echo ""
echo "  $TOKEN"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Copy this token and use it in one of these ways:"
echo ""
echo "1️⃣  Export as environment variable (quick testing):"
echo "   export ADMIN_TOKEN=\"$TOKEN\""
echo ""
echo "2️⃣  Add to .env file (recommended for development):"
echo "   echo 'ADMIN_TOKEN=$TOKEN' >> .env"
echo ""
echo "3️⃣  Add to your hosting platform's environment variables (production)"
echo ""
echo "⚠️  SECURITY REMINDERS:"
echo "   • Never commit this token to version control"
echo "   • Use different tokens for dev/staging/production"
echo "   • Store in your hosting platform's secret manager"
echo "   • Rotate tokens every 90 days"
echo ""
echo "📖 See ADMIN_SETUP.md for detailed setup instructions"
echo ""
