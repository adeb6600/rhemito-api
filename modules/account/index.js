const {
    user: userSchema,
    createbeneficiary: createbeneficiarySchema,
    listbeneficiary: listbeneficiarySchema
    // search: searchSchema,
    // getProfile: getProfileSchema
  } = require('./schemas')
    module.exports= async  function(fastify,opts) { 
      fastify.post('/user' , {schema: userSchema}, userHandler )
      fastify.post('/createbeneficiary' , {schema: createbeneficiarySchema}, createbeneficiaryHandler )
      fastify.post('/beneficiaries' , {schema: listbeneficiarySchema}, listbeneficiaryHandler )
      // fastify.post('/updateuser' , {schema: providerSchema}, providerHandlers )
      // fastify.post('/updateuserpassword' , {schema: corridorsSchema}, corridorHandlers )
      // fastify.post('/dashboard' , {schema: corridorsSchema}, corridorHandlers )
    }
  
module.exports[Symbol.for('plugin-meta')] = {
        decorators: {
          fastify: [
            // 'authPreHandler',
            'accountService'
            // 'jwt',
            // 'transformStringIntoObjectId'
          ]
        }
      }
  async function userHandler(req,reply) {
  const  {uid,sessiontoken} = req.body
    const user =  await this.accountService.useraccount(sessiontoken,uid)
    return {
        message: user.ResponseMessage,
        uid: user.Uid,
        uno: user.Uno,
        lastloggedin : user.User.LastLoggedIn,
        firstname: user.User.FName,
        lastname:user.User.LName,
        email:user.User.Email,
        country:user.User.Country,
        postcode: user.User.Postcode,
        countrycode: user.User.CountryIso3,
        balances: user.User.Balances.map(b=>({
          currencycode:b.CurrencyCode,
          amount: b.Amount
        })),
        gender: user.User.Gender
    }   
  }

  async function createbeneficiaryHandler(req,reply) {
      const user =  await this.accountService.createBeneficiary(req.body)
      if(user.ResponseCode!='10000') {
        throw reply.badRequest(user.ResponseMessage)
      }
      return {
          message: user.ResponseMessage,
      }   
    }


  async function listbeneficiaryHandler(req,reply) {
    const user =  await this.accountService.listBeneficiary(req.body)
    if(user.ResponseCode!='10000') {
      throw reply.badRequest(user.ResponseMessage)
    }
    return {
        message: user.ResponseMessage,
        contacts: user.Contacts.map(c=>({
          id:c.ContactId,
          country:c.Country,
          countrycode: c.CountryIso3,
          datecreated:c.DateCreated,
          name:c.Name,
          service:c.Service,
          servicecode:c.ServiceCode
        }))
  }
}

