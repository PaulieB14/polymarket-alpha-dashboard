import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Activity, DollarSign, Brain, AlertTriangle, Zap, Target, Eye } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_GLOBAL_STATS, GET_TOP_TRADERS, GET_RECENT_TRADES, GET_ORDER_FLOW, GET_MARKET_CONDITIONS, GET_WHALE_ACTIVITY } from '../queries/polymarketQueries';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('smartMoney');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  
  // Calculate timestamp for order flow query based on selected timeframe
  const getTimestampForTimeframe = () => {
    const now = Math.floor(Date.now() / 1000);
    switch (selectedTimeframe) {
      case '1h': return now - 3600;
      case '7d': return now - 604800;
      case '30d': return now - 2592000;
      case '24h':
      default: return now - 86400;
    }
  };
  
  // GraphQL queries with error handling
  const { loading: globalLoading, error: globalError, data: globalData, refetch: refetchGlobal } = 
    useQuery(GET_GLOBAL_STATS, { 
      notifyOnNetworkStatusChange: true,
      onError: (error) => console.error("Global stats query error:", error)
    });
    
  const { loading: tradersLoading, error: tradersError, data: tradersData, refetch: refetchTraders } = 
    useQuery(GET_TOP_TRADERS, { 
      notifyOnNetworkStatusChange: true,
      onError: (error) => console.error("Top traders query error:", error)
    });
    
  const { loading: tradesLoading, error: tradesError, data: tradesData, refetch: refetchTrades } = 
    useQuery(GET_RECENT_TRADES, { 
      notifyOnNetworkStatusChange: true,
      onError: (error) => console.error("Recent trades query error:", error)
    });
    
  const { loading: orderFlowLoading, error: orderFlowError, data: orderFlowData, refetch: refetchOrderFlow } = 
    useQuery(GET_ORDER_FLOW, { 
      variables: { timestamp: getTimestampForTimeframe().toString() },
      notifyOnNetworkStatusChange: true,
      skip: activeTab !== 'orderFlow',
      onError: (error) => console.error("Order flow query error:", error)
    });
    
  const { loading: marketsLoading, error: marketsError, data: marketsData, refetch: refetchMarkets } = 
    useQuery(GET_MARKET_CONDITIONS, { 
      notifyOnNetworkStatusChange: true,
      skip: activeTab !== 'heatmap',
      onError: (error) => console.error("Market conditions query error:", error)
    });
    
  const { loading: whaleLoading, error: whaleError, data: whaleData, refetch: refetchWhale } = 
    useQuery(GET_WHALE_ACTIVITY, { 
      notifyOnNetworkStatusChange: true,
      skip: activeTab !== 'smartMoney',
      onError: (error) => console.error("Whale activity query error:", error)
    });

  // Log data for debugging
  useEffect(() => {
    console.log("Global data:", globalData);
    console.log("Traders data:", tradersData);
    console.log("Trades data:", tradesData);
    console.log("Order flow data:", orderFlowData);
    console.log("Markets data:", marketsData);
    console.log("Whale data:", whaleData);
  }, [globalData, tradersData, tradesData, orderFlowData, marketsData, whaleData]);
  
  
  // Refresh data when timeframe changes
  useEffect(() => {
    if (activeTab === 'orderFlow') {
      refetchOrderFlow({ timestamp: getTimestampForTimeframe().toString() });
    }
  }, [selectedTimeframe, activeTab, refetchOrderFlow, getTimestampForTimeframe]);
  
  // Calculate win rate for traders using real data
  const calculateWinRate = (trader) => {
    if (!trader.numTrades || trader.numTrades === 0) return null;
    // Use trader.winCount if available, otherwise don't calculate
    return trader.winCount ? Math.round((trader.winCount / trader.numTrades) * 100) : null;
  };
  
  // Format timestamp to readable date
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleString();
  };

  // Process data from GraphQL queries - no fallback to mock data
  const smartMoneyData = tradersData?.accounts?.map(trader => ({
    ...trader,
    winRate: calculateWinRate(trader)
  })) || [];

  // Process order flow data from GraphQL query - no fallback to mock data
  const orderFlowChartData = orderFlowData?.transactions ? 
    // Group transactions by hour and calculate buys/sells
    Array.from(Array(6).keys()).map(hour => {
      const hourTransactions = orderFlowData.transactions.filter(tx => {
        const txDate = new Date(parseInt(tx.timestamp) * 1000);
        return Math.floor(txDate.getHours() / 4) === hour;
      });
      
      const buys = hourTransactions
        .filter(tx => tx.type === 'Buy')
        .reduce((sum, tx) => sum + parseInt(tx.tradeAmount || 0), 0);
        
      const sells = hourTransactions
        .filter(tx => tx.type === 'Sell')
        .reduce((sum, tx) => sum + parseInt(tx.tradeAmount || 0), 0);
        
      return {
        time: `${(hour * 4).toString().padStart(2, '0')}:00`,
        buys,
        sells,
        netFlow: buys - sells
      };
    }) : [];

  // Process market data from GraphQL query - no fallback to mock data
  const processedMarketData = marketsData?.markets ? 
    marketsData.markets.map(market => {
      const volume = market.volume || 0;
      const change = market.change24h || 0;
      const activity = market.activity || 0;
      const momentum = change > 10 ? 'bullish' : change < -10 ? 'bearish' : 'neutral';
      
      return {
        id: market.id,
        name: market.name || `Market #${market.id.substring(0, 6)}`,
        volume: parseInt(volume),
        change,
        activity,
        momentum
      };
    }).slice(0, 5) : [];

  // Get inefficiency alerts from GraphQL query - no fallback to mock data
  const generatedAlerts = marketsData?.alerts || [];

  // Process whale activity from GraphQL query - no fallback to mock data
  const processedWhaleActivity = tradesData?.enrichedOrderFilleds ? 
    tradesData.enrichedOrderFilleds.map(trade => ({
      timestamp: formatTimestamp(trade.timestamp),
      maker: trade.maker,
      taker: trade.taker,
      side: trade.side,
      market: trade.market,
      size: trade.size ? parseInt(trade.size) : null,
      price: trade.price ? parseFloat(trade.price) : null
    })).filter(trade => trade.side && trade.size && trade.price) : [];

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
    return address; // Show full wallet address
  };

  // Check for errors
  const hasErrors = globalError || tradersError || tradesError || orderFlowError || marketsError || whaleError;
  
  // Show loading state
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
  
  // Show error state
  if (hasErrors) {
    console.error("GraphQL Errors:", { 
      globalError, tradersError, tradesError, orderFlowError, marketsError, whaleError 
    });
    
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4">Data Loading Error</h2>
          <p className="text-gray-400 mb-4">
            We're having trouble connecting to the Polymarket data API. This could be due to network issues or API rate limits.
          </p>
          <p className="text-gray-500 text-sm">
            Check the browser console for detailed error information.
          </p>
          <button 
            onClick={() => {
              // Refetch all queries
              refetchGlobal();
              refetchTraders();
              refetchTrades();
              if (activeTab === 'orderFlow') refetchOrderFlow();
              if (activeTab === 'heatmap') refetchMarkets();
              if (activeTab === 'smartMoney') refetchWhale();
            }}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Try Again
          </button>
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
                {smartMoneyData.map((trader, index) => (
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
                        <p className={`text-sm font-medium ${trader.winRate > 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.winRate || 'N/A'}%
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
                ))}
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-400" />
                Recent Whale Activity
              </h2>
              <div className="space-y-3">
                {processedWhaleActivity.map((activity, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <p className={`font-semibold ${activity.side === 'Buy' ? 'text-green-400' : 'text-red-400'}`}>
                        {activity.side}
                      </p>
                      <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                    </div>
                    <p className="text-gray-300 text-xs mb-1">Market #{activity.market?.id || 'Unknown'}</p>
                    <div className="flex justify-between">
                      <p className="text-gray-400">{formatCurrency(activity.size)}</p>
                      <p className="text-gray-400">@ {activity.price}</p>
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
                <AreaChart data={orderFlowChartData}>
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
                  <BarChart data={orderFlowChartData}>
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
                {orderFlowData?.metrics ? (
                  <>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">24h Buy Volume</p>
                      <p className="text-2xl font-bold text-green-400">{formatCurrency(orderFlowData.metrics.buyVolume || 0)}</p>
                      <p className="text-xs text-gray-500 mt-1">{orderFlowData.metrics.buyVolumeChange > 0 ? '+' : ''}{orderFlowData.metrics.buyVolumeChange || 0}% from avg</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">24h Sell Volume</p>
                      <p className="text-2xl font-bold text-red-400">{formatCurrency(orderFlowData.metrics.sellVolume || 0)}</p>
                      <p className="text-xs text-gray-500 mt-1">{orderFlowData.metrics.sellVolumeChange > 0 ? '+' : ''}{orderFlowData.metrics.sellVolumeChange || 0}% from avg</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Buy/Sell Ratio</p>
                      <p className="text-2xl font-bold text-blue-400">{orderFlowData.metrics.buySellRatio || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">{parseFloat(orderFlowData.metrics.buySellRatio || 0) > 1 ? 'Bullish' : 'Bearish'} sentiment</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Large Order %</p>
                      <p className="text-2xl font-bold text-purple-400">{orderFlowData.metrics.largeOrderPercentage || 0}%</p>
                      <p className="text-xs text-gray-500 mt-1">Smart money active</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No flow metrics data available</p>
                  </div>
                )}
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
                {processedMarketData.map((market, index) => {
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
                        data={processedMarketData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="volume"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {processedMarketData.map((entry, index) => (
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
                    <RadarChart data={processedMarketData}>
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
                {generatedAlerts.map((alert) => (
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
              {marketsData?.alertStats ? (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-400">{marketsData.alertStats.highSeverity || 0}</p>
                    <p className="text-sm text-gray-400 mt-1">High Severity</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-400">{marketsData.alertStats.mediumSeverity || 0}</p>
                    <p className="text-sm text-gray-400 mt-1">Medium Severity</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{marketsData.alertStats.lowSeverity || 0}</p>
                    <p className="text-sm text-gray-400 mt-1">Low Severity</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-purple-400">{marketsData.alertStats.potentialAlpha ? formatCurrency(marketsData.alertStats.potentialAlpha) : ''}</p>
                    <p className="text-sm text-gray-400 mt-1">Potential Alpha</p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 text-center py-8 text-gray-500">
                  <p>No alert statistics available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Active Markets</p>
          <p className="text-2xl font-bold">{globalData?.global?.numOpenConditions}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Traders</p>
          <p className="text-2xl font-bold">{globalData?.global?.numTraders ? (parseInt(globalData.global.numTraders) / 1000000).toFixed(2) + 'M' : ''}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">24h Volume</p>
          <p className="text-2xl font-bold">{globalData?.global?.volume24h ? formatCurrency(globalData.global.volume24h) : ''}</p>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Resolved Markets</p>
          <p className="text-2xl font-bold">{globalData?.global?.numClosedConditions}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
