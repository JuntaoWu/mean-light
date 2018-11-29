import * as express from 'express';
const router = express.Router();
const http = require('http');
const https = require('https');

import * as gameCtrl from '../controllers/game.controller';
import { Request, Response, NextFunction } from 'express';

router.post('/create', (req, res, next) => {
    console.log('create:', req.body);

    return gameCtrl.create(req.body)
        .then(savedGame => {
            const result = {
                ResultCode: 0,
                Message: 'OK'
            };
            return res.json(result);
        })
        .catch(e => next(e));
});

router.post('/load', (req, res, next) => {
    console.log('load:', req.query);

    gameCtrl.load(req.body.GameId)
        .then(game => {
            if (!game && !req.body.CreateIfNotExists) {
                return res.json({
                    ResultCode: 3,
                    Message: 'Game not found and won\'t create',
                    State: '',
                });
            } else {
                const result = {
                    ResultCode: 0,
                    Message: 'OK',
                    State: game && game.State,
                };
                console.log(result);
                return res.json(result);
            }
        })
        .catch(next);
});

router.post('/save', (req, res, next) => {
    console.log('save:', req.body);

    return gameCtrl.update(req.body.GameId, req.body)
        .then(savedGame => {
            const result = {
                ResultCode: 0,
                Message: 'OK'
            };
            return res.json(result);
        })
        .catch(e => next(e));
});

export default router;
