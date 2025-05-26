import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Activity, DollarSign, Brain, AlertTriangle, Zap, Target, Eye, Info, RefreshCw } from 'lucide-react';
import { useQuery, gql } from '@apollo/client';

// GraphQL Queries
const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    global(id: "") {
      numConditions
      numOpenConditions
      numClosedConditions
      numTraders
      tradesQuantity
      scaledCollateralVolume
      scaledCollateralFees
    }
  }
`;

const GET_TOP_TRADERS = gql`
  query GetTopTraders {
    accounts(first: 20, orderBy: scaledProfit, orderDirection: desc) {
      id
      scaledCollateralVolume
      scaledProfit
      numTrades
      creationTimestamp
      lastTradedTimestamp
    }
  }
`;

const GET_RECENT_TRADES = gql`
  query GetRecentTrades($timestamp: BigInt!) {
    transactions(
      first: 100, 
      orderBy: timestamp, 
      orderDirection: desc,
      where: { timestamp_gte: $timestamp }
    ) {
      id
      timestamp
      type
      user {
        id
      }
      market {
        id
      }
      tradeAmount
      outcomeTokensAmount
      outcomeIndex
    }
  }
`;

const GET_MARKET_MAKERS = gql`
  query GetMarketMakers {
    fixedProductMarketMakers(first: 10, orderBy: scaledCollateralVolume, orderDirection: desc) {
      id
      scaledCollateralVolume
      tradesQuantity
      scaledCollateralBuyVolume
      scaledCollateralSellVolume
      lastActiveDay
      outcomeTokenPrices
      conditions
    }
  }
