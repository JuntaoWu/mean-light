import { Request, Response, NextFunction } from 'express';
import * as express from 'express';

import * as https from 'https';

const validate = require('express-validation');
const paramValidation = require('../config/param-validation');

const router = express.Router();

router.route('/check')
    /** GET /version/check - Get latest version */
    .get((req: Request, res: Response, next: NextFunction) => {
        // todo: check version.
        const request = https.request({
            hostname: 'dashboard.hzsdgames.com',
            port: 8088,
            path: `/version/check?appName=cephei-moa&version=${req.query.version || 0}`,
            method: 'GET',
        }, (cepheiRes) => {
            console.log('response from dashboard api.');

            let data = '';
            cepheiRes.on('data', (chunk: ArrayBuffer) => {
                data += chunk;
                console.log('chunk:', chunk);
            });

            cepheiRes.on('end', () => {
                const result = JSON.parse(data);
                console.log('result:', result);
                res.json(result);
            });
        });

        request.end();

        request.on('error', (data) => {
            res.json({
                error: true,
                message: data.message,
                data: {
                    hasUpdate: false
                }
            });
        });
    });

export default router;
