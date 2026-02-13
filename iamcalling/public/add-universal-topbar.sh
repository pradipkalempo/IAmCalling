#!/bin/bash

# List of all HTML pages that need universal topbar
pages=(
    \"01-index.html\"
    \"01-response-index.html\" 
    \"02-about.html\"
    \"04-categories.html\"
    \"05-search.html\"
    \"09-ideology-analyzer.html\"
    \"10-critical-thinking-challenge.html\"
    \"10-ideological-battle.html\"
    \"14-subscription.html\"
    \"15-login.html\"
    \"16-register.html\"
    \"18-profile.html\"
    \"19-user_settings.html\"
    \"20-password_reset.html\"
    \"21-email_verification.html\"
    \"22-write_article.html\"
    \"27-user_profiles_public.html\"
    \"29-analytics_dashboard.html\"
    \"34-icalluser-messenger.html\"
    \"35-reward-claim.html\"
    \"37-privacy-policy.html\"
    \"39-admin-login.html\"
    \"40-admin-dashboard-simple.html\"
    \"cloudinary-explorer.html\"
    \"public_profileview.html\"
    \"quick-supabase-test.html\"
    \"reset_password.html\"
    \"reset-password.html\"
    \"test_cloudinary_fix.html\"
    \"user-profile-articles.html\"
)

echo \"Adding universal topbar injector to all pages...\"

for page in \"${pages[@]}\"; do
    if [ -f \"$page\" ]; then
        # Check if injector already exists
        if ! grep -q \"universal-topbar-injector.js\" \"$page\"; then
            # Add injector script before closing head tag
            sed -i 's|</head>|    <script src=\"js/universal-topbar-injector.js\"></script>\\n</head>|' \"$page\"
            echo \"✅ Added to $page\"
        else
            echo \"⚠️  Already exists in $page\"
        fi
    else
        echo \"❌ File not found: $page\"
    fi
done

echo \"Universal topbar injection complete!\"
