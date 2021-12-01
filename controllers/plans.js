const client = require('../cache').connect();
const etag = require('etag')
const config = require('../config');
const jwt = require('jsonwebtoken');
const elasticsearch = require('elasticsearch');
const { patch } = require('request');

const clientES = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.2', // use the same version of your Elasticsearch instance
})

exports.createES = async (req, res) => {
// callback API
    const plan = {
        'planCostShares' : JSON.stringify(request.planCostShares),
        'linkedPlanServices' : JSON.stringify(request.linkedPlanServices),
        '_org' : request._org,
        'objectId' : request.objectId,
        'objectType' : request.objectType,
        'planType' : request.planType,
        'creationDate': request.creationDate,
    };

    clientES.index({
        index: 'plan',
        body: plan
    })
    .then(response => {
        return res.status(200).json({"message": "Indexing successful"})
    })
    .catch(err => {
        return res.status(500).json({"message": "Error"})
    })
}

exports.getES = async (req, res) => {
    const searchText = req.query.text
    clientES.search({
        index: "plan",
        body: {
            query: {
                match: {"objectId": searchText.trim()}
            }
        }
    })
    .then(response => {
        return res.status(200).json(response)
    })
    .catch(err => {
        return res.status(500).json({"message": "Error"})
    })
}

exports.getToken = async (req, res) => {
    const { email, password } = req.body
    // Validate user input
    if (!(email && password)) {
        return res.status(400).send( { error: "email and password is required"} );
    }
  
    const token = jwt.sign(
        { password:password, email: email },
        config.TOKEN_KEY,
        { expiresIn: "1h"},
        { algorithm: 'RS256' }
      );
    return res.status(200).send({ success: token });
}


exports.getPlanById = async (req, res) => {
    // get data from cache
    const planId = req.params.objectId ;

    client.hgetall(planId, function(err, results) {
        if (err) {
            console.log(err);
            return res.status(500).send({message: "Cache is broken"});
            // do something like callback(err) or whatever
        } else {
           // do something with results
           if(results===null){
            return res.status(404).send({error:"No object Id found"});
           }
           results['planCostShares'] = JSON.parse(results['planCostShares']);
           results['linkedPlanServices'] = JSON.parse(results['linkedPlanServices']);
           // results['ETag'] = JSON.parse(results['ETag']);
           if( results['ETag'] === req.headers["if-none-match"] ){
                return res.status(304).send();
           }
           else{
            return res.status(200).send({ plan: results });
           }
        }
    });
    
}


exports.createPlan = async (req, res) => {
    const request =req.body;
    const planId = request.objectId

    client.exists(planId, async function(err, reply) {
        if (reply === 1) {
            return res.status(409).send({message: "Object already existed"});
        } else {
            const plan = {
                'planCostShares' : JSON.stringify(request.planCostShares),
                'linkedPlanServices' : JSON.stringify(request.linkedPlanServices),
                '_org' : request._org,
                'objectId' : request.objectId,
                'objectType' : request.objectType,
                'planType' : request.planType,
                'creationDate': request.creationDate,
            };
        
            try {
                const result = await client.hmset(planId, plan);
                res.setHeader('ETag', etag(JSON.stringify(plan)));
                console.log(result)
                return res.status(200).send({ message: "Created Plan Successfully", object_id: plan['objectId']});
            }
            catch(error){
                console.error(error);
            }
        }
      });



};


exports.putPlan = async (req, res) => {
    const planId = req.params.objectId ;
    const request =req.body;
    client.exists(planId, async function(err, reply) {
        if (reply === 1) {
            console.log("id found")
            const plan = {
                'planCostShares' : JSON.stringify(request.planCostShares),
                'linkedPlanServices' : JSON.stringify(request.linkedPlanServices),
                '_org' : request._org,
                'objectId' : request.objectId,
                'objectType' : request.objectType,
                'planType' : request.planType,
                'creationDate': request.creationDate,
            };
        
            try {
                const result = await client.hmset(plan["objectId"], plan);
                res.setHeader('ETag', etag(JSON.stringify(plan)));
                console.log(result)
                let idChange = "" ;
                if(planId ===plan["objectId"] ){
                    idChange = "and objectId not changed"
                }else{
                    idChange = "and ojbectId changed"
                    client.del(planId, function(err, results) {
                     });
                }
                return res.status(200).send({ message: `Plan putted successfully ${idChange}`, object_id: plan['objectId']});
            }
            catch(error){
                console.error(error);
            }
        } else {
            return res.status(404).send({message: "Object id cannot found"});
        }
      });



};


exports.patchPlan = async (req, res) => {
    const planId = req.params.objectId ;
    const request =req.body;
    client.exists(planId, async function(err, reply) {
        if (reply === 1) {
            client.hgetall(planId, async function(err, results) {
                patchKey = Object.keys(request)
                const originalId = results["objectId"]
                for( const key of patchKey){
                    if( key === "planCostShares" || key === "linkedPlanServices"){
                        results[key] = JSON.stringify(request[key])
                    }else{
                        results[key] = request[key]
                    }  
                }
                try {
                    const patchResult = await client.hmset(results["objectId"], results);
                    res.setHeader('ETag', etag(JSON.stringify(patchResult)));
                    client.del(originalId, function(err, results) {
                    });
                    return res.status(200).send({ message: `Plan patched successfully`, object_id: results['objectId']});
                }
                catch(error){
                    console.error(error);
                }

            });
        } else {
            return res.status(404).send({message: "Object id cannot found"});
        }
      });
};

exports.deletePlan = async (req, res) => {
    const planId = req.params.objectId ;

    client.del(planId, function(err, results) {
        if (err) {
            console.log(err);
            return res.status(500).send({message: "Cache is broken"});
            // do something like callback(err) or whatever
        } else {
           // do something with results

           if(results===0){
            return res.status(404).send({error:"No ObjectId exist"});
           }
           return res.status(204).send({message: "delete Successfully"});
        }
     });
};


