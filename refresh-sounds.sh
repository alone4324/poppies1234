#!/bin/bash

echo "🔄 Refreshing sounds from public/sounds folder..."

# Check if sounds folder exists
if [ ! -d "public/sounds" ]; then
    echo "❌ public/sounds folder not found!"
    echo "Please create the folder and add your sound files:"
    echo "  - background-music.mp3 (loops)"
    echo "  - click.mp3"
    echo "  - spin.mp3"
    echo "  - error.mp3"
    echo "  - funding.mp3"
    echo "  - monreward.mp3"
    echo "  - bad-luck.mp3"
    echo "  - wow.mp3"
    echo "  - reel.mp3 (loops during spin)"
    exit 1
fi

# List current sounds
echo "📁 Current sounds in public/sounds/:"
ls -la public/sounds/

echo ""
echo "✅ Sounds refreshed! You can now:"
echo "1. Click the refresh button (🔄) in the top-right corner of the game"
echo "2. Or reload the page to refresh all sounds"
echo ""
echo "🎵 Sound system features:"
echo "- Background music loops continuously"
echo "- Volume reduces during spin (reel + spin sounds)"
echo "- Returns to normal volume after popup closes"
echo "- MON reward sound plays IMMEDIATELY when result is received"
echo "- Bad luck sound plays for no-win outcomes"
echo "- Wow sound plays for NFT outcomes (Poppies NFT & Mainnet WL)"
echo "- Click sounds on ALL buttons (navigation, popups, close buttons)"
echo "- Funding sound plays completely before popup closes"
echo "- All sounds can be muted/unmuted with one button" 