

const express = require('express');
const router = express.Router();
const plans = require('../controllers/plans.js');
const {checkPlan, checkPlanPatch} = require('../controllers/validation');
const {verifyToken} = require("../middleware/auth");

router.post('/createES', plans.createES);
// router.get('/getES', plans.getES);
router.get('/token', plans.getToken);
router.get('/plan/:objectId',verifyToken(), plans.getPlanById);
router.post('/plan',verifyToken(), checkPlan(), plans.createPlan);
router.put('/plan/:objectId',verifyToken(), checkPlan(), plans.putPlan);
router.delete('/plan/:objectId', verifyToken(), plans.deletePlan);
router.patch('/plan/:objectId',verifyToken(),checkPlanPatch(), plans.patchPlan);

module.exports = router;
