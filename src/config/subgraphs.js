// Polymarket Subgraph Deployment IDs
export const SUBGRAPH_DEPLOYMENTS = {
  // Main Polymarket subgraph with comprehensive data
  MAIN: 'QmdyCguLEisTtQFveEkvMhTH7UzjyhnrF9kpvhYeG4QX8a',
  
  // Profit and Loss tracking
  PROFIT_LOSS: 'QmZAYiMeZiWC7ZjdWepek7hy1jbcW3ngimBF9kpvhYeG4QX8a',
  
  // Activity on Polygon
  ACTIVITY_POLYGON: 'Qmf3qPUsfQ8et6E3QNBmuXXKqUJi91mo5zbsaTkQrSnMAP',
  
  // Open Interest tracking
  OPEN_INTEREST: 'QmbxydtB3MF2yNriAHhsrBmqTx44aaw44jjNFwZNWaW7R6',
  
  // Order filled events
  ORDER_FILLED_EVENTS: 'Qma5ngHGmgW8qea4nEXmFjNtJb9aXDwV75hWekpTKD1fYf'
};

// GraphQL endpoints
export const GRAPH_ENDPOINTS = {
  HOSTED_SERVICE: 'https://api.thegraph.com/subgraphs/id/',
  DECENTRALIZED: 'https://gateway.thegraph.com/api/[api-key]/subgraphs/id/'
};

// Helper function to get full subgraph URL
export const getSubgraphUrl = (deploymentId, apiKey = null) => {
  if (apiKey) {
    return `${GRAPH_ENDPOINTS.DECENTRALIZED.replace('[api-key]', apiKey)}${deploymentId}`;
  }
  return `${GRAPH_ENDPOINTS.HOSTED_SERVICE}${deploymentId}`;
};