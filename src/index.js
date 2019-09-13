import '@babel/polyfill'

import { GraphQLServer } from 'graphql-yoga'
import prisma from './prisma'
import { resolvers, fragmentReplacements } from './resolvers/index'


const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context({ request }) {
    return {
      prisma,
      request
    }
  },
  fragmentReplacements
})

server.start({ port: process.env.PORT || 4000 }, () => {
  console.log('The server is up http://localhost:4000 ')
})