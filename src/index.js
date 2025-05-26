import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Configure Apollo Client for The Graph
// Using the hosted service endpoint
const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/id/QmdyCguLEisTtQFveEkvMhTH7UzjyhnrF9kpvhYeG4QX8a',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);