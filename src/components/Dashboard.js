import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Activity, DollarSign, Brain, AlertTriangle, Zap, Target, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { GET_TOP_TRADERS, GET_MARKETS, GET_ORDER_FLOW } from '../queries/polymarketQueries';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('smartMoney');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Calculate timestamp for order flow query based on timeframe
  const getStartTimestamp = () => {
    const now = Date.now();
    const timeframeHours = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720
    };
    return Math.floor((now - timeframeHours[selectedTimeframe] * 3600000) / 1000).toString();
  };

  // Query for top traders
  const { data: tradersData, loading: tradersLoading, refetch: refetchTraders } = useQuery(GET_TOP_TRADERS, {
    variables: {
      first: 10,
      orderBy: 'netProfit',
      orderDirection: 'desc'
    }
  });

  // Query for markets
  const { data: marketsData, loading: marketsLoading, refetch: refetchMarkets } = useQuery(GET_MARKETS, {
    variables: {
      first: 10,
      orderBy: 'volume',
      orderDirection: 'desc'
    }
  });

  // Query for order flow
  const { data: orderFlowData, loading: orderFlowLoading, refetch: refetchOrderFlow } = useQuery(GET_ORDER_FLOW, {
    variables: {
      first: 100,
      startTime: getStartTimestamp()
    }
  });

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

  const formatTimestamp = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleTimeString();
  };

  // Process order flow data for charts
  const processOrderFlowData = () => {
    if (!orderFlowData?.orderFilleds) return [];
    
    // Group by time periods
    const periods = selectedTimeframe === '1h' ? 6 : 
                   selectedTimeframe === '24h' ? 8 : 
                   selectedTimeframe === '7d' ? 7 : 30;
    
    const timeGroups = [];
    const now = Date.now();
    const periodLength = (parseInt(getStartTimestamp()) * 1000) / periods;
    
    for (let i = 0; i < periods; i++) {
      const periodStart = now - (periods - i) * periodLength;
      const periodEnd = periodStart + periodLength;
      
      const periodOrders = orderFlowData.orderFilleds.filter(order => {
        const orderTime = parseInt(order.timestamp) * 1000;
        return orderTime >= periodStart && orderTime < periodEnd;
      });
      
      const buys = periodOrders.filter(o => o.isBuy).reduce((sum, o) => sum + parseFloat(o.takerAmountFilled), 0);
      const sells = periodOrders.filter(o => !o.isBuy).reduce((sum, o) => sum + parseFloat(o.takerAmountFilled), 0);
      
      timeGroups.push({
        time: i,
        buys,
        sells,
        netFlow: buys - sells
      });
    }
    
    return timeGroups;
  };

  const handleRefresh = () => {
    refetchTraders();
    refetchMarkets();
    refetchOrderFlow();
  };

  const isLoading = tradersLoading || marketsLoading || orderFlowLoading;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Polymarket Alpha Dashboard
            </h1>
            <p className="text-gray-400">Real-time market data from The Graph Protocol</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
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
              
              {tradersLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {tradersData?.accounts?.map((trader, index) => (
                    <div key={trader.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-mono text-sm text-blue-400">{trader.id}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {trader.tradesCount} trades • Last: {formatTimestamp(trader.lastTradeTimestamp)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${trader.netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency(trader.netProfit)}
                          </p>
                          <p className="text-xs text-gray-500">Net P&L</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-500">Volume</p>
                          <p className="text-sm font-medium">{formatCurrency(trader.totalVolume)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Win Rate</p>
                          <p className="text-sm font-medium text-blue-400">
                            {trader.totalProfit > 0 ? 
                              Math.round((trader.totalProfit / (trader.totalProfit + trader.totalLoss)) * 100) : 0}%
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
              )}
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-400" />
                Trading Insights
              </h2>
              {tradersData && (
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Volume</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {formatCurrency(tradersData.accounts.reduce((sum, t) => sum + parseFloat(t.totalVolume), 0))}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Net P&L</p>
                    <p className={`text-2xl font-bold ${
                      tradersData.accounts.reduce((sum, t) => sum + parseFloat(t.netProfit), 0) > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(tradersData.accounts.reduce((sum, t) => sum + parseFloat(t.netProfit), 0))}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Trades</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {tradersData.accounts.reduce((sum, t) => sum + parseInt(t.tradesCount), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
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
              
              {/* Timeframe Selector */}
              <div className="mb-4 flex space-x-2">
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
              
              {orderFlowLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={processOrderFlowData()}>
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
                      <BarChart data={processOrderFlowData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#9ca3af' }}
                          formatter={(value) => [formatCurrency(value), 'Net Flow']}
                        />
                        <Bar dataKey="netFlow">
                          {processOrderFlowData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.netFlow > 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
                Recent Large Orders
              </h2>
              {orderFlowData && (
                <div className="space-y-3">
                  {orderFlowData.orderFilleds
                    .filter(order => parseFloat(order.takerAmountFilled) > 10000)
                    .slice(0, 5)
                    .map((order) => (
                      <div key={order.id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`text-sm font-semibold ${order.isBuy ? 'text-green-400' : 'text-red-400'}`}>
                              {order.isBuy ? 'BUY' : 'SELL'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimestamp(order.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            {formatCurrency(order.takerAmountFilled)}
                          </p>
                        </div>
                        {order.condition?.question && (
                          <p className="text-xs text-gray-400 mt-2 truncate">
                            {order.condition.question}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Live Markets */}
        {activeTab === 'markets' && (
          <div className="lg:col-span-3">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Top Markets by Volume
              </h2>
              
              {marketsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketsData?.conditions?.map((market) => (
                    <div
                      key={market.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      <h3 className="font-semibold mb-3 text-sm">{market.question || 'Unnamed Market'}</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Volume 24h</p>
                          <p className="text-lg font-bold">{formatCurrency(market.volume)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Trades</p>
                          <p className="text-lg font-bold">{market.tradesCount}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {market.prices && market.prices.length > 0 && (
                          <>
                            <div className="flex-1 bg-green-900/30 border border-green-800 rounded p-2">
                              <p className="text-xs text-gray-400">Yes</p>
                              <p className="text-lg font-semibold text-green-400">
                                {(parseFloat(market.prices[0]) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="flex-1 bg-red-900/30 border border-red-800 rounded p-2">
                              <p className="text-xs text-gray-400">No</p>
                              <p className="text-lg font-semibold text-red-400">
                                {((1 - parseFloat(market.prices[0])) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
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
                {/* High volume markets */}
                {marketsData?.conditions?.filter(m => parseFloat(m.volume) > 2000000).map((market) => (
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
                {marketsData?.conditions?.filter(m => {
                  const price = m.prices?.[0] ? parseFloat(m.prices[0]) : 0.5;
                  return price > 0.8 || price < 0.2;
                }).map((market) => (
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
                            Yes: {(parseFloat(market.prices[0]) * 100).toFixed(1)}%
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
    </div>
  );
};

export default Dashboard;