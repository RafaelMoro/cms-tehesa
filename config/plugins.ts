export default ({ env }) => ({
  graphql: {
    config: {
      defaultLimit: 25,
      maxLimit: 100,
      depthLimit: 7,
      apolloServer: {
        introspection: env.bool('GRAPHQL_INTROSPECTION', false),
      },
    },
  },
});
