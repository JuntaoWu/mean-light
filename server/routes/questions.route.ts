import * as express from 'express';
const router = express.Router();

import * as questionCtrl from '../controllers/questions.controller';
import { Request, Response, NextFunction } from 'express';

router.get('/', (req, res, next) => {
    questionCtrl.list(req.query)
        .then(question => {
            if (!question) {
                return res.json({
                    ResultCode: 3,
                    Message: 'Question not found and won\'t create',
                    State: '',
                });
            } else {
                let questions = question.map(i => {
                    return {
                        levelPackageNo: i.questionsId,
                        levelPackageId: i.questionsNo,
                        levelPackageTitle: i.questionTitle,
                        levelPackageDes: i.questionDes,
                        qVersion: i.qVersion,
                        qUrl: i.qUrl
                    }
                })
                const result = {
                    ResultCode: 0,
                    Message: 'OK',
                    result: {
                        timeStamp: req.query.timeStamp,
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

router.post('/save', (req, res, next) => {
    console.log('save:', req.body);

    return questionCtrl.update(req.body.questionsId, req.body)
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