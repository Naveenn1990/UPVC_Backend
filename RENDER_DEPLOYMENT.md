# Deploying Backend to Render.com

## Issue Fixed
The error "No open ports detected" was caused by:
1. Render was running `node app.js` instead of `node server.js`
2. Server wasn't binding to `0.0.0.0` (required for Render)

## Changes Made
1. ✅ Updated `package.json` - Changed `main` from `app.js` to `server.js`
2. ✅ Updated `server.js` - Now binds to `0.0.0.0` instead of localhost
3. ✅ Created `render.yaml` - Configuration file for Render

## Deployment Steps

### Step 1: Push Changes to GitHub
```bash
cd UPVC_Backend
git add .
git commit -m "Fix Render deployment - bind to 0.0.0.0 and use server.js"
git push origin main
```

### Step 2: Configure Render Service

1. **Go to Render Dashboard**
   - Log in to [render.com](https://render.com)
   - Go to your service settings

2. **Update Build & Start Commands**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node server.js`)
   - Make sure it's NOT `node app.js`

3. **Set Environment Variables**
   In Render Dashboard → Environment:
   - `NODE_ENV` = `production`
   - `PORT` = (Render will set this automatically, but you can set it to `10000`)
   - `MONGODB_URI` = Your MongoDB connection string
   - Any other environment variables your app needs

4. **Save and Redeploy**
   - Click "Save Changes"
   - Click "Manual Deploy" → "Deploy latest commit"

### Step 3: Verify Deployment

After deployment, check the logs:
- You should see: `Server running on http://0.0.0.0:XXXX`
- MongoDB should connect successfully
- No "No open ports detected" errors

## Important Notes

### Port Binding
- Render automatically sets the `PORT` environment variable
- Your server must listen on `0.0.0.0` (not `localhost` or `127.0.0.1`)
- This allows Render's load balancer to connect to your service

### Start Command
- Use `npm start` which runs `node server.js`
- DO NOT use `node app.js` (app.js doesn't start the server)

### Environment Variables
Make sure all required environment variables are set in Render:
- MongoDB connection string
- JWT secrets
- API keys
- Any other config values

## Troubleshooting

### Still getting "No open ports detected"
1. Check that `server.js` is listening on `0.0.0.0`
2. Verify the start command is `npm start` or `node server.js`
3. Check logs to see if the server is actually starting

### Server starts but can't connect
1. Verify CORS settings allow your frontend domain
2. Check that all routes are properly configured
3. Verify MongoDB connection string is correct

### Build fails
1. Check Node.js version (Render uses Node 22 by default)
2. Verify all dependencies are in `package.json`
3. Check build logs for specific errors

## Quick Checklist

- [ ] `package.json` has `"main": "server.js"`
- [ ] `package.json` has `"start": "node server.js"`
- [ ] `server.js` binds to `0.0.0.0`
- [ ] Render start command is `npm start`
- [ ] All environment variables are set in Render
- [ ] MongoDB connection string is configured
- [ ] Changes pushed to GitHub
- [ ] Service redeployed

## After Deployment

Your backend will be available at:
- `https://your-service-name.onrender.com`

Update your frontend API URLs to point to this URL!

