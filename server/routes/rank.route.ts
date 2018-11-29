import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as rankCtrl from '../controllers/rank.controller';

const validate = require('express-validation');
const paramValidation = require('../config/param-validation');

const router = express.Router();

router.route('/')
    /** GET /api/ranks - Get list of ranks */
    .get(rankCtrl.leaderBoard);

/** Load post when API with openId route parameter is hit */
// router.param('openId', rankCtrl.load);

// router.route('/updateManyTest')
//     .get(rankCtrl.updateManyTest);

export default router;
