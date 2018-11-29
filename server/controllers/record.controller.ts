import RecordModel, { Record } from '../models/record.model';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import RankModel from '../models/rank.model';
import * as _ from 'lodash';

export let list = async (req: Request, res: Response, next: NextFunction) => {

    console.log('Finding records, type:', typeof req.user.userId, req.user.userId);
    const myRank = await RankModel.find({ userId: +req.user.userId });
    console.log(myRank);

    const total = myRank.find(rank => rank.mode === 0 && rank.role === 0);
    const countTotal = total && total.countTotal || 0;
    const countWin = total && total.countWin || 0;

    const total6 = myRank.find(rank => rank.mode === 6 && rank.role === 0);
    const count6Total = total6 && total6.countTotal || 0;
    const count6Win = total6 && total6.countWin || 0;

    const total7 = myRank.find(rank => rank.mode === 7 && rank.role === 0);
    const count7Total = total7 && total7.countTotal || 0;
    const count7Win = total7 && total7.countWin || 0;

    const total8 = myRank.find(rank => rank.mode === 8 && rank.role === 0);
    const count8Total = total8 && total8.countTotal || 0;
    const count8Win = total8 && total8.countWin || 0;

    const countXuyuanTotal = _(myRank.filter(rank => rank.mode === 0 && rank.role > 0 && rank.role <= 5)).sumBy('countTotal');
    const countLaoChaofengTotal = _(myRank.filter(rank => rank.mode === 0 && rank.role > 5 && rank.role <= 8)).sumBy('countTotal');
    const countXuYuanWin = _(myRank.filter(rank => rank.mode === 0 && rank.role > 0 && rank.role <= 5)).sumBy('countWin');
    const countLaoChaofengWin = _(myRank.filter(rank => rank.mode === 0 && rank.role > 5 && rank.role <= 8)).sumBy('countWin');

    return res.json({
        error: false,
        message: 'OK',
        data: {
            countTotal,
            countWin,
            count6Total,
            count7Total,
            count8Total,
            count6Win,
            count7Win,
            count8Win,
            countXuyuanTotal,
            countLaoChaofengTotal,
            countXuYuanWin,
            countLaoChaofengWin
        }
    });
};

export let load = (recordId: string) => {
    return RecordModel.findOne({ recordId: recordId });
};

export let create = async (req, res, next) => {

    const existingRecord = await RecordModel.findOne({ roomName: req.body.roomName, userId: req.user.userId });
    if (existingRecord) {
        return;
    }

    const records = req.body.map(m => new RecordModel(m));
    RecordModel.insertMany(records)
        .catch(error => {
            console.error(error);
            return res.json({
                error: true,
                message: error
            });
        });

    return res.json({
        error: false,
        message: 'OK',
    });
};

export let insertManyTest = async (req, res, next) => {
    const records = [
        { userId: 200051, roomName: '200051', camp: 1, gameType: 8, roleId: 1, isWin: true },
        { userId: 200052, roomName: '200051', camp: 1, gameType: 8, roleId: 2, isWin: true },
        { userId: 200053, roomName: '200051', camp: 1, gameType: 8, roleId: 3, isWin: true },
        { userId: 200054, roomName: '200051', camp: 1, gameType: 8, roleId: 4, isWin: true },
        { userId: 200055, roomName: '200051', camp: 1, gameType: 8, roleId: 5, isWin: true },
        { userId: 200056, roomName: '200051', camp: 2, gameType: 8, roleId: 6, isWin: false },
        { userId: 200057, roomName: '200051', camp: 2, gameType: 8, roleId: 7, isWin: false },
        { userId: 200058, roomName: '200051', camp: 2, gameType: 8, roleId: 8, isWin: false },
    ];
    await RecordModel.insertMany(records.map(record => new RecordModel(record)))
        .catch(error => {
            console.error(error);
            return res.json({
                error: true,
                message: error
            });
        });

    return res.json({
        error: false,
        message: 'OK',
    });
};

export let remove = (params: any) => {
    return load(params).then((record) => record.remove());
};

export default { list, create, insertManyTest };
