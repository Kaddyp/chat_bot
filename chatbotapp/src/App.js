import React, { useState } from 'react';
import { ApolloProvider, useMutation, useQuery, gql } from '@apollo/client';
import client from './apolloClient';

const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
      email
    }
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

const ME = gql`
  query Me {
    me {
      id
      username
      email
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($receiverId: ID!, $content: String!) {
    sendMessage(receiverId: $receiverId, content: $content) {
      id
      sender {
        id
        username
      }
      receiver {
        id
        username
      }
      content
      createdAt
    }
  }
`;

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register] = useMutation(REGISTER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ variables: { username, email, password } });
      alert('Registration successful');
    } catch (error) {
      console.error(error);
      alert('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login] = useMutation(LOGIN, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.login);
      window.location.reload();
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ variables: { email, password } });
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}

function Messages() {
  const { loading, error, data } = useQuery(ME);
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  //console.log(useQuery(ME));

  const handleSendMessage = async () => {
    try {
      await sendMessage({ variables: { receiverId, content } });
      alert('Message sent');
      setContent('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Message sending failed'); // Set error message state
    }
  };

  if (loading) return <p>Loading...</p>;
  //if (error) return <p>Error: {error.message}</p>;

 
  return (
    <div>
      <h2>Messages</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message if present */}
      <div>
        <input type="text" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Receiver ID" required />
        <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message" required />
        <button onClick={handleSendMessage}>Send Message</button>
      </div>
      <div>
        {/* Display messages */}
      </div>
    </div>
  );
}

function App() {
  const token = localStorage.getItem('token');
  console.log(token);
  return (
    <ApolloProvider client={client}>
      <div>
        {!token ? (
          <>
            <h2>Register</h2>
            <Register />
            <h2>Login</h2>
            <Login />
          </>
        ) : (
          <Messages />
        )}
      </div>
    </ApolloProvider>
  );
}

export default App;
