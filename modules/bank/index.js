const bank = require('../../lib/bank')
const {
    checkaccount: checkAccountSchema,
    auth: authSchema,
    fundingaccount:fundingAccountSchema,
    sendmail:sendMailSchema,
    refund: refundSchema
  } = require('./schemas')
    module.exports= async  function(fastify,opts) {
      fastify.post('/auth' , {schema: authSchema}, authHandler )
      fastify.post('/checkaccount' , {schema: checkAccountSchema}, checkAccountHandler )
      fastify.post('/fundingaccount' , {schema: fundingAccountSchema}, fundAccountHandler )
      fastify.post('/sendmail' , {schema: sendMailSchema}, sendMailHandler )
      fastify.post('/refund' , {schema: refundSchema}, refundHandler )

    }

module.exports[Symbol.for('plugin-meta')] = {
        decorators: {
          fastify: [
            // 'authPreHandler',
            'bankService'
            // 'jwt',
            // 'transformStringIntoObjectId'
          ]
        }
      }
  async function authHandler(req,reply) {
  try {
    const {email, password } = req.body
    const bankAuth = await bank.authenticateUser(email, password);
    console.log('bankAuth', bankAuth)
    return bankAuth.data.data;
  }catch(e) {
    throw reply.badRequest(e);
  }
  }
  async function checkAccountHandler(req,reply) {
    try {
      const {userId, currency, amount, token } = req.body;
      const bankAccountCheck = await bank.checkCCAccount(userId, currency, amount, token);
      console.log('bankAccountCheck', bankAccountCheck.data)
      return bankAccountCheck.data;
    }catch(e) {
      throw reply.badRequest(e);
    }
  }
  async function fundAccountHandler(req,reply) {
    try {
      const {userId, token } = req.body;
      const bankInfo = await bank.getFundingAccount(userId, token );
      console.log('bankInfo', bankInfo.data)

      return bankInfo.data;
    }catch(e) {
      throw reply.badRequest(e);
    }
  }

  async function sendMailHandler(req,reply) {
    try {
      const {transactionId, token } = req.body;
      const bankEmail = await bank.sendBankMail(transactionId, token );
      console.log('bankEmail', bankEmail.data)

      return bankEmail.data;
    }catch(e) {
      throw reply.badRequest(e);
    }
  }

  async function refundHandler(req,reply) {
    try {
      const refunds = await this.bankService.paystackRefund(req.body, reply)
      console.log('refunds', refunds);
      return {
        message : 'refund successful',
        refunds
      }
    }catch(e) {
      throw reply.badRequest(e);
    }
  }
