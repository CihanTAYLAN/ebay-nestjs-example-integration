#!/bin/bash

# eBay AU CLI Setup Script
# This script sets up the eBay AU CLI environment

set -e

echo "🚀 Setting up eBay AU CLI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="14.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to 14+"
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install axios chalk commander dotenv

# Make CLI script executable
chmod +x ebay-au-cli.js

# Test CLI installation
echo "🧪 Testing CLI installation..."
node ebay-au-cli.js --help > /dev/null 2>&1 || {
    echo "❌ CLI installation test failed"
    exit 1
}

echo "✅ CLI installation successful!"

# Display usage instructions
echo ""
echo "🎯 Quick Start:"
echo "1. Get access token via OAuth flow"
echo "2. Run: node ebay-au-cli.js push-product --help"
echo ""
echo "📚 Documentation:"
echo "- See README.md for detailed usage"
echo ""
echo "🚀 Example usage:"
echo "node ebay-au-cli.js push-product \\"
echo "  --token YOUR_ACCESS_TOKEN \\"
echo "  --sku 'COIN-ANCIENT-GOLD-001' \\"
echo "  --title 'Ancient Gold Coin - Sealed Authentic' \\"
echo "  --description 'Authentic ancient gold coin from the Roman Empire era...' \\"
echo "  --price 149.99 \\"
echo "  --quantity 1"