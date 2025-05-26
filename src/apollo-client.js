import { ApolloClient, InMemoryCache } from '@apollo/client';

// Use your backend proxy URL
const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/graphql';

export const client = new ApolloClient({
  uri: PROXY_URL,
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export default client;