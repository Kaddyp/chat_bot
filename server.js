const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config()
const app = express();
app.use(express.json());


const secret = 'your_jwt_secret';
const corsOptions = {
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',   
    'preflightContinue': false
};
//app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.send('build/index.html');
});

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Message {
    id: ID!
    sender: User!
    receiver: User!
    content: String!
    createdAt: String!
  }

  type Query {
    me: User
    messages(receiverId: ID!): [Message]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    login(email: String!, password: String!): String
    sendMessage(receiverId: ID!, content: String!): Message
  }
`;

const resolvers = {
  Query: {
    me: async (_, __, { user, connection }) => {
      console.log(user);
      if (!user) throw new Error('Not authenticated');
      const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [user.id]);
      return rows[0];
    },
    messages: async (_, { receiverId }, { connection, user }) => {
      if (!user) throw new Error('Not authenticated');
      const [rows] = await connection.execute(
        'SELECT * FROM messages WHERE receiver_id = ? AND sender_id = ?',
        [receiverId, user.id]
      );
      return rows;
    },
  },
  Mutation: {
    register: async (_, { username, email, password }, { connection }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [rows] = await connection.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      return { id: rows.insertId, username, email };
    },
    login: async (_, { email, password }, { connection }) => {
      const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
      const user = rows[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
      }
      return jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
    },
    sendMessage: async (_, { receiverId, content }, { connection, user }) => {
      console.log(user);
      if (!user) throw new Error('Not authenticated');
      const [rows] = await connection.execute(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [user.id, receiverId, content]
      );
      const [messageRows] = await connection.execute(
        'SELECT * FROM messages WHERE id = ?',
        [rows.insertId]
      );
      return messageRows[0];
    },
  },
};

const startServer = async () => {
  //const app = express();
  const connection = await mysql.createConnection({ 
      host: process.env.DB_HOST || 'localhost',
      port: process.env.SERVER_PORT || '3307',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit : 10     
  });
  app.use(cors(corsOptions));
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      try {
        const user = jwt.verify(token, secret);
        return { user, connection };
      } catch {
        return { connection };
      }
    },
  });
  await server.start(); // Ensure server is started before applying middleware
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
