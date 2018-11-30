import * as express from 'express';
const router = express.Router();

import * as questionCtrl from '../controllers/questions.controller';
import { Request, Response, NextFunction } from 'express';

router.get('/', (req, res, next) => {

    questionCtrl.list(req.body)
        .then(question => {
            if (!question) {
                return res.json({
                    ResultCode: 3,
                    Message: 'Question not found and won\'t create',
                    State: '',
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
                    State: '',
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

router.post('/load', (req, res, next) => {
    console.log('load:', req.query);

    questionCtrl.load(req.body.questionId)
        .then(question => {
            if (!question && !req.body.CreateIfNotExists) {
                return res.json({
                    ResultCode: 3,
                    Message: 'Question not found and won\'t create',
                    State: '',
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
