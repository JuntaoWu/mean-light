import * as express from 'express';
import * as validate from 'express-validation';
import paramValidation from '../config/param-validation';
import * as userCtrl from '../controllers/user.controller';
import * as passport from 'passport';

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/user/register - Save user's nickname & Returns token if correct phoneNo and code is provided */
router.route('/register')
    .post(passport.authenticate('local', { failWithError: true }), userCtrl.register);

/** POST /api/user/login - Returns token if correct phoneNo and code is provided */
router.route('/login')
    .post(passport.authenticate('local', { failWithError: true }), userCtrl.login);

/** POST /api/user/getVerificationCode - Allow anyone to send SMS code via phoneNo */
router.route('/getVerificationCode')
    .post(validate(paramValidation.getVerificationCode), userCtrl.getVerificationCode);

/**  */
router.route('/addProductItem')
    .post(passport.authenticate('jwt', { failWithError: false }), userCtrl.addProductItem);

router.route('/getProductItems')
    .get(passport.authenticate('jwt', { failWithError: true }), userCtrl.getProductItems);

router.route('/updateHighestLevel')
    .post(passport.authenticate('jwt', { failWithError: false }), userCtrl.updateHighestLevel);

/** rank */
router.route('/leaderBoard')
    .get(passport.authenticate('jwt', { failWithError: true }), userCtrl.leaderBoard);
router.route('/playerRank')
    .get(passport.authenticate('jwt', { failWithError: true }), userCtrl.playerRank);

/** setting */
router.route('/settingUser')
    .post(passport.authenticate('jwt', { failWithError: false }), userCtrl.settingUser);
    
export default router;
