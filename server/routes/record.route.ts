import * as express from 'express';
const router = express.Router();
const http = require('http');
const https = require('https');
import * as passport from 'passport';

import * as recordCtrl from '../controllers/record.controller';
import { Request, Response, NextFunction } from 'express';

// router.post('/', passport.authenticate('jwtWx'), recordCtrl.list);

// router.post('/create', passport.authenticate('jwtWx'), recordCtrl.create);

// router.post('/insertManyTest', recordCtrl.insertManyTest);

router.route('/updateLevelScore')
    .post(passport.authenticate('jwt', { failWithError: false }), recordCtrl.updateLevelScore);
router.route('/getLevelScore')
    .get(passport.authenticate('jwt', { failWithError: false }), recordCtrl.getLevelScore);

export default router;
