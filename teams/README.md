
# Wheeler Staffing Teams App

This folder contains the Microsoft Teams app manifest and assets for integrating Wheeler Staffing Productivity Tracker with Microsoft Teams.

## Setup Instructions

### 1. Replace Placeholder Values

Before deploying, update these values in `manifest.json`:

- `your-app-domain.com` → Your actual app domain (e.g., `wheelerstaffing.lovable.app`)
- `your-azure-app-id` → Your Azure AD app registration ID
- Update URLs in the `developer` section with your actual company URLs

### 2. Create App Icons

You need two PNG icons:

- `icon-color.png` - 192x192px color icon
- `icon-outline.png` - 32x32px transparent outline icon

### 3. Handle Teams Context

Your app should detect when it's running in Teams and adjust accordingly. The URLs include `?teams=true` parameter to help with this.

### 4. Package the App

1. Zip the following files together:
   - `manifest.json`
   - `icon-color.png`
   - `icon-outline.png`

2. Name the zip file `wheelerstaffing-teams-app.zip`

### 5. Install in Teams

#### For Development:
1. Go to Teams Admin Center
2. Navigate to "Teams apps" → "Manage apps"
3. Click "Upload" → "Upload a custom app"
4. Select your zip file

#### For Organization:
1. Submit to your IT admin for approval
2. They can deploy it organization-wide

### 6. Features Available

- **Personal App**: Dashboard and Bulletin Board accessible from Teams sidebar
- **Channel Tabs**: Add productivity tracker as a tab in any channel
- **Single Sign-On**: Uses Teams authentication context

### 7. Testing

Test the app by:
1. Installing it in Teams
2. Opening the personal app tabs
3. Adding it as a channel tab
4. Verifying authentication works properly

## Technical Notes

- The app uses configurable tabs for channels and static tabs for personal use
- Authentication should integrate with your existing Supabase auth
- Consider adding webhook notifications to post bulletin updates to Teams channels
