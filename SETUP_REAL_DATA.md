# Polymarket Alpha Dashboard - Real Data Setup Guide

This guide will help you connect your dashboard to real data from The Graph API while avoiding CORS issues.

## 🚀 Quick Start

### Option 1: Using the Backend Proxy (Recommended)

1. **Install dependencies for both frontend and backend:**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

2. **Set up environment variables:**
```bash
# Create .env file in the server directory
cd server
cp .env.example .env
# Edit .env with your preferred values
```

3. **Start both servers:**
```bash
# Terminal 1 - Start the backend proxy server
cd server
npm start

# Terminal 2 - Start the React frontend
npm start
```

4. **Access the dashboard:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📊 Using Real Data from The Graph

The dashboard now uses Apollo Client to fetch real data from The Graph Protocol. The queries are located in `src/queries/polymarketQueries.js`.

### Available Data Queries:

1. **Top Traders** - Shows the most profitable addresses
2. **Market Data** - Displays active prediction markets
3. **Order Flow** - Analyzes buy/sell pressure
4. **Market Inefficiencies** - Finds arbitrage opportunities

### How CORS is Handled:

The backend proxy server (`server/index.js`) acts as an intermediary:
1. Frontend sends GraphQL queries to the proxy
2. Proxy forwards requests to The Graph
3. The Graph responds to the proxy (no CORS)
4. Proxy returns data to the frontend

## 🛠️ Configuration

### Frontend Configuration

Edit `src/apollo-client.js` to change the proxy URL:
```javascript
const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/graphql';
```

### Backend Configuration

The proxy server supports multiple subgraphs. Add new endpoints in `server/index.js`:
```javascript
const GRAPH_ENDPOINTS = {
  polymarket: 'https://api.thegraph.com/subgraphs/name/polymarket/polymarket-v2',
  // Add more subgraph endpoints here
};
```

## 🔧 Alternative Solutions

### Option 2: Direct API Calls (Development Only)

For development, you can disable CORS in your browser:

**Chrome (Mac):**
```bash
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

**Chrome (Windows):**
```bash
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
```

⚠️ **Warning:** Only use this for development. Never browse the regular web with security disabled.

### Option 3: Deploy to Production

When deploying to production:

1. **Vercel/Netlify:** Use serverless functions as your proxy
2. **AWS/GCP:** Deploy the Express server to handle API calls
3. **Same Domain:** Host both frontend and backend on the same domain to avoid CORS

## 📝 Adding New Queries

1. **Create the GraphQL query** in `src/queries/polymarketQueries.js`:
```javascript
export const MY_NEW_QUERY = gql`
  query MyQuery {
    # Your GraphQL query here
  }
`;
```

2. **Use the query** in your component:
```javascript
import { useQuery } from '@apollo/client';
import { MY_NEW_QUERY } from '../queries/polymarketQueries';

const { data, loading, error } = useQuery(MY_NEW_QUERY);
```

## 🐛 Troubleshooting

### CORS Errors
- Ensure the backend proxy is running
- Check that the proxy URL in `apollo-client.js` is correct
- Verify the frontend URL is whitelisted in the backend CORS config

### No Data Showing
- Check The Graph subgraph is active
- Verify GraphQL queries are correct
- Look for errors in browser console and server logs

### Connection Refused
- Make sure both servers are running
- Check ports aren't already in use
- Verify firewall settings

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Set environment variable: `REACT_APP_PROXY_URL=https://your-backend-url.com/api/graphql`
2. Build and deploy: `npm run build`

### Backend (Heroku/Railway/Render)
1. Deploy the `server` directory
2. Set environment variables
3. Update CORS origin to match your frontend URL

## 📚 Resources

- [The Graph Documentation](https://thegraph.com/docs/)
- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [Polymarket Subgraph](https://thegraph.com/hosted-service/subgraph/polymarket/polymarket-v2)

## Need Help?

If you encounter any issues:
1. Check the troubleshooting section
2. Look at server logs for detailed error messages
3. Open an issue on GitHub with:
   - Error messages
   - Steps to reproduce
   - Your environment details