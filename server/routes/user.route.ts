
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as passport from 'passport';

import wxUserCtrl from '../controllers/wxuser.controller';

const router = express.Router();

router.post('/login-wxgame', passport.authenticate('localWxGame'), wxUserCtrl.loginWxGame);

router.post('/login-native', passport.authenticate(['jwtWx', 'localNative']), wxUserCtrl.loginNative);

router.post('/authorize-wxgame', wxUserCtrl.authorizeWxGame);

router.get('/photon-login', (req: Request, res: Response, next: NextFunction) => {
    console.log('photon-login', req.query.userId);
    const userId: string = req.query.userId;

    if (!userId || userId === 'undefined') {
        // Anonymous user login via photon custom auth.
        // Return a new random userId.
        return res.json({
            ResultCode: 1,
            UserId: (Math.random() * 100000).toFixed()
        });
    } else if (userId.startsWith('debug')) {
        return res.json({
            ResultCode: 1,
            UserId: userId
        });
    }

    wxUserCtrl.load(req.query).then((user) => {
        console.log('photon-login completed:', user && user.userId);
        return res.json({
            ResultCode: user ? 1 : 2,
            UserId: user && user.userId
        });
    });
});

export default router;
