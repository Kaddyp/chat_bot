// import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// const client = new ApolloClient({
//   link: new HttpLink({
//     uri: 'http://localhost:4000/graphql',
//   }),
//   cache: new InMemoryCache(),
// });

// export default client;


// frontend/src/apolloClient.js

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const authLink = new ApolloLink((operation, forward) => {
  // Retrieve token from localStorage or wherever you store it
  const token = localStorage.getItem('token');
  
  // Set headers with authorization token
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }));

  return forward(operation);
});

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql', // Adjust with your backend URL
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;

