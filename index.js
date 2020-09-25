const { ApolloServer, gql } = require('apollo-server');
const { ApolloGateway } = require('@apollo/gateway');
const { buildFederatedSchema } = require('@apollo/federation');

const fooServer = new ApolloServer({
  schema: buildFederatedSchema([{
    typeDefs: gql`
      type Query {
        foo: String
      }
    `,
    resolvers: {
      Query: {
        foo() {
          throw new Error("💥");
        }
      }
    }
  }])
});

const barServer = new ApolloServer({
  schema: buildFederatedSchema([{
    typeDefs: gql`
      type Query {
        bar: String
      }
    `,
    resolvers: {
      Query: {
        bar() {
          return "bar";
        }
      }
    }
  }])
});

const gatewayServer = new ApolloServer({
  gateway: new ApolloGateway({
    serviceList: [
      { name: 'foo', url: 'http://localhost:4001' },
      { name: 'bar', url: 'http://localhost:4002' }
    ],
  }),
  subscriptions: false,
});

const start = async (name, server, port) => {
  const { server: httpServer, url } = await server.listen({ port });
  console.info(`${name} listening at ${url}`);
  return httpServer;
};

const startAll = async() => {
  const foo = await start('foo', fooServer, 4001);
  await start('bar', barServer, 4002);
  await start('gateway', gatewayServer, 4000);
  setTimeout(() => {
    foo.close();
    console.info('foo stopped');
  }, 10000);
};

startAll();
