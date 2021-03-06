// Require the framework and instantiate it
//modules
require('dotenv').config()
const Bugsnag = require('@bugsnag/js')
Bugsnag.start({ apiKey: process.env.BUGSNAG_KEY })
const fp = require('fastify-plugin')
const RHEMITO_PORT = process.env.PORT|| 3000
const StaticService = require('./modules/static/service')
const AccessService = require('./modules/access/service')
const TransactionService = require('./modules/transaction/service')
const AccountService = require('./modules/account/service')
const BankService = require('./modules/bank/service')

// const staticModule = require('./modules/static');
const fastify = require('fastify')({ logger: true })
fastify.register(require('fastify-sensible'))
fastify.register(require('fastify-cors'), {
  // put your options here
  origin: '*'
})
const fastifyEnv = require('fastify-env')
//configure env files
const env_schema =  {
    type:'object',
    required: ['RHEMITO_URL', 'API_KEY', 'PRIVATE_KEY'],
    properties:{
        RHEMITO_URL:{
            type:'string',
            default: 'https://furpapitest.funtechcom.com/BusinessApi.svc/json/'
        },
        API_KEY:{
          type:'string',
        },
      PRIVATE_KEY:{
        type:'string',
          }
    }
}

 const envOptions = {
     configKey: 'config',
     schema: env_schema,
     dotenv:true

 }
fastify.register(fastifyEnv, envOptions)
.ready(envError => {
    if(envError) console.error('envError',envError)
})

/**
 *
 * add swagger
 */

fastify.register(require('fastify-swagger'), {
  exposeRoute: true,
  routePrefix: '/documentation',
  swagger: {
    info: {
      title: 'Test swagger',
      description: 'testing the fastify swagger api',
      version: '0.1.0'
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here'
    },
    host: 'localhost',
    schemes: ['http','https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'access', description: 'Access related end-points' },
      { name: 'static', description: 'Static related end-points' },
      { name: 'transaction', description: 'Transaction related end-points' },
      { name: 'account', description: 'Account related end-points' },
      { name: 'bank', description: 'Bank related end-points' }
    ],
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'apiKey',
        in: 'header'
      }
    }
  }
}).ready(err => {
  if (err) throw err
  fastify.swagger()
})
/**
 * decorate with serive
 */

async function decorateFastifyInstance(fastify, opts, next){
  const staticService = new StaticService();
  const accessService = new AccessService()
  const transactionService = new TransactionService()
  const accountService = new AccountService()
  const bankService = new BankService()
  fastify.decorate('staticService', staticService);
  fastify.decorate('accessService', accessService);
  fastify.decorate('transactionService', transactionService)
  fastify.decorate('accountService', accountService)
  fastify.decorate('bankService', bankService)
  next()
}
 /**
  * end docuration
  */
 fastify
 .register(fp(decorateFastifyInstance))
 .register(require('./modules/static'), {prefix:'/static'})
 .register(require('./modules/access'), {prefix:'/access'})
 .register(require('./modules/transaction'), {prefix:'/transaction'})
 .register(require('./modules/account'), {prefix:'/account'})
 .register(require('./modules/bank'), {prefix:'/bank'})
 // Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

fastify.addHook('onError', (request, reply, error, done) => {
  // Only send Bugsnag errors when not in development
  if (process.env.NODE_ENV !== 'development') {
    Bugsnag.notify(error)
  }
  done()
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(RHEMITO_PORT,'0.0.0.0')
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()