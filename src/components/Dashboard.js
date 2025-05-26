import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Activity, DollarSign, Brain, AlertTriangle, Zap, Target, Eye } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_GLOBAL_STATS, GET_TOP_TRADERS, GET_RECENT_TRADES } from '../queries/polymarketQueries';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('smartMoney');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  
  // GraphQL queries
  const { loading: globalLoading, error: globalError, data: globalData } = useQuery(GET_GLOBAL_STATS);
  const { loading: tradersLoading, error: tradersError, data: tradersData } = useQuery(GET_TOP_TRADERS);
  const { loading: tradesLoading, error: tradesError, data: tradesData } = useQuery(GET_RECENT_TRADES);

  // Simulated data - will be replaced with real data from queries
  const smartMoneyData = tradersData?.accounts || [
    { id: '0x4bfb...982e', scaledCollateralVolume: 2145821969, scaledProfit: 45300000, numTrades: 342 },
    { id: '0xc5d5...f80a', scaledCollateralVolume: 5394853900, scaledProfit: 123000000, numTrades: 521 },
    { id: '0xd218...b5c9', scaledCollateralVolume: 174758983, scaledProfit: -13797330, numTrades: 89 },
    { id: '0x5bff...ffbe', scaledCollateralVolume: 158016200, scaledProfit: -6335658, numTrades: 134 },
    { id: '0x9d84...1344', scaledCollateralVolume: 135540546, scaledProfit: -6616914, numTrades: 201 }
  ];

  const orderFlowData = [
    { time: '00:00', buys: 4200000, sells: 3800000, netFlow: 400000 },
    { time: '04:00', buys: 3500000, sells: 4100000, netFlow: -600000 },
    { time: '08:00', buys: 5200000, sells: 4800000, netFlow: 400000 },
    { time: '12:00', buys: 6800000, sells: 5200000, netFlow: 1600000 },
    { time: '16:00', buys: 7200000, sells: 6800000, netFlow: 400000 },
    { time: '20:00', buys: 5800000, sells: 5400000, netFlow: 400000 }
  ];

  const marketHeatmapData = [
    { name: 'Presidential Election', volume: 45000000, change: 15.2, activity: 95, momentum: 'bullish' },
    { name: 'Fed Rate Decision', volume: 23000000, change: -8.5, activity: 78, momentum: 'bearish' },
    { name: 'Bitcoin Price EOY', volume: 18000000, change: 22.1, activity: 82, momentum: 'bullish' },
    { name: 'AI Regulation', volume: 12000000, change: 5.3, activity: 65, momentum: 'neutral' },
    { name: 'Climate Policy', volume: 8000000, change: -12.3, activity: 45, momentum: 'bearish' }
  ];

  const inefficiencyAlerts = [
    { id: 1, type: 'spread', market: 'Presidential Election', opportunity: 'Wide spread detected', value: '2.3%', severity: 'high' },
    { id: 2, type: 'arbitrage', market: 'Fed Rate Decision', opportunity: 'Cross-market arbitrage', value: '1.8%', severity: 'medium' },
    { id: 3, type: 'liquidity', market: 'Bitcoin Price EOY', opportunity: 'Liquidity imbalance', value: '$450K', severity: 'low' },
    { id: 4, type: 'momentum', market: 'AI Regulation', opportunity: 'Momentum divergence', value: '15 min', severity: 'high' }
  ];

  const whaleActivity = tradesData?.transactions?.slice(0, 4).map(tx => ({
    timestamp: new Date(parseInt(tx.timestamp) * 1000).toLocaleString(),
    address: tx.user?.id || '0x0000...0000',
    action: tx.type || 'UNKNOWN',
    market: 'Market #' + (tx.outcomeIndex || '0'),
    size: parseInt(tx.tradeAmount || '0'),
    price: 0.5 + Math.random() * 0.3
  })) || [
    { timestamp: '2024-01-25 14:32', address: '0x4bfb...982e', action: 'Buy', market: 'Presidential Election', size: 1200000, price: 0.62 },
    { timestamp: '2024-01-25 14:28', address: '0xc5d5...f80a', action: 'Sell', market: 'Fed Rate Decision', size: 800000, price: 0.71 },
    { timestamp: '2024-01-25 14:15', address: '0x9d84...1344', action: 'Buy', market: 'Bitcoin Price EOY', size: 500000, price: 0.44 },
    { timestamp: '2024-01-25 13:58', address: '0xd218...b5c9', action: 'Sell', market: 'AI Regulation', size: 350000, price: 0.58 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateWinRate = (profit, trades) => {
    // Simulated win rate calculation
    if (!trades || trades === 0) return 0;
    const baseRate = 50;
    const profitFactor = parseFloat(profit) > 0 ? 20 : -20;
    return Math.max(0, Math.min(100, baseRate + profitFactor + Math.random() * 10));
  };

  if (globalLoading || tradersLoading || tradesLoading) {
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
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Polymarket Alpha Dashboard
        </h1>
        <p className="text-gray-400">Track smart money, detect inefficiencies, and find alpha opportunities</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-900 rounded-lg p-1 w-fit">
        {['smartMoney', 'orderFlow', 'heatmap', 'alerts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab === 'smartMoney' && 'Smart Money'}
            {tab === 'orderFlow' && 'Order Flow'}
            {tab === 'heatmap' && 'Market Heatmap'}
            {tab === 'alerts' && 'Alpha Alerts'}
          </button>
        ))}
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2 mb-6">
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
                {smartMoneyData.map((trader, index) => {
                  const winRate = calculateWinRate(trader.scaledProfit, trader.numTrades);
                  return (
                    <div key={index} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-mono text-sm text-blue-400">{formatAddress(trader.id)}</p>
                          <p className="text-xs text-gray-500 mt-1">{trader.numTrades} trades</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${parseFloat(trader.scaledProfit) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(trader.scaledProfit)}
                          </p>
                          <p className="text-xs text-gray-500">P&L</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Volume</p>
                          <p className="text-sm font-medium">{formatCurrency(trader.scaledCollateralVolume)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Win Rate</p>
                          <p className={`text-sm font-medium ${winRate > 50 ? 'text-green-400' : 'text-red-400'}`}>
                            {winRate.toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="text-sm font-medium text-yellow-400 flex items-center">
                            <Activity className="w-3 h-3 mr-1" />
                            Active
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-400" />
                Recent Whale Activity
              </h2>
              <div className="space-y-3">
                {whaleActivity.map((activity, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`font-semibold ${activity.action === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {activity.action.toUpperCase()}
                      </p>
                      <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                    </div>
                    <p className="text-gray-300 text-xs mb-1">{activity.market}</p>
                    <div className="flex justify-between">
                      <p className="text-gray-400">{formatCurrency(activity.size)}</p>
                      <p className="text-gray-400">@ {activity.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
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
                Order Flow Imbalance
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
                    formatter={(value) => formatCurrency(value)}
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
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="netFlow" fill={(entry) => entry.netFlow > 0 ? '#10b981' : '#ef4444'} />
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
                  <p className="text-gray-400 text-sm mb-1">24h Buy Volume</p>
                  <p className="text-2xl font-bold text-green-400">$32.8M</p>
                  <p className="text-xs text-gray-500 mt-1">+12.3% from avg</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">24h Sell Volume</p>
                  <p className="text-2xl font-bold text-red-400">$28.6M</p>
                  <p className="text-xs text-gray-500 mt-1">-5.2% from avg</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Buy/Sell Ratio</p>
                  <p className="text-2xl font-bold text-blue-400">1.15</p>
                  <p className="text-xs text-gray-500 mt-1">Bullish sentiment</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Large Order %</p>
                  <p className="text-2xl font-bold text-purple-400">23.5%</p>
                  <p className="text-xs text-gray-500 mt-1">Smart money active</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Market Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Market Activity Heatmap
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketHeatmapData.map((market, index) => {
                  const heatIntensity = market.activity / 100;
                  const bgColor = market.momentum === 'bullish' ? 'rgba(16, 185, 129,' : 
                                  market.momentum === 'bearish' ? 'rgba(239, 68, 68,' : 
                                  'rgba(59, 130, 246,';
                  
                  return (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300 cursor-pointer transform hover:scale-105"
                      style={{
                        backgroundColor: `${bgColor} ${0.1 + heatIntensity * 0.2})`,
                      }}
                    >
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{market.name}</h3>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-2xl font-bold">{formatCurrency(market.volume)}</p>
                            <p className="text-sm text-gray-400">Volume</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${market.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatPercentage(market.change)}
                            </p>
                            <p className="text-sm text-gray-400">24h change</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-sm text-gray-400">Activity: {market.activity}%</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            market.momentum === 'bullish' ? 'bg-green-900 text-green-300' :
                            market.momentum === 'bearish' ? 'bg-red-900 text-red-300' :
                            'bg-blue-900 text-blue-300'
                          }`}>
                            {market.momentum}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1"
                        style={{
                          background: `linear-gradient(to right, ${bgColor} 1) 0%, ${bgColor} 1) ${market.activity}%, transparent ${market.activity}%)`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Activity Distribution */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Volume Distribution</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={marketHeatmapData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="volume"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {marketHeatmapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Market Momentum</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={marketHeatmapData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="name" stroke="#9ca3af" />
                      <PolarRadiusAxis stroke="#9ca3af" />
                      <Radar name="Activity" dataKey="activity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
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
                Inefficiency Alerts
              </h2>
              <div className="space-y-4">
                {inefficiencyAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
                      alert.severity === 'high' ? 'border-red-500' :
                      alert.severity === 'medium' ? 'border-yellow-500' :
                      'border-green-500'
                    } hover:bg-gray-750 transition-colors cursor-pointer`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <Target className="w-4 h-4 mr-2 text-gray-400" />
                          <p className="font-semibold">{alert.opportunity}</p>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{alert.market}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">{alert.type}</span>
                          <span className="text-sm font-medium text-blue-400">{alert.value}</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition-colors">
                        Investigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert Statistics */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-400">12</p>
                  <p className="text-sm text-gray-400 mt-1">High Severity</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">28</p>
                  <p className="text-sm text-gray-400 mt-1">Medium Severity</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">45</p>
                  <p className="text-sm text-gray-400 mt-1">Low Severity</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">$2.3M</p>
                  <p className="text-sm text-gray-400 mt-1">Potential Alpha</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Active Markets</p>
          <p className="text-2xl font-bold">{globalData?.global?.numOpenConditions || '9,805'}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Traders</p>
          <p className="text-2xl font-bold">{globalData?.global?.numTraders ? (parseInt(globalData.global.numTraders) / 1000000).toFixed(2) + 'M' : '1.14M'}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Volume</p>
          <p className="text-2xl font-bold">{globalData?.global?.scaledCollateralVolume ? formatCurrency(globalData.global.scaledCollateralVolume) : '$124.5M'}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Resolved Markets</p>
          <p className="text-2xl font-bold">{globalData?.global?.numClosedConditions || '48,624'}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;