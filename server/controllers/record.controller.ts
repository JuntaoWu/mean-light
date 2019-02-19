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
            levelScore: [0],
            highestLevel: req.body.level,
        });
    }
    if (req.body.level > rankRecord.highestLevel || req.body.score > rankRecord.levelScore[req.body.level-1]) {
        if (req.body.level > rankRecord.highestLevel) {
            rankRecord.highestLevel = req.body.level;
        }
        let scoreList = rankRecord.levelScore.map(i => i);
        scoreList[req.body.level-1] = isNaN(req.body.score) ? 0 : +req.body.score;
        rankRecord.levelScore = scoreList;
        // rankRecord.levelScore[level-1] = isNaN(score) ? 0 : +score;
        await rankRecord.save();
        
        const highestLevel = rankRecord.highestLevel + rankRecord.levelScore.reduce((total, num) => { return total + num });
        req.user.highestLevel = highestLevel;
        await req.user.save();

        const client = redis.getInstance();
        client.zadd(`highestLevel${req.user.fromApp}`, highestLevel.toString(), req.user.phoneNo.toString());
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


export let getLevelScore = async (req: Request, res: Response, next: NextFunction) => {
    let rankRecord = await RecordModel.findOne({ userId: req.user.phoneNo });
    if (!rankRecord) {
        rankRecord = new RecordModel({
            userId: req.user.phoneNo,
            levelScore: [0],
            highestLevel: 1,
        });
        await rankRecord.save();
    }
    return res.json({
        code: 10001,
        message: 'OK',
        data: {
            levelScore: rankRecord.levelScore,
            highestLevel: rankRecord.highestLevel,
        }
    });
};

export default { updateLevelScore, getLevelScore };
