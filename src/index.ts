import { createConnection } from "typeorm";
import { User } from "./entities/User";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    host: "db-graphql-turorial.???????.us-west-2.rds.amazonaws.com",
    database: "graphql_tutorial",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [User],
  });

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("Server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
