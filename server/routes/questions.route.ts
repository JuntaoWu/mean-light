import * as express from 'express';
const router = express.Router();
import * as _ from 'lodash';
import * as questionCtrl from '../controllers/questions.controller';
import { Request, Response, NextFunction } from 'express';

router.get('/getLevelPackages', (req, res, next) => {
    questionCtrl.list(req.query)
        .then(question => {
            if (!question) {
                return res.json({
                    ResultCode: 3,
                    Message: 'Question not found and won\'t create',
                    State: '',
                });
            } else {
                const questions = question.map(i => {
                    return {
                        levelPackageNo: i._id,
                        levelPackageId: i.levelPackageId,
                        levelPackageTitle: i.questionTitle,
                        levelPackageDes: i.questionDes,
                        qVersion: i.qVersion,
                        qUrl: i.qUrl
                    };
                });

                let newTimeStamp = req.query.timeStamp;
                if (question && question.length) {
                    newTimeStamp = _.maxBy(question, 'updatedAt').updatedAt;
                }

                const result = {
                    ResultCode: 0,
                    Message: 'OK',
                    result: {
                        timeStamp: newTimeStamp,
                        levelPackagesData: questions
                    },
                };
                // console.log(result);
                return res.json(result);
            }
        })
        .catch(next);
});

router.post('/', (req, res, next) => {
    questionCtrl.list(req.body)
        .then(question => {
            if (!question) {
                return res.json({
                    ResultCode: 3,
                    Message: 'Question not found and won\'t create',
                });
            } else {
                const result = {
                    ResultCode: 0,
                    Message: 'OK',
                    result: question,
                };
                // console.log(result);
                return res.json(result);
            }
        })
        .catch(next);
});

router.post('/create', (req, res, next) => {
    console.log('create:', req.body);

    return questionCtrl.create(req.body)
        .then(savedQuestion => {
            const result = {
                ResultCode: 0,
                Message: 'OK'
            };
            return res.json(result);
        })
        .catch(e => next(e));
});

router.post('/remove', (req, res, next) => {
    console.log('remove:', req.body);

    return questionCtrl.remove(req.body._id)
        .then(question => {
            const result = {
                ResultCode: 0,
                Message: 'OK'
            };
            return res.json(result);
        })
        .catch(e => next(e));
});

router.get('/:id', (req, res, next) => {
    console.log('get:', req.params);

    questionCtrl.load(req.params.id)
        .then(question => {
            if (!question && !req.body.CreateIfNotExists) {
                return res.json({
                    ResultCode: 3,
                    Message: 'Question not found and won\'t create',
                });
            } else {
                const result = {
                    ResultCode: 0,
                    Message: 'OK',
                    result: question,
                };
                console.log(result);
                return res.json(result);
            }
        })
        .catch(next);
});

router.get('/getByPackageId/:id', (req, res, next) => {
    console.log('get:', req.params);

    questionCtrl.loadByPackageId(req.params.id)
        .then(question => {
            if (!question && !req.body.CreateIfNotExists) {
                return res.json({
                    ResultCode: 3,
                    Message: 'Question not found and won\'t create',
                });
            } else {
                const result = {
                    ResultCode: 0,
                    Message: 'OK',
                    result: question,
                };
                console.log(result);
                return res.json(result);
            }
        })
        .catch(next);
});

router.post('/save', (req, res, next) => {
    console.log('save:', req.body);

    return questionCtrl.update(req.body._id, req.body)
        .then(savedQuestion => {
            const result = {
                ResultCode: 0,
                Message: 'OK'
            };
            return res.json(result);
        })
        .catch(e => next(e));
});

export default router;
