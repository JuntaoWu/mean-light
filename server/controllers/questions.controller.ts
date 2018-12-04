import QuestionModel, { Questions } from '../models/questions.model';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import { date } from 'joi';

export let load = async (questionsId: string) => {
    return QuestionModel.findOne({ _id: questionsId });
};

export let loadByPackageId = async (levelPackageId: string) => {
    return QuestionModel.findOne({ levelPackageId: levelPackageId });
};

export let list = async (params: { limit?: number, skip?: number, timeStamp?: string }) => {
    const { limit = 0, skip = 0, timeStamp } = params;
    const myTimeStamp = timeStamp || 0;
    const existsCondition = { 'updatedAt': { $gt: new Date(myTimeStamp) } };
    return await QuestionModel.find(existsCondition).limit(+limit).skip(+skip).exec();
};

export let create = async (body: any) => {
    const question = new QuestionModel(body);

    await question.save();
    return QuestionModel.findOne();
};

export let update = (questionsId, body: Questions) => {
    return load(questionsId).then(async (question) => {
        if (question) {
            question = Object.assign(question, body);
        } else {
            question = new QuestionModel(body);
        }
        return await question.save();
    });
};

export let remove = (params: any) => {
    return load(params).then((question) => question.remove());
};

