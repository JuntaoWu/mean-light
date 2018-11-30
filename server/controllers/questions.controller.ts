import QuestionModel, { Questions } from '../models/questions.model';
import { Request, Response, NextFunction } from 'express';
import { IncomingMessage } from 'http';
import { date } from 'joi';

export let load = async (questionsId: string) => {
    return QuestionModel.findOne({ questionsId: questionsId });
};

export let list = async (params: { limit?: number, timeStamp?: string }) => {
    console.log(params);
    const { limit = 10, timeStamp = "0000-00-00" } = params;
    let existsCondition = {"updateTime":{$gte: timeStamp}};
    return await QuestionModel.find(existsCondition)
        // .limit(+limit)
        // .exec();
}

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

