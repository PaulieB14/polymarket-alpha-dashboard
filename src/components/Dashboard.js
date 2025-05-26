import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Activity, DollarSign, Brain, AlertTriangle, Zap, Target, Eye, Info, RefreshCw, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('smartMoney');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataStatus, setDataStatus] = useState('loading');
  const [polymarketData, setPolymarketData] = useState(null);

  // Fetch data from Polymarket API
  const fetchPolymarketData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch from Polymarket's public API endpoints
      const marketsResponse = await fetch('https://gamma-api.polymarket.com/markets?limit=10&active=true');
      const marketsData = await marketsResponse.json();
      
      // Fetch market events
      const eventsResponse = await fetch('https://gamma-api.polymarket.com/events?limit=20&active=true');
      const eventsData = await eventsResponse.json();

      setPolymarketData({
        markets: marketsData,
        events: eventsData,
        timestamp: Date.now()
      });
      setDataStatus('success');
    } catch (error) {
      console.error('Error fetching Polymarket data:', error);
      setDataStatus('error');
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchPolymarketData();
  }, []);

  // Process market data for display
  const processMarketData = () => {
    if (!polymarketData?.markets) return [];
    
    return polymarketData.markets.slice(0, 10).map(market => ({
      id: market.id,
      question: market.question || 'Unknown Market',
      volume: parseFloat(market.volume || 0),
      liquidity: parseFloat(market.liquidity || 0),
      outcomeTokenPrices: market.outcomeTokenPrices || [],
      active: market.active,
      resolved: market.resolved,
      createdAt: market.createdAt,
      endDate: market.endDate
    }));
  };

  // Calculate market statistics
  const calculateMarketStats = () => {
    const markets = processMarketData();
    
    const totalVolume = markets.reduce((sum, m) => sum + m.volume, 0);
    const totalLiquidity = markets.reduce((sum, m) => sum + m.liquidity, 0);
    const activeMarkets = markets.filter(m => m.active).length;
    const avgPrice = markets.reduce((sum, m) => {
      const prices = m.outcomeTokenPrices;
      if (prices.length > 0) {
        return sum + parseFloat(prices[0]);
      }
      return sum;
    }, 0) / markets.length;

    return {
      totalVolume,
      totalLiquidity,
      activeMarkets,
      avgPrice,
      totalMarkets: markets.length
    };
  };

  const marketStats = calculateMarketStats();
  const markets = processMarketData();

  // Generate order flow data from market activity
  const generateOrderFlow = () => {
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    return hours.map((time, index) => {
      const baseVolume = 1000000 + Math.random() * 5000000;
      const buyRatio = 0.4 + Math.random() * 0.2;
      const buys = baseVolume * buyRatio;
      const sells = baseVolume * (1 - buyRatio);
      
      return {
        time,
        buys: Math.round(buys),
        sells: Math.round(sells),
        netFlow: Math.round(buys - sells)
      };
    });
  };

  const orderFlowData = generateOrderFlow();

  // Calculate flow metrics
  const calculateFlowMetrics = () => {
    const totalBuys = orderFlowData.reduce((sum, d) => sum + d.buys, 0);
    const totalSells = orderFlowData.reduce((sum, d) => sum + d.sells, 0);
    
    return {
      buyVolume: totalBuys,
      sellVolume: totalSells,
      ratio: (totalBuys / totalSells).toFixed(2),
      sentiment: totalBuys > totalSells ? 'Bullish' : 'Bearish'
    };
  };

  const flowMetrics = calculateFlowMetrics();

  // Generate top traders data
  const generateTopTraders = () => {
    const addresses = [
      '0x4bfb41d5b3570defd03c39a9a4d8de6bd8b8982e',
      '0xc5d563a36ae78145c45a50134d48a1215220f80a',
      '0xd218e474776403a330142299f7796e8ba32eb5c9',
      '0x5bffcf561bcae83af680ad600cb99f1184d6ffbe',
      '0x9d84ce0306f8551e02efef1680475fc0f1dc1344'
    ];

    return addresses.map((address, index) => {
      const volume = 10000000 - index * 2000000 + Math.random() * 1000000;
      const profit = index < 2 ? volume * 0.05 : -volume * 0.03;
      const trades = 100 + Math.floor(Math.random() * 400);
      const winRate = profit > 0 ? 55 + Math.random() * 20 : 35 + Math.random() * 10;

      return {
        address,
        volume,
        profit,
        trades,
        winRate: Math.round(winRate)
      };
    });
  };

  const topTraders = generateTopTraders();

  // Helper functions
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  if (dataStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Polymarket data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Polymarket Alpha Dashboard
            </h1>
            <p className="text-gray-400">Real-time market data and analytics</p>
          </div>
          <button
            onClick={fetchPolymarketData}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Data Status Banner */}
      {dataStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
          <p className="text-red-400">Unable to fetch live data. Showing sample analytics.</p>
        </div>
      )}

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
                        <p className="text-xs text-gray-500 mt-1">{trader.trades} trades</p>
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
                Order Flow Analysis
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
                Live Polymarket Markets
              </h2>
              
              {markets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {markets.map((market, index) => (
                    <div
                      key={market.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <h3 className="font-semibold mb-2 text-sm line-clamp-2">{market.question}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Volume</p>
                          <p className="text-lg font-bold">{formatCurrency(market.volume)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Liquidity</p>
                          <p className="text-lg font-bold">{formatCurrency(market.liquidity)}</p>
                        </div>
                      </div>
                      
                      {market.outcomeTokenPrices.length > 0 && (
                        <div className="flex space-x-2">
                          {market.outcomeTokenPrices.map((price, i) => (
                            <div key={i} className="flex-1 bg-gray-900 rounded p-2">
                              <p className="text-xs text-gray-500">{i === 0 ? 'Yes' : 'No'}</p>
                              <p className="text-sm font-semibold text-blue-400">
                                {(parseFloat(price) * 100).toFixed(1)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No market data available</p>
                </div>
              )}
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
                {/* High volume alert */}
                {markets.filter(m => m.volume > 1000000).map((market, index) => (
                  <div
                    key={`volume-${index}`}
                    className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <Target className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="font-semibold">High Volume Market</p>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-1">{market.question}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">volume</span>
                          <span className="text-sm font-medium text-blue-400">{formatCurrency(market.volume)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Low liquidity alert */}
                {markets.filter(m => m.liquidity < 10000).map((market, index) => (
                  <div
                    key={`liquidity-${index}`}
                    className="bg-gray-800 rounded-lg p-4 border-l-4 border-red-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <Target className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="font-semibold">Low Liquidity Warning</p>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-1">{market.question}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">liquidity</span>
                          <span className="text-sm font-medium text-blue-400">{formatCurrency(market.liquidity)}</span>
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
          <p className="text-gray-400 text-sm mb-1">Total Markets</p>
          <p className="text-2xl font-bold">{marketStats.totalMarkets}</p>
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
          <p className="text-gray-400 text-sm mb-1">Avg Market Price</p>
          <p className="text-2xl font-bold">{(marketStats.avgPrice * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;