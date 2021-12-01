const jwt = require("jsonwebtoken");

const config = require('../config');

exports.verifyToken = () => async (req, res, next) => {
  const token =
    req.body.Authorization || req.query.token || req.headers["authorization"];

  if (!token) {
    return res.status(403).send( {error : "A token is required for authentication"});
  }
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({error:"Invalid Token"});
  }
  return next();
};