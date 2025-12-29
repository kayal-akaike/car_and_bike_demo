# 🚀 Deployment Guide - Vehicle Assistant Bot

Complete guide to deploy the Vehicle Assistant Bot (TESSA) with backend on Render and frontend on Vercel.

## 📋 Pre-Deployment Checklist

- [ ] Code committed to GitHub repository
- [ ] OpenAI API key ready
- [ ] Render account created (https://render.com)
- [ ] Vercel account created (https://vercel.com)

---

## 🖥️ Part 1: Deploy Backend to Render

### Step 1: Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `kayal-akaike/car_and_bike_demo`
4. Click **"Connect"**

### Step 2: Configure Build Settings

**Basic Settings:**
- **Name:** `vehicle-bot-backend` (or your preferred name)
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** (leave empty)
- **Runtime:** `Python 3`

**Build & Deploy:**
- **Build Command:** 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  uvicorn backend_api:app --host 0.0.0.0 --port $PORT
  ```

### Step 3: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | `your-openai-api-key` |
| `APP_PASSWORD` | `test123` |
| `OTP` | `4529` |
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` (update after frontend deployment) |

**Important:** Keep your OpenAI API key secure!

### Step 4: Choose Plan & Deploy

- **Instance Type:** Free (for testing) or Starter ($7/month for production)
- Click **"Create Web Service"**
- Wait for deployment (5-10 minutes)

### Step 5: Get Backend URL

Once deployed, you'll see your backend URL:
```
https://vehicle-bot-backend.onrender.com
```

**Copy this URL** - you'll need it for frontend deployment!

### Step 6: Test Backend

Visit your backend URL in browser:
```
https://vehicle-bot-backend.onrender.com/docs
```

You should see the FastAPI documentation page.

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

1. Open terminal in project root:
   ```bash
   cd E:\Mahindra\Frontend\vehicle_bot
   ```

2. Update `.env.production` in react-frontend folder:
   ```bash
   # react-frontend/.env.production
   REACT_APP_API_URL=https://vehicle-bot-backend.onrender.com
   ```
   Replace with your actual Render backend URL.

3. Commit changes:
   ```bash
   git add .
   git commit -m "Configure production environment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `kayal-akaike/car_and_bike_demo`
4. Click **"Import"**

### Step 3: Configure Project Settings

**Framework Preset:** Create React App (auto-detected)

**Root Directory:** 
- Click **"Edit"**
- Enter: `react-frontend`
- Click **"Continue"**

**Build Settings:**
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `build` (auto-filled)
- **Install Command:** `npm install` (auto-filled)

### Step 4: Set Environment Variables

Click **"Environment Variables"**

Add:
| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://vehicle-bot-backend.onrender.com` |

(Replace with your actual Render backend URL)

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build (2-5 minutes)
3. Once complete, you'll get your frontend URL:
   ```
   https://your-app.vercel.app
   ```

---

## 🔗 Part 3: Connect Frontend & Backend

### Update Backend CORS

1. Go back to Render Dashboard
2. Open your web service
3. Go to **"Environment"** tab
4. Update `ALLOWED_ORIGINS` variable:
   ```
   https://your-app.vercel.app,http://localhost:3000
   ```
   (Replace with your actual Vercel URL)
5. Click **"Save Changes"**
6. Service will automatically redeploy

### Test the Connection

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try logging in with password: `test123`
3. Ask a question: "What cars are available under 10 lakh?"
4. Verify the response comes from backend

---

## ✅ Verification Checklist

- [ ] Backend deployed on Render
- [ ] Backend `/docs` endpoint accessible
- [ ] Frontend deployed on Vercel
- [ ] Frontend loads without errors
- [ ] Login works with password `test123`
- [ ] Chat queries get responses from backend
- [ ] Admin features work (config panel)
- [ ] Quick action buttons work

---

## 🔧 Post-Deployment Tasks

### Update README with Live URLs

Add to your README.md:
```markdown
## 🌐 Live Demo

- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://vehicle-bot-backend.onrender.com
- **API Docs:** https://vehicle-bot-backend.onrender.com/docs
```

### Set Up Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS records

---

## 🐛 Troubleshooting

### Frontend shows "Network Error"

**Cause:** Backend URL incorrect or CORS not configured

**Solution:**
1. Verify `REACT_APP_API_URL` in Vercel environment variables
2. Check `ALLOWED_ORIGINS` in Render includes your Vercel URL
3. Redeploy both services

### Backend shows 500 errors

**Cause:** Missing environment variables or data files

**Solution:**
1. Check all environment variables set in Render
2. Verify `OPENAI_API_KEY` is valid
3. Check deployment logs for errors

### Render free tier sleeps after inactivity

**Note:** Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to Starter plan ($7/month) for always-on service

### Build fails on Vercel

**Cause:** Missing dependencies or build errors

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify `react-frontend` root directory is correct
3. Test build locally: `cd react-frontend && npm run build`

---

## 💰 Cost Estimate

### Free Tier (Testing)
- **Render:** Free (with sleep after inactivity)
- **Vercel:** Free (100 GB bandwidth/month)
- **Total:** $0/month

### Production Tier
- **Render Starter:** $7/month (always-on, 512MB RAM)
- **Vercel Pro:** $20/month (1TB bandwidth, custom domains)
- **Total:** $7-27/month

---

## 📊 Monitoring

### Render Metrics
- Dashboard → Your Service → Metrics
- Monitor CPU, memory, response times
- View logs for debugging

### Vercel Analytics
- Project → Analytics
- Monitor page views, response times
- Track errors and performance

---

## 🔄 Continuous Deployment

Both platforms support auto-deployment:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Automatic Builds:**
   - Render: Rebuilds backend automatically
   - Vercel: Rebuilds frontend automatically

3. **Zero Downtime:**
   - New version deployed alongside old
   - Traffic switches after successful health checks

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - use `.gitignore`
2. **Rotate API keys** regularly
3. **Use environment variables** for all secrets
4. **Enable HTTPS only** (both platforms do this automatically)
5. **Monitor API usage** to prevent abuse
6. **Set rate limits** if needed

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **OpenAI API:** https://platform.openai.com/docs

---

**Last Updated:** December 29, 2024  
**Status:** Production Ready ✅

### Steps

1. **Push code to GitHub** (API keys are already excluded):
```bash
git add .
git commit -m "Deploy Streamlit app"
git push origin main
```

2. **Deploy on Streamlit Cloud**:
   - Visit [share.streamlit.io](https://share.streamlit.io)
   - Click "New app"
   - Connect your GitHub repository
   - Set main file: `streamlit_apps/mahindra_bot_app.py`
   - Configure secrets (see above)
   - Click "Deploy"

3. **Verify deployment**:
   - Check that all data files are accessible
   - Test login functionality
   - Verify API calls work correctly

### Updating the Deployed App

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main
# Streamlit Cloud auto-deploys on push
```

---

## ⚛️ Deploying React Frontend + Backend

### Architecture
- **Frontend**: React app (can deploy to Vercel, Netlify, etc.)
- **Backend**: FastAPI server (can deploy to Render, Railway, etc.)

### Option 1: Deploy Both to Render.com (Recommended)

#### Backend Deployment

1. **Create `render.yaml`** (already in repo):
```yaml
services:
  - type: web
    name: mahindra-bot-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn backend_api:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: PYTHON_VERSION
        value: 3.11.0
```

2. **Deploy to Render**:
   - Connect GitHub repo to [Render](https://render.com)
   - Create new "Web Service"
   - Set environment variables in dashboard
   - Deploy

3. **Note the backend URL** (e.g., `https://mahindra-bot-api.onrender.com`)

#### Frontend Deployment

1. **Update API URL** in React app:
```typescript
// react-frontend/src/hooks/useChatApi.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mahindra-bot-api.onrender.com';
```

2. **Build React app**:
```bash
cd react-frontend
npm run build
```

3. **Deploy to Vercel/Netlify**:
   
   **Vercel:**
   ```bash
   npm install -g vercel
   cd react-frontend
   vercel --prod
   ```
   
   **Netlify:**
   ```bash
   npm install -g netlify-cli
   cd react-frontend
   netlify deploy --prod --dir=build
   ```

### Option 2: Docker Deployment

1. **Build and run with Docker Compose**:
```bash
docker-compose up --build
```

2. **Deploy to cloud provider** (AWS ECS, Google Cloud Run, etc.)

---

## 🔄 Pre-Deployment Checklist

### Before Pushing to GitHub

- [ ] Verify `.env` is in `.gitignore`
- [ ] Verify `.streamlit/secrets.toml` is in `.gitignore`
- [ ] Check no API keys in code with:
  ```bash
  git grep -i "sk-" "*.py" "*.ts" "*.tsx"
  ```
- [ ] Ensure `.env.example` has placeholder values only
- [ ] All data files committed (`data/` directory)
- [ ] Requirements files updated:
  ```bash
  pip freeze > requirements.txt
  ```

### For Streamlit Cloud

- [ ] API keys configured in Streamlit Cloud secrets
- [ ] `streamlit_apps/mahindra_bot_app.py` works with both `.env` (local) and `st.secrets` (cloud)
- [ ] All data paths are relative (not absolute)
- [ ] Login page works (or DEBUG=true to skip)

### For React + Backend

- [ ] Backend CORS configured for frontend domain
- [ ] Frontend API_URL points to deployed backend
- [ ] All environment variables documented in README
- [ ] Health check endpoint works (`/` endpoint)

---

## 🐛 Troubleshooting

### "OPENAI_API_KEY not set"

**Local:**
- Check `.env` file exists
- Ensure `.env` is loaded: `load_dotenv()`

**Streamlit Cloud:**
- Verify secrets in app dashboard
- Check `st.secrets.get("OPENAI_API_KEY")` returns value

### "Services not initialized"

- Check all data files are in repository
- Verify paths are relative: `data/new_car_details/`
- Check file permissions

### CORS errors (React + Backend)

- Update backend CORS to include frontend URL:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📚 Additional Resources

- [Streamlit Deployment Docs](https://docs.streamlit.io/streamlit-community-cloud/get-started/deploy-an-app)
- [Render Deployment Guide](https://render.com/docs)
- [Vercel React Deployment](https://vercel.com/docs/frameworks/create-react-app)
- [Managing Secrets in Streamlit](https://docs.streamlit.io/streamlit-community-cloud/deploy-your-app/secrets-management)

---

## 🎉 Success!

Your app is now deployed and accessible to users. Remember:
- Keep API keys secret
- Monitor usage and costs
- Update regularly from GitHub
- Check logs for errors
