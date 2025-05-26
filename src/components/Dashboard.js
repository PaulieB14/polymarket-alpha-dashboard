import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, DollarSign, Brain, AlertTriangle, Zap, Target, Eye, Info, RefreshCw, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('smartMoney');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate realistic demo data that updates
  const generateTopTraders = () => {
    const addresses = [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f2bd9e',
      '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
      '0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359',
      '0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB',
      '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb'
    ];

    return addresses.map((address, index) => {
      const baseVolume = 5000000 - index * 800000;
      const variance = Math.random() * 500000;
      const volume = baseVolume + variance;
      const profitRate = index < 2 ? 0.08 : -0.04;
      const profit = volume * profitRate * (0.8 + Math.random() * 0.4);
      const trades = 200 + Math.floor(Math.random() * 300);
      const winRate = profit > 0 ? 52 + Math.random() * 15 : 35 + Math.random() * 10;

      return {
        address,
        volume,
        profit,
        trades,
        winRate: Math.round(winRate),
        lastTrade: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString()
      };
    });
  };

  // Generate order flow data based on timeframe
  const generateOrderFlow = () => {
    const periods = selectedTimeframe === '1h' ? 6 : 
                   selectedTimeframe === '24h' ? 6 : 
                   selectedTimeframe === '7d' ? 7 : 12;
    
    const data = [];
    for (let i = 0; i < periods; i++) {
      const time = selectedTimeframe === '1h' ? `${i * 10}m` :
                   selectedTimeframe === '24h' ? `${i * 4}h` :
                   selectedTimeframe === '7d' ? `Day ${i + 1}` :
                   `${i * 2.5}d`;
      
      const baseVolume = 2000000 + Math.random() * 3000000;
      const buyRatio = 0.45 + Math.random() * 0.1;
      const buys = Math.round(baseVolume * buyRatio);
      const sells = Math.round(baseVolume * (1 - buyRatio));
      
      data.push({
        time,
        buys,
        sells,
        netFlow: buys - sells
      });
    }
    return data;
  };

  // Generate market data
  const generateMarkets = () => {
    const markets = [
      { question: "Will BTC reach $100,000 by end of 2024?", yesPrice: 0.72, volume: 3250000 },
      { question: "Will Trump win the 2024 Republican nomination?", yesPrice: 0.85, volume: 5420000 },
      { question: "Will there be a recession in 2024?", yesPrice: 0.34, volume: 1850000 },
      { question: "Will AI cause major job losses by 2025?", yesPrice: 0.61, volume: 920000 },
      { question: "Will SpaceX land on Mars before 2030?", yesPrice: 0.28, volume: 680000 },
      { question: "Will the Fed cut rates in Q2 2024?", yesPrice: 0.43, volume: 2100000 }
    ];

    return markets.map((market, index) => ({
      id: `market-${index}`,
      question: market.question,
      volume: market.volume + Math.random() * 100000,
      liquidity: market.volume * 0.3,
      yesPrice: market.yesPrice + (Math.random() - 0.5) * 0.02,
      noPrice: 1 - market.yesPrice,
      trades24h: Math.floor(100 + Math.random() * 500),
      active: true
    }));
  };

  const [topTraders] = useState(generateTopTraders());
  const [orderFlowData, setOrderFlowData] = useState(generateOrderFlow());
  const [markets] = useState(generateMarkets());

  // Update order flow when timeframe changes
  useEffect(() => {
    setOrderFlowData(generateOrderFlow());
  }, [selectedTimeframe]);

  // Calculate metrics
  const calculateFlowMetrics = () => {
    const totalBuys = orderFlowData.reduce((sum, d) => sum + d.buys, 0);
    const totalSells = orderFlowData.reduce((sum, d) => sum + d.sells, 0);
    const largeOrders = Math.floor(15 + Math.random() * 10);
    
    return {
      buyVolume: totalBuys,
      sellVolume: totalSells,
      ratio: (totalBuys / totalSells).toFixed(2),
      sentiment: totalBuys > totalSells ? 'Bullish' : 'Bearish',
      largeOrderPercent: largeOrders
    };
  };

  const flowMetrics = calculateFlowMetrics();

  // Calculate market stats
  const marketStats = {
    totalVolume: markets.reduce((sum, m) => sum + m.volume, 0),
    totalLiquidity: markets.reduce((sum, m) => sum + m.liquidity, 0),
    activeMarkets: markets.filter(m => m.active).length,
    avgYesPrice: (markets.reduce((sum, m) => sum + m.yesPrice, 0) / markets.length * 100).toFixed(1)
  };

  // Helper functions
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setOrderFlowData(generateOrderFlow());
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Polymarket Alpha Dashboard
            </h1>
            <p className="text-gray-400">Demo Mode - Simulated market data and analytics</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Demo Mode Banner */}
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg flex items-center">
        <Info className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
        <p className="text-blue-400 text-sm">
          This dashboard uses simulated data for demonstration. In production, connect to Polymarket's API via a backend proxy to avoid CORS issues.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-900 rounded-lg p-1 w-fit">
        {[
          { id: 'smartMoney', label: 'Smart Money', icon: Brain },
          { id: 'orderFlow', label: 'Order Flow', icon: TrendingUp },
          { id: 'markets', label: 'Live Markets', icon: Zap },
          { id: 'alerts', label: 'Alpha Alerts', icon: AlertTriangle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">Timeframe:</span>
          <div className="flex space-x-2">
            {['1h', '24h', '7d', '30d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                  selectedTimeframe === tf
                    ? 'bg-gray-800 text-blue-400 border border-blue-400'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <span className="text-gray-500 text-sm">
            Showing {selectedTimeframe} data
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Money Tracker */}
        {activeTab === 'smartMoney' && (
          <>
            <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-400" />
                Top Smart Money Addresses
              </h2>
              
              <div className="space-y-4">
                {topTraders.map((trader, index) => (
                  <div key={trader.address} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono text-sm text-blue-400">{trader.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {trader.trades} trades • Last: {trader.lastTrade}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${trader.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(trader.profit)}
                        </p>
                        <p className="text-xs text-gray-500">P&L</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Volume</p>
                        <p className="text-sm font-medium">{formatCurrency(trader.volume)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Win Rate</p>
                        <p className={`text-sm font-medium ${trader.winRate > 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.winRate}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rank</p>
                        <p className="text-sm font-medium text-yellow-400">#{index + 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-400" />
                Trading Insights
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Avg Win Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(topTraders.reduce((sum, t) => sum + t.winRate, 0) / topTraders.length).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Total Volume</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {formatCurrency(topTraders.reduce((sum, t) => sum + t.volume, 0))}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Net P&L</p>
                  <p className={`text-2xl font-bold ${
                    topTraders.reduce((sum, t) => sum + t.profit, 0) > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(topTraders.reduce((sum, t) => sum + t.profit, 0))}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Order Flow Analysis */}
        {activeTab === 'orderFlow' && (
          <>
            <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Order Flow Analysis - {selectedTimeframe}
              </h2>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={orderFlowData}>
                  <defs>
                    <linearGradient id="buyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="sellGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#9ca3af' }}
                    formatter={(value, name) => [
                      formatCurrency(value),
                      name === 'buys' ? 'Buy Volume' : 'Sell Volume'
                    ]}
                  />
                  <Area type="monotone" dataKey="buys" stroke="#10b981" fillOpacity={1} fill="url(#buyGradient)" />
                  <Area type="monotone" dataKey="sells" stroke="#ef4444" fillOpacity={1} fill="url(#sellGradient)" />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Net Flow Analysis</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={orderFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9ca3af' }}
                      formatter={(value) => [formatCurrency(value), 'Net Flow']}
                    />
                    <Bar dataKey="netFlow">
                      {orderFlowData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.netFlow > 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                Flow Metrics
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Buy Volume ({selectedTimeframe})</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(flowMetrics.buyVolume)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Sell Volume ({selectedTimeframe})</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(flowMetrics.sellVolume)}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Buy/Sell Ratio</p>
                  <p className="text-2xl font-bold text-blue-400">{flowMetrics.ratio}</p>
                  <p className="text-xs text-gray-500 mt-1">{flowMetrics.sentiment} sentiment</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Large Orders</p>
                  <p className="text-2xl font-bold text-purple-400">{flowMetrics.largeOrderPercent}%</p>
                  <p className="text-xs text-gray-500 mt-1">Of total volume</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Live Markets */}
        {activeTab === 'markets' && (
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Prediction Markets (Demo Data)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {markets.map((market) => (
                  <div
                    key={market.id}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <h3 className="font-semibold mb-3 text-sm">{market.question}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Volume 24h</p>
                        <p className="text-lg font-bold">{formatCurrency(market.volume)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Trades 24h</p>
                        <p className="text-lg font-bold">{market.trades24h}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-green-900/30 border border-green-800 rounded p-2">
                        <p className="text-xs text-gray-400">Yes</p>
                        <p className="text-lg font-semibold text-green-400">
                          {(market.yesPrice * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex-1 bg-red-900/30 border border-red-800 rounded p-2">
                        <p className="text-xs text-gray-400">No</p>
                        <p className="text-lg font-semibold text-red-400">
                          {(market.noPrice * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alpha Alerts */}
        {activeTab === 'alerts' && (
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Market Alerts
              </h2>
              
              <div className="space-y-4">
                {/* High volume markets */}
                {markets.filter(m => m.volume > 2000000).map((market) => (
                  <div
                    key={`volume-${market.id}`}
                    className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <Target className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="font-semibold">High Volume Market</p>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{market.question}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">volume</span>
                          <span className="text-sm font-medium text-blue-400">{formatCurrency(market.volume)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Price extremes */}
                {markets.filter(m => m.yesPrice > 0.8 || m.yesPrice < 0.2).map((market) => (
                  <div
                    key={`price-${market.id}`}
                    className="bg-gray-800 rounded-lg p-4 border-l-4 border-red-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <AlertCircle className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="font-semibold">Extreme Price Level</p>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{market.question}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">price</span>
                          <span className="text-sm font-medium text-blue-400">
                            Yes: {(market.yesPrice * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Active Markets</p>
          <p className="text-2xl font-bold">{marketStats.activeMarkets}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Volume</p>
          <p className="text-2xl font-bold">{formatCurrency(marketStats.totalVolume)}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Liquidity</p>
          <p className="text-2xl font-bold">{formatCurrency(marketStats.totalLiquidity)}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Avg Yes Price</p>
          <p className="text-2xl font-bold">{marketStats.avgYesPrice}%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;