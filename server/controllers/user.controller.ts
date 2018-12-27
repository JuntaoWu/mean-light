import * as jwt from 'jsonwebtoken';
import * as httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import config from '../config/config';

import { Request, Response, NextFunction } from 'express';
import UserModel, { User } from '../models/user.model';
import UserPurchaseRecordModel from '../models/userPurchaseRecord.model';
import { loadByPackageId } from '../controllers/questions.controller';

import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

import * as uuid from 'uuid';

import * as speakeasy from 'speakeasy';
import MySMSClient from '../config/sms-client';
import * as redis from '../config/redis';

export let register = async (req: Request, res: Response, next: NextFunction) => {

    req.user.nickname = req.body.userName;
    await req.user.save();

    return login(req, res, next);
};

/**
 * Returns jwt token if valid username and password is provided
 */
export let login = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (!user) {
        const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
        return next(err);
    }

    const token = jwt.sign({
        username: req.body.phoneNo
    }, config.jwtSecret);

    return res.json({
        code: 0,
        message: 'OK',
        data: {
            token: token,
            username: req.body.phoneNo,
            nickname: user.nickname,
            avatarUrlGroup: user.avatarUrlGroup || 0,
        }
    });
};

/**
 * send verification code via SMS for TF-Validation
 */
export let getVerificationCode = async (req, res, next) => {
    let user = await UserModel.findOne({ phoneNo: req.body.phoneNo });

    // create user when first time get SMS code.
    if (!user) {
        user = new UserModel({
            username: req.body.phoneNo,
            phoneNo: req.body.phoneNo,
            securityStamp: speakeasy.generateSecret().base32,
        });
        await user.save();
    }
    if (!user.securityStamp) {
        user.securityStamp = speakeasy.generateSecret().base32;
        await user.save();
    }

    const code = speakeasy.totp({
        secret: user.securityStamp.toString(),
        encoding: 'base32',
    });

    console.log(`Sending SMS to user: ${user.phoneNo}, code: ${code}`);

    const smsClient = new MySMSClient();
    smsClient.sendSMS({
        PhoneNumbers: req.body.phoneNo,
        SignName: config.aliCloud.smsSignName,
        TemplateCode: config.aliCloud.smsTemplateCode,
        TemplateParam: `{ "code": "${code}" }`
    }).then((result) => {
        const { Code } = result;
        if (Code === 'OK') {
            console.log(result);
        }
        return res.json({
            code: 0,
            message: 'OK',
        });
    }).catch((err) => {
        console.log(err);
        return res.json({
            code: 10001,
            message: 'Send SMS failed'
        });
    });
};

let addProduct = (phoneNo: any, ids: Array<string>) => {
    return new Promise<any>(async (resolve, reject) => {
        let succeed = 0, purchased = 0, notExist = 0;
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            const product = await loadByPackageId(id);
            if (!product) {
                notExist += 1;
            }
            else {
               const record = await UserPurchaseRecordModel.findOne({ phoneNo: phoneNo, produceid: id });
               if (!record) {
                    let userPurchaseProductRecord = new UserPurchaseRecordModel({
                        phoneNo: phoneNo,
                        produceid: id,
                        title: product.questionTitle,
                    });
                    await userPurchaseProductRecord.save();
                    succeed += 1;
                }
                else {
                    purchased += 1;
                }
            }
        }
        return resolve({
            succeed: succeed,
            notExist: notExist,
            purchased: purchased,
        });
    });
};

/**  */
export let addProductItem = async (req: Request, res: Response, next: NextFunction) => {
    let ids: any = req.body.levelPackageId;
    if (/^\[[^\]]*\]/.test(ids)) {
        ids = JSON.parse(ids);
    }
    else {
        ids = new Array(ids);
    }
    console.log('levelPackageId:', ids)
    addProduct(req.user.phoneNo, ids).then(val => {
        if (val.succeed) {
            return res.json({
                code: 10001,
                message: 'OK',
            });
        }
        else {
            return res.json({
                code: 0,
                message: `${val.purchased ? val.purchased + ' purchased.' : ''}${val.notExist ? val.notExist + ' not exist.' : ''} `,
            });
        }
    });
};

/**  */
export let getProductItems = async (req: Request, res: Response, next: NextFunction) => {
    const records = await UserPurchaseRecordModel.find({ phoneNo: req.user.phoneNo });
    return res.json({
        username: req.user.nickname,
        phoneno: req.user.phoneNo,
        highestlevel: req.user.highestLevel,
        purchaseList: records,
    });
};

/**  */
export let updateHighestLevel = async (req: Request, res: Response, next: NextFunction) => {
    const highestLevel = Math.max((req.user.highestLevel || 0), (req.body.highestLevel || 0));
    if (!req.user.highestLevel || highestLevel > req.user.highestLevel) {
        req.user.highestLevel = highestLevel;
        await req.user.save();

        const client = redis.getInstance();
        client.zadd("highestLevel", highestLevel.toString(), req.user.phoneNo.toString());
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

export let leaderBoard = async (req: Request, res: Response, next: NextFunction) => {
    console.log("leaderBoard");

    let skip = +(req.query.skip) || 0;
    skip = Math.max(0, skip);

    let limit = +(req.query.limit) || 50;
    limit = Math.max(0, limit);

    const client = redis.getInstance();
    client.zrevrange("highestLevel", skip, skip + limit - 1, (redisError, redisResult) => {
        console.log(redisResult);
        const rankMap: any = {};
        redisResult.forEach((phoneNo: string, index: number) => {
            rankMap[phoneNo] = skip + index + 1;
        });

        UserModel.find({ phoneNo: { "$in": redisResult } }).then(dbResult => {
            if (!dbResult) {
                return res.json({
                    error: true,
                    message: "No user exists",
                    data: undefined,
                });
            }
            res.json({
                error: false,
                message: "OK",
                data: dbResult.map((user, index) => {
                    return {
                        nickName: user.nickname || "",
                        userName: user.username || "",
                        avatarUrl: user.avatarUrl || "",
                        avatarUrlGroup: user.avatarUrlGroup || 0,
                        highestLevel: user.highestLevel || 0,
                        rank: rankMap[user.phoneNo.toString()]
                    };
                }).sort((lhs, rhs) => {
                    return lhs.rank - rhs.rank;
                })
            });
        });
    });
};

export let playerRank = async (req: Request, res: Response, next: NextFunction) => {
    console.log("playerRank");
    const phoneNo = req.user.phoneNo;
    const client = redis.getInstance();

    client.zrevrank("highestLevel", phoneNo, (redisError, redisResult) => {
        console.log(redisResult);
        if (!redisResult && redisResult !== 0) {
            return res.json({
                error: true,
                message: "No such user",
                data: undefined
            });
        }
        UserModel.findOne({ phoneNo: phoneNo }).then(user => {
            if (!user) {
                return res.json({
                    error: true,
                    message: "No such user",
                    data: undefined
                });
            }
            res.json({
                error: false,
                message: "OK",
                data: {
                    nickName: user.nickname || "",
                    userName: user.username || "",
                    avatarUrl: user.avatarUrl || "",
                    avatarUrlGroup: user.avatarUrlGroup || 0,
                    highestLevel: user.highestLevel || 0,
                    rank: redisResult + 1
                }
            });
        });
    });
};


export let settingUser = async (req: Request, res: Response, next: NextFunction) => {
    let user = req.user;
    user.avatarUrlGroup = req.body.avatarUrlGroup || user.avatarUrlGroup;
    user.nickname = req.body.nickName || user.nickname;
    await user.save();
    
    return res.json({
        code: 0,
        message: 'OK',
        data: {
            nickname: user.nickname,
            avatarUrlGroup: user.avatarUrlGroup || 0,
        }
    });
};

export default { login, getVerificationCode };
