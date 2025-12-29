# Deployment Guide - Mahindra Bot

This guide covers deploying both the Streamlit and React versions of the Mahindra Bot.

## 🔐 Security First - Managing API Keys

**IMPORTANT:** Never commit API keys or secrets to GitHub!

### For Local Development

1. **Create `.env` file** (already in `.gitignore`):
```bash
cp .env.example .env
```

2. **Add your API keys** to `.env`:
```env
OPENAI_API_KEY=sk-your-actual-key-here
APP_PASSWORD=your-secure-password
DEBUG=false
```

### For Streamlit Cloud Deployment

1. **DO NOT create `.streamlit/secrets.toml` locally** - it's git-ignored for security

2. **Configure secrets in Streamlit Cloud dashboard**:
   - Go to your app settings on [share.streamlit.io](https://share.streamlit.io)
   - Click "Secrets" in the left sidebar
   - Add your secrets in TOML format:
   ```toml
   OPENAI_API_KEY = "sk-your-actual-key-here"
   APP_PASSWORD = "your-secure-password"
   DEBUG = false
   ```

3. **Reference in code** (already done):
   ```python
   import streamlit as st
   api_key = st.secrets.get("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
   ```

---

## 📦 Deploying Streamlit App

### Prerequisites
- GitHub repository with your code
- Streamlit Cloud account (free at [share.streamlit.io](https://share.streamlit.io))
- OpenAI API key

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
