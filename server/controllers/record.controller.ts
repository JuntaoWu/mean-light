import RecordModel, { Record } from '../models/record.model';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import * as _ from 'lodash';
import * as redis from '../config/redis';

/**  */
export let updateLevelScore = async (req: Request, res: Response, next: NextFunction) => {
    let rankRecord = await RecordModel.findOne({ userId: req.user.phoneNo });
    if (!rankRecord) {
        rankRecord = new RecordModel({
            userId: req.user.phoneNo,
            levelScore: [],
            highestScore: 0,
        });
    }
    if (!req.user.highestLevel || req.body.level > req.user.highestLevel || req.body.score > rankRecord.levelScore[req.body.level-1]) {
        if (!req.user.highestLevel || req.body.level > req.user.highestLevel) {
            req.user.highestLevel = req.body.level;
            await req.user.save();
        }
        let scoreList = rankRecord.levelScore.map(i => i);
        scoreList[req.body.level-1] = isNaN(req.body.score) ? 0 : +req.body.score;
        rankRecord.levelScore = scoreList;
        // rankRecord.levelScore[level-1] = isNaN(score) ? 0 : +score;

        const highestScore = req.user.highestLevel + rankRecord.levelScore.reduce((total, num) => { return total + num });
        rankRecord.highestScore = highestScore;
        await rankRecord.save();
        console.log(req.user.fromApp);

        const client = redis.getInstance();
        client.zadd(`highestLevel${req.user.fromApp}`, highestScore.toString(), req.user.phoneNo.toString());
        return res.json({
            code: 0,
            message: 'OK'
        });    
    }
    else {
        return res.json({
            code: 10001,
            message: 'no update'
        });   
    }
};

// export let updateLevelScoreByList = async (req: Request, res: Response, next: NextFunction) => {
//     let rankRecord = await RecordModel.findOne({ userId: req.user.phoneNo });
//     if (!rankRecord) {
//         rankRecord = new RecordModel({
//             userId: req.user.phoneNo,
//             levelScore: [],
//             highestScore: 0,
//         });
//     }
//     let scoreList = JSON.parse(req.body.scores);
//     rankRecord.levelScore = scoreList;
//     req.user.highestLevel = scoreList.length;
//     await req.user.save();

//     const highestScore = rankRecord.highestScore + rankRecord.levelScore.reduce((total, num) => { return total + num });
//     rankRecord.highestScore = highestScore;
//     await rankRecord.save();

//     const client = redis.getInstance();
//     client.zadd(`highestLevel${req.user.fromApp}`, highestScore.toString(), req.user.phoneNo.toString());
//     return res.json({
//         code: 0,
//         message: 'OK'
//     });
// };

export let getLevelScore = async (req: Request, res: Response, next: NextFunction) => {
    let rankRecord = await RecordModel.findOne({ userId: req.user.phoneNo });
    if (!rankRecord) {
        rankRecord = new RecordModel({
            userId: req.user.phoneNo,
            levelScore: [],
            highestScore: 0,
        });
        await rankRecord.save();
    }
    return res.json({
        code: 10001,
        message: 'OK',
        data: {
            levelScore: rankRecord.levelScore,
            highestLevel: rankRecord.levelScore.length,
        }
    });
};

export default { updateLevelScore, getLevelScore };