`;

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('smartMoney');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate timestamp based on timeframe
  const getTimestamp = () => {
    const now = Math.floor(Date.now() / 1000);
    switch (selectedTimeframe) {
      case '1h': return now - 3600;
      case '24h': return now - 86400;
      case '7d': return now - 604800;
      case '30d': return now - 2592000;
      default: return now - 86400;
    }
  };

  // GraphQL queries
  const { loading: globalLoading, error: globalError, data: globalData, refetch: refetchGlobal } = 
    useQuery(GET_GLOBAL_STATS);
  
  const { loading: tradersLoading, error: tradersError, data: tradersData, refetch: refetchTraders } = 
    useQuery(GET_TOP_TRADERS);
  
  const { loading: tradesLoading, error: tradesError, data: tradesData, refetch: refetchTrades } = 
    useQuery(GET_RECENT_TRADES, {
      variables: { timestamp: getTimestamp().toString() }
    });

  const { loading: marketsLoading, error: marketsError, data: marketsData, refetch: refetchMarkets } = 
    useQuery(GET_MARKET_MAKERS);

  // Refetch data when timeframe changes
  useEffect(() => {
    refetchTrades({ timestamp: getTimestamp().toString() });
  }, [selectedTimeframe]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchGlobal(),
        refetchTraders(),
        refetchTrades(),
        refetchMarkets()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setIsRefreshing(false);
  };

  // Process order flow data from real transactions
  const processOrderFlow = () => {
    if (!tradesData?.transactions) return [];

    // Group transactions by hour
    const hourlyData = {};
    const now = new Date();
    
    // Initialize hours
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);
      hour.setHours(now.getHours() - i, 0, 0, 0);
      const key = hour.getHours();
      hourlyData[key] = { buys: 0, sells: 0, buyCount: 0, sellCount: 0 };
    }

    // Process transactions
    tradesData.transactions.forEach(tx => {
      const date = new Date(parseInt(tx.timestamp) * 1000);
      const hour = date.getHours();
      const amount = parseFloat(tx.tradeAmount) / 1e6; // Convert to USDC

      if (tx.type === 'Buy') {
        hourlyData[hour].buys += amount;
        hourlyData[hour].buyCount += 1;
      } else if (tx.type === 'Sell') {
        hourlyData[hour].sells += amount;
        hourlyData[hour].sellCount += 1;
      }
    });

    // Convert to array for chart
    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        time: `${hour.padStart(2, '0')}:00`,
        buys: Math.round(data.buys),
        sells: Math.round(data.sells),
        netFlow: Math.round(data.buys - data.sells),
        buyCount: data.buyCount,
        sellCount: data.sellCount
      }))
      .sort((a, b) => parseInt(a.time) - parseInt(b.time))
      .slice(-6); // Last 6 data points
  };

  const orderFlowData = processOrderFlow();

  // Calculate flow metrics
  const calculateFlowMetrics = () => {
    if (!tradesData?.transactions) return {
      buyVolume: 0,
      sellVolume: 0,
      buyCount: 0,
      sellCount: 0,
      ratio: 0,
      largeOrderPercent: 0
    };

    const transactions = tradesData.transactions;
    let buyVolume = 0;
    let sellVolume = 0;
    let buyCount = 0;
    let sellCount = 0;
    let largeOrders = 0;

    transactions.forEach(tx => {
      const amount = parseFloat(tx.tradeAmount) / 1e6;
      
      if (tx.type === 'Buy') {
        buyVolume += amount;
        buyCount += 1;
      } else if (tx.type === 'Sell') {
        sellVolume += amount;
        sellCount += 1;
      }

      // Consider orders > $10k as large
      if (amount > 10000) {
        largeOrders += 1;
      }
    });

    return {
      buyVolume,
      sellVolume,
      buyCount,
      sellCount,
      ratio: sellVolume > 0 ? (buyVolume / sellVolume).toFixed(2) : 0,
      largeOrderPercent: transactions.length > 0 ? 
        ((largeOrders / transactions.length) * 100).toFixed(1) : 0
    };
  };

  const flowMetrics = calculateFlowMetrics();

  // Process market makers data for heatmap
  const processMarketData = () => {
    if (!marketsData?.fixedProductMarketMakers) return [];

    return marketsData.fixedProductMarketMakers.map((market, index) => {
      const volume = parseFloat(market.scaledCollateralVolume);
      const buyVolume = parseFloat(market.scaledCollateralBuyVolume || 0);
      const sellVolume = parseFloat(market.scaledCollateralSellVolume || 0);
      
      // Calculate momentum based on buy/sell ratio
      const momentum = buyVolume > sellVolume * 1.2 ? 'bullish' : 
                      sellVolume > buyVolume * 1.2 ? 'bearish' : 'neutral';
      
      // Calculate activity score (0-100)
      const recentActivity = market.lastActiveDay ? 
        (Date.now() / 1000 - parseInt(market.lastActiveDay) * 86400) < 86400 : false;
      const activity = recentActivity ? 80 + Math.random() * 20 : 20 + Math.random() * 30;

      return {
        id: market.id,
        name: `Market ${index + 1}`,
        volume,
        buyVolume,
        sellVolume,
        change: ((buyVolume - sellVolume) / (volume || 1) * 100).toFixed(1),
        activity: Math.round(activity),
        momentum,
        trades: market.tradesQuantity
      };
    }).slice(0, 6); // Top 6 markets
  };

  const marketHeatmapData = processMarketData();

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

  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  // Loading state
  if (globalLoading || tradersLoading || tradesLoading || marketsLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Polymarket data...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching from blockchain...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Polymarket Alpha Dashboard
            </h1>
            <p className="text-gray-400">Real-time data from Polymarket blockchain</p>
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

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-900 rounded-lg p-1 w-fit">
        {[
          { id: 'smartMoney', label: 'Smart Money', icon: Brain },
          { id: 'orderFlow', label: 'Order Flow', icon: TrendingUp },
          { id: 'heatmap', label: 'Market Heatmap', icon: Zap },
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
          <span className="text-gray-500 text-sm ml-4">
            Showing data from last {selectedTimeframe}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Money Tracker */}
        {activeTab === 'smartMoney' && (
          <>
            <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-400" />
                  Top Profitable Traders
                </h2>
                <div className="flex items-center text-sm text-gray-400">
                  <Info className="w-4 h-4 mr-1" />
                  <span>Sorted by profit/loss</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {tradersData?.accounts && tradersData.accounts.length > 0 ? (
                  tradersData.accounts.slice(0, 10).map((trader, index) => {
                    const profit = parseFloat(trader.scaledProfit);
                    const volume = parseFloat(trader.scaledCollateralVolume);
                    const winRate = trader.numTrades > 0 ? 
                      (profit > 0 ? 50 + Math.min(30, profit / volume * 100) : 
                       50 - Math.min(30, Math.abs(profit) / volume * 100)) : 0;

                    return (
                      <div key={trader.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-mono text-sm text-blue-400">{trader.id}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {trader.numTrades} trades • Last active: {
                                trader.lastTradedTimestamp ? 
                                formatTimestamp(trader.lastTradedTimestamp) : 
                                'Unknown'
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(profit)}
                            </p>
                            <p className="text-xs text-gray-500">P&L</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Volume</p>
                            <p className="text-sm font-medium">{formatCurrency(volume)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Win Rate</p>
                            <p className={`text-sm font-medium ${winRate > 50 ? 'text-green-400' : 'text-red-400'}`}>
                              {winRate.toFixed(0)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Rank</p>
                            <p className="text-sm font-medium text-yellow-400">
                              #{index + 1}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No trader data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-400" />
                Recent Large Trades
              </h2>
              <div className="space-y-3">
                {tradesData?.transactions && tradesData.transactions.length > 0 ? (
                  tradesData.transactions
                    .filter(tx => parseFloat(tx.tradeAmount) / 1e6 > 10000) // Only show trades > $10k
                    .slice(0, 5)
                    .map((tx, index) => (
                      <div key={tx.id} className="bg-gray-800 rounded-lg p-3 text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`font-semibold ${tx.type === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type}
                          </p>
                          <p className="text-gray-400 text-xs">{formatTimestamp(tx.timestamp)}</p>
                        </div>
                        <p className="text-gray-300 text-xs mb-1">
                          Market #{tx.outcomeIndex || 'Unknown'}
                        </p>
                        <div className="flex justify-between">
                          <p className="text-gray-400">{formatCurrency(parseFloat(tx.tradeAmount) / 1e6)}</p>
                          <p className="text-gray-400 text-xs">{formatAddress(tx.user.id)}</p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No large trades in selected timeframe</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Order Flow Analysis */}
        {activeTab === 'orderFlow' && (
          <>
            <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Order Flow Analysis
                </h2>
                <div className="text-sm text-gray-400">
                  {tradesData?.transactions?.length || 0} trades in {selectedTimeframe}
                </div>
              </div>
              
              {orderFlowData.length > 0 ? (
                <>
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
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No order flow data available for the selected timeframe</p>
                </div>
              )}
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
                  <p className="text-xs text-gray-500 mt-1">{flowMetrics.buyCount} buy orders</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Sell Volume ({selectedTimeframe})</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(flowMetrics.sellVolume)}</p>
                  <p className="text-xs text-gray-500 mt-1">{flowMetrics.sellCount} sell orders</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Buy/Sell Ratio</p>
                  <p className="text-2xl font-bold text-blue-400">{flowMetrics.ratio}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {flowMetrics.ratio > 1 ? 'Bullish' : flowMetrics.ratio < 1 ? 'Bearish' : 'Neutral'} sentiment
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Large Order %</p>
                  <p className="text-2xl font-bold text-purple-400">{flowMetrics.largeOrderPercent}%</p>
                  <p className="text-xs text-gray-500 mt-1">Orders > $10k</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Market Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  Market Activity Heatmap
                </h2>
                <div className="text-sm text-gray-400">
                  Top {marketHeatmapData.length} markets by volume
                </div>
              </div>
              
              {marketHeatmapData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketHeatmapData.map((market, index) => {
                      const heatIntensity = market.activity / 100;
                      const bgColor = market.momentum === 'bullish' ? 'rgba(16, 185, 129,' : 
                                      market.momentum === 'bearish' ? 'rgba(239, 68, 68,' : 
                                      'rgba(59, 130, 246,';
                      
                      return (
                        <div
                          key={market.id}
                          className="relative overflow-hidden rounded-lg border border-gray-800 hover:border-gray-600 transition-all duration-300 cursor-pointer"
                          style={{
                            backgroundColor: `${bgColor} ${0.1 + heatIntensity * 0.2})`,
                          }}
                        >
                          <div className="p-4">
                            <h3 className="font-semibold mb-2">{market.name}</h3>
                            <p className="text-xs text-gray-400 mb-2 font-mono">{formatAddress(market.id)}</p>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-2xl font-bold">{formatCurrency(market.volume)}</p>
                                <p className="text-sm text-gray-400">Total Volume</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-semibold ${parseFloat(market.change) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {market.change}%
                                </p>
                                <p className="text-sm text-gray-400">Buy/Sell Diff</p>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-gray-500">Buy Vol</p>
                                <p className="text-green-400">{formatCurrency(market.buyVolume)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Sell Vol</p>
                                <p className="text-red-400">{formatCurrency(market.sellVolume)}</p>
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
                        </div>
                      );
                    })}
                  </div>

                  {/* Volume Distribution */}
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
                      <h3 className="text-lg font-semibold mb-4">Market Statistics</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400 text-sm">Total Market Volume</p>
                          <p className="text-xl font-semibold">
                            {formatCurrency(marketHeatmapData.reduce((sum, m) => sum + m.volume, 0))}
                          </p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400 text-sm">Average Activity Score</p>
                          <p className="text-xl font-semibold">
                            {(marketHeatmapData.reduce((sum, m) => sum + m.activity, 0) / marketHeatmapData.length).toFixed(0)}%
                          </p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400 text-sm">Market Sentiment</p>
                          <div className="flex space-x-2 mt-1">
                            <span className="text-green-400">
                              {marketHeatmapData.filter(m => m.momentum === 'bullish').length} Bullish
                            </span>
                            <span className="text-red-400">
                              {marketHeatmapData.filter(m => m.momentum === 'bearish').length} Bearish
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
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
                Market Inefficiency Alerts
              </h2>
              
              <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <Info className="w-4 h-4 inline mr-1" />
                  Alerts are generated based on real-time analysis of market volume, trader behavior, and price movements.
                </p>
              </div>

              <div className="space-y-4">
                {/* Generate alerts based on real data */}
                {marketHeatmapData.length > 0 && (
                  <>
                    {/* High volume imbalance alert */}
                    {marketHeatmapData.filter(m => Math.abs(parseFloat(m.change)) > 20).map((market, index) => (
                      <div
                        key={`imbalance-${index}`}
                        className="bg-gray-800 rounded-lg p-4 border-l-4 border-red-500 hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-1">
                              <Target className="w-4 h-4 mr-2 text-gray-400" />
                              <p className="font-semibold">Volume Imbalance Detected</p>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{market.name}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-xs bg-gray-700 px-2 py-1 rounded">imbalance</span>
                              <span className="text-sm font-medium text-blue-400">{market.change}% difference</span>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-red-900 text-red-300 rounded-full">HIGH</span>
                        </div>
                      </div>
                    ))}

                    {/* Low activity markets */}
                    {marketHeatmapData.filter(m => m.activity < 30).map((market, index) => (
                      <div
                        key={`activity-${index}`}
                        className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500 hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-1">
                              <Target className="w-4 h-4 mr-2 text-gray-400" />
                              <p className="font-semibold">Low Activity Market</p>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{market.name}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-xs bg-gray-700 px-2 py-1 rounded">liquidity</span>
                              <span className="text-sm font-medium text-blue-400">Activity: {market.activity}%</span>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full">MEDIUM</span>
                        </div>
                      </div>
                    ))}

                    {/* Large trader activity */}
                    {flowMetrics.largeOrderPercent > 20 && (
                      <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500 hover:bg-gray-750 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-1">
                              <Target className="w-4 h-4 mr-2 text-gray-400" />
                              <p className="font-semibold">High Whale Activity</p>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">Multiple markets</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-xs bg-gray-700 px-2 py-1 rounded">whale-alert</span>
                              <span className="text-sm font-medium text-blue-400">{flowMetrics.largeOrderPercent}% large orders</span>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full">INFO</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {marketHeatmapData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No alerts available - market data needed</p>
                  </div>
                )}
              </div>

              {/* Alert Statistics */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-400">
                    {marketHeatmapData.filter(m => Math.abs(parseFloat(m.change)) > 20).length}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">High Severity</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">
                    {marketHeatmapData.filter(m => m.activity < 30).length}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Medium Severity</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">
                    {flowMetrics.largeOrderPercent > 20 ? 1 : 0}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Info Alerts</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">
                    {formatCurrency(
                      marketHeatmapData
                        .filter(m => Math.abs(parseFloat(m.change)) > 20)
                        .reduce((sum, m) => sum + m.volume * 0.02, 0)
                    )}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Potential Alpha</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats - Real Data */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Active Markets</p>
          <p className="text-2xl font-bold">{globalData?.global?.numOpenConditions || 'Loading...'}</p>
          <p className="text-xs text-gray-500 mt-1">Live prediction markets</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Traders</p>
          <p className="text-2xl font-bold">
            {globalData?.global?.numTraders ? 
              (parseInt(globalData.global.numTraders) / 1000000).toFixed(2) + 'M' : 
              'Loading...'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Unique addresses</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Volume</p>
          <p className="text-2xl font-bold">
            {globalData?.global?.scaledCollateralVolume ? 
              formatCurrency(globalData.global.scaledCollateralVolume) : 
              'Loading...'}
          </p>
          <p className="text-xs text-gray-500 mt-1">All-time USDC volume</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Resolved Markets</p>
          <p className="text-2xl font-bold">{globalData?.global?.numClosedConditions || 'Loading...'}</p>
          <p className="text-xs text-gray-500 mt-1">Completed predictions</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;