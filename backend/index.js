import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import { GraphQLLocalStrategy, buildContext } from "graphql-passport";

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";

import { connectDB } from "./db/connectDB.js";
import { configurePassport } from "./passport/passport.config.js";

dotenv.config();
configurePassport(); // initialize the passport

// get the root of our application
const __dirname = path.resolve();

// Required logic for integrating with Express
const app = express();

const httpServer = http.createServer(app);

// create session store
const MondoDBStore = connectMongo(session);

const store = new MondoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// for debug process
store.on("error", (err) => console.log(err));

// add session middleware, pass the session to the store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // this option specifies whether to save the session to the store on every request
    saveUninitialized: false, // option specifies whether to save unintiated sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true, // this option prevents the Cross-Site Scripting (XSS) attacks
    },
    store: store,
  })
);

// initialize passport
app.use(passport.initialize());
// initalize session for session management
app.use(passport.session());

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Ensure we wait for our server to start
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
  "/",
  cors({
    origin: "http://localhost:3000",
    // it allows us to send the cookies alongside the request
    credentials: true,
  }),
  express.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    // context: async ({ req }) => ({ token: req.headers.token }),
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

// Deploy - npm run build in frontend
// render.com => backend and frontend under the same domain name, localhost:4000
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

// Modified server startup
await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();

console.log(`🚀 Server ready at http://localhost:4000/`);
