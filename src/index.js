import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';

// Configure Apollo Client for The Graph
const httpLink = createHttpLink({
  uri: 'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/QmdyCguLEisTtQFveEkvMhTH7UzjyhnrF9kpvhYeG4QX8a',
  fetch: (...args) => fetch(...args),
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          global: {
            merge: true,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

// Test the connection
client.query({
  query: `
    query TestConnection {
      global(id: "") {
        id
      }
    }
  `
}).then(result => {
  console.log('GraphQL connection successful:', result);
}).catch(error => {
  console.error('GraphQL connection error:', error);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);