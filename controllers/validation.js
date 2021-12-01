const config = require('../config');
const Validator = require('jsonschema').Validator;



exports.checkPlanSample = () => async (req, res, next) => {
  const query = req.body;
  if(!query) {
    return res.status(400).send({
        error: "Candidate content can not be empty"
  });
  }


  if( query["objectId"] && query["planCostShares"] && query["votes"]  ){
    var v = new Validator();
    const planCostShares = {
      "deductible" : query["planCostShares"]["deductible"],
      "_org" : query["planCostShares"]["_org"],
      "copay" : query["planCostShares"]["copay"],
      "objectId" : query["planCostShares"]["objectId"],
      "objectType" : query["planCostShares"]["objectType"],
    }

    const linkedService = {
      "_org" : query["linkedPlanServices"]["_org"],
      "objectId" : query["linkedPlanServices"]["copay"],
      "objectType" : query["linkedPlanServices"]["objectId"],
      "name" : query["linkedPlanServices"]["objectType"],
    }

    const linkedPlanServices = {
      "deductible" : query["planCostShares"]["deductible"],
      "_org" : query["planCostShares"]["_org"],
      "copay" : query["planCostShares"]["copay"],
      "objectId" : query["planCostShares"]["objectId"],
      "objectType" : query["planCostShares"]["objectType"],
    }



    const plan = {
      "planCostShares" : planCostShares,
      '_org' : query["_org"],
      'objectId' : query["objectId"],
      'objectType' : query["objectType"],
      'planType' : query["planType"],
      'creationDate': query["creationDate"]
    }
    // Address, to be embedded on Person
    var addressSchema = {
      "id": "/SimpleAddress",
      "type": "object",
      "properties": {
        "lines": {
          "type": "array",
          "items": {"type": "string"}
        },
        "zip": {"type": "string"},
        "city": {"type": "string"},
        "country": {"type": "string"}
      },
      "required": ["country", "city", "zip", "lines"]
    };
     
    // Person
    var schema = {
      "id": "/SimplePerson",
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "address": {"$ref": "/SimpleAddress"},
        "votes": {"type": "integer", "minimum": 1}
      },
      "required": ["name", "address"]
    };

    v.addSchema(addressSchema, '/SimpleAddress');
    const validResult = v.validate(plan, schema);
    const validErrorCount = validResult.errors.length ;
    console.log(validResult.errors);
    if( validErrorCount !== 0){
      return res.status(400).send({ error: 'JSON SCHEMA is incorrect' }); 
    }
    next();
  }
  else{
    return res.status(400).send({ error: 'name, address, and votes parameter is required' });
  }
}


exports.checkPlan = () => async (req, res, next) => {
  const query = req.body;
  if(!query) {
    return res.status(400).send({
        error: "Candidate content can not be empty"
  });
  }


  if(  query["objectId"] && query["planCostShares"] && query["linkedPlanServices"] && 
       query["_org"] && query["objectType"] && query["planType"] &&  query["creationDate"]){
    next();
  }
  else{
    return res.status(400).send({ error: 'Missing Body Object' });
  }
}

exports.checkPlanPatch = () => async (req, res, next) => {
  const query = req.body;
  const validList = [ 'objectType',
  'planType',
  'planCostShares',
  'objectId',
  '_org',
  'linkedPlanServices',
  'creationDate' ]
  if(!query) {
    return res.status(400).send({
        error: "Candidate content can not be empty"
  });
  }


  const found = Object.keys(query).every(elem => validList.includes(elem))
  if( found){
    next();
  }
  else{
    return res.status(400).send({ error: 'Missing Body Object' });
  }
}