# Polymarket Alpha Dashboard

🚀 **Smart Money Alpha Dashboard for Polymarket** - Track profitable traders, detect market inefficiencies, and find alpha opportunities.

![Dashboard Preview](https://img.shields.io/badge/React-18.2.0-blue) ![GraphQL](https://img.shields.io/badge/GraphQL-Powered-pink) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.6-blue)

## 🌟 Features

### 1. Smart Money Tracker
- **Top Traders Analysis**: Track the most profitable addresses on Polymarket
- **P&L Rankings**: See who's making (or losing) the most money
- **Trade Patterns**: Analyze trading frequency and average position sizes
- **Real-time Whale Activity**: Monitor large trades as they happen

### 2. Order Flow Analysis
- **Buy/Sell Pressure**: Visualize market sentiment through order flow
- **Net Flow Charts**: Identify momentum shifts and trend changes
- **Volume Metrics**: Track 24h volumes and buy/sell ratios
- **Smart Money Indicators**: See when large traders are active

### 3. Market Activity Heatmap
- **Visual Market Scanner**: Quickly identify hot markets
- **Activity Levels**: See which markets have the most action
- **Momentum Indicators**: Bullish/bearish/neutral market classification
- **Volume Distribution**: Understand where money is flowing

### 4. Alpha Alerts System
- **Inefficiency Detection**: Find wide spreads and arbitrage opportunities
- **Severity Classification**: High/medium/low priority alerts
- **Opportunity Tracking**: Monitor potential profit opportunities
- **Real-time Notifications**: Get alerted to market inefficiencies

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0
- **Data Layer**: Apollo Client + GraphQL
- **Visualization**: Recharts
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Data Source**: The Graph Protocol (Polymarket Subgraphs)

## 📊 Data Sources

This dashboard uses multiple Polymarket subgraphs:

1. **Main Polymarket Subgraph**: `QmdyCguLEisTtQFveEkvMhTH7UzjyhnrF9kpvhYeG4QX8a`
   - Account data, conditions, market makers
   - Profit/loss tracking
   - Trading activity

2. **Order Filled Events**: `Qma5ngHGmgW8qea4nEXmFjNtJb9aXDwV75hWekpTKD1fYf`
   - Real-time order flow
   - Trade execution data
   - Market microstructure

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PaulieB14/polymarket-alpha-dashboard.git
cd polymarket-alpha-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard

### Building for Production

```bash
npm run build
# or
yarn build
```

This creates an optimized production build in the `build` folder.

## 📈 Usage Guide

### Smart Money Tracking
1. Navigate to the "Smart Money" tab
2. View top traders sorted by profit or volume
3. Click on any trader to see their detailed history
4. Monitor the whale activity feed for real-time large trades

### Finding Alpha Opportunities
1. Check the "Alpha Alerts" tab regularly
2. Look for high-severity alerts (red indicators)
3. Click "Investigate" to analyze opportunities
4. Cross-reference with order flow data

### Market Analysis
1. Use the heatmap to find active markets
2. Check momentum indicators (bullish/bearish)
3. Analyze volume distribution across markets
4. Use timeframe selectors to zoom in/out

## 🔧 Configuration

### Updating Subgraph Endpoints

Edit `src/index.js` to change the GraphQL endpoint:

```javascript
const client = new ApolloClient({
  uri: 'YOUR_SUBGRAPH_URL_HERE',
  cache: new InMemoryCache(),
});
```

### Adding New Queries

Add GraphQL queries in `src/queries/polymarketQueries.js`:

```javascript
export const YOUR_NEW_QUERY = gql`
  query YourQuery {
    // Your GraphQL query here
  }
`;
```

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      // Add your custom colors here
    }
  }
}
```

### Dashboard Layout

Modify `src/components/Dashboard.js` to:
- Add new tabs
- Change grid layouts
- Customize chart types
- Add new metrics

## 📱 Mobile Responsiveness

The dashboard is fully responsive and works on:
- Desktop (optimal experience)
- Tablet (adjusted layouts)
- Mobile (stacked components)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Polymarket for providing the prediction market infrastructure
- The Graph Protocol for decentralized data indexing
- The DeFi community for inspiration and feedback

## 📞 Contact

Created by [@PaulieB14](https://github.com/PaulieB14)

Feel free to reach out with questions, suggestions, or collaboration ideas!

---

⭐ If you find this dashboard useful, please consider starring the repository!