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
import { isArray } from 'util';

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

/**  */
export let addProductItem = async (req: Request, res: Response, next: NextFunction) => {
    if (isArray(req.body.levelPackageId)) {
        if (!req.body.levelPackageId.length) {
            return res.json({
                code: 0,
                message: 'none',
            });
        }
        let succeed = 0, exist = 0, notExist = 0;
        for (let i = 0; i < req.body.levelPackageId.length; i++) {
            let id = req.body.levelPackageId[i];
            const product = await loadByPackageId(id);
            const record = await UserPurchaseRecordModel.findOne({ phoneNo: req.user.phoneNo, produceid: id });
            if (!product) {
                notExist += 1;
            }
            else if (!record) {
                let userPurchaseProductRecord = new UserPurchaseRecordModel({
                    phoneNo: req.user.phoneNo,
                    produceid: id,
                    title: product.questionTitle,
                });
                await userPurchaseProductRecord.save();
                succeed += 1;
            }
            else {
                exist += 1;
            }
        }
        if (succeed === req.body.levelPackageId.length) {
            return res.json({
                code: 10001,
                message: 'OK',
            });
        }
        else if (succeed) {
            return res.json({
                code: 10002,
                message: `${succeed} succeed`,
            });
        }
        else {
            return res.json({
                code: 0,
                message: `${exist} products have been purchased, ${notExist} products does not exist,`,
            });
        }
    }
    else {
        const product = await loadByPackageId(req.body.levelPackageId);
        const record = await UserPurchaseRecordModel.findOne({ phoneNo: req.user.phoneNo, produceid: req.body.levelPackageId }); 
        if (!product) {
            return res.json({
                code: 0,
                message: 'the product does not exsit',
            });
        }
        else if (!record) {
            let userPurchaseProductRecord = new UserPurchaseRecordModel({
                phoneNo: req.user.phoneNo,
                produceid: req.body.levelPackageId,
                title: product.questionTitle,
            });
            await userPurchaseProductRecord.save();
            return res.json({
                code: 10001,
                message: 'OK',
            });
        }
        else {
            return res.json({
                code: 0,
                message: 'the product has been purchased',
            });
        }
    }
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
    if (req.user.highestLevel === highestLevel) {
        return res.json({
            code: 10001,
            message: 'no update'
        });   
    }
    else {
        req.user.highestLevel = highestLevel;
        await req.user.save();
        return res.json({
            code: 0,
            message: 'OK'
        });    
    }
};

export default { login, getVerificationCode };
