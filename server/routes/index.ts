import * as express from 'express';

import userRouter from './user.route';
import rankRouter from './rank.route';
import versionRouter from './version.route';
import gameRouter from './game.route';
import recordRouter from './record.route';

const router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.use('/users', userRouter);
router.use('/ranks', rankRouter);
router.use('/version', versionRouter);
router.use('/games/:gameId', gameRouter);
router.use('/records', recordRouter);

export default router;
