import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import mergedResolvers from "./resolvers/index";
import mergedTypeDefs from "./typeDefs";

const server = new ApolloServer({
  typeDefs: mergedResolvers,
  resolvers: mergedTypeDefs,
});

const { url } = await startStandaloneServer(server);

console.log(`Server ready at ${url}`);
