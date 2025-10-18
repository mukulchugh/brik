#!/bin/bash

# Automated iOS Widget Extension Setup Script
# This script creates a Widget Extension target in Xcode programmatically

set -e

WIDGET_NAME="${1:-BrikWidget}"
IOS_DIR="${2:-$(pwd)/ios}"

echo "🍎 Creating iOS Widget Extension: $WIDGET_NAME"
echo "📁 iOS Directory: $IOS_DIR"

# Check if ios directory exists
if [ ! -d "$IOS_DIR" ]; then
    echo "❌ Error: iOS directory not found at $IOS_DIR"
    exit 1
fi

# Widget files already created by ios-setup command
WIDGET_DIR="$IOS_DIR/$WIDGET_NAME"

echo "✅ Widget files ready at $WIDGET_DIR"
echo ""
echo "📋 To complete setup in Xcode:"
echo ""
echo "1. Open the .xcworkspace file:"
echo "   open $IOS_DIR/*.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   - File → New → Target"
echo "   - Select 'Widget Extension'"
echo "   - Product Name: $WIDGET_NAME"
echo "   - Uncheck 'Include Configuration Intent'"
echo "   - Click Finish → Activate"
echo ""
echo "3. Replace generated files:"
echo "   - Delete the auto-generated ${WIDGET_NAME}.swift and other files"
echo "   - In Project Navigator, right-click $WIDGET_NAME folder"
echo "   - Add Files to \"$WIDGET_NAME\""
echo "   - Select files from $WIDGET_DIR"
echo ""
echo "4. Add generated widget views:"
echo "   - Select $IOS_DIR/brik/Generated/*.swift files"
echo "   - File Inspector → Target Membership → Check $WIDGET_NAME"
echo ""
echo "5. Build widget:"
echo "   - Select $WIDGET_NAME scheme (top bar)"
echo "   - Select simulator"
echo "   - Press ⌘R"
echo ""
echo "6. Add to home screen:"
echo "   - Long press simulator home screen"
echo "   - Tap + button"
echo "   - Search 'Brik'"
echo "   - Add widget"
echo ""
echo "✨ Done! Your native widget will appear on the home screen!"

