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

export let register = async (req: Request, res: Response, next: NextFunction) => {

    let user = await UserModel.findOne({ phoneNo: req.body.phoneNo });
    user.nickname = req.body.userName;
    await user.save();

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
    const record = await UserPurchaseRecordModel.findOne({ phoneNo: req.user.phoneNo, produceid: req.body.levelPackageId });
    if (!record) {
        const product = await loadByPackageId(req.body.levelPackageId);
        if (!product) {
            return res.json({
                code: 0,
                message: 'the product does not exsit',
            });
        }
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
            message: 'purchased',
        });
    }
};

/**  */
export let getProductItems = async (req: Request, res: Response, next: NextFunction) => {
    const records = await UserPurchaseRecordModel.find({ phoneNo: req.user.phoneNo });
    return res.json({
        username: req.user.nickname,
        phoneno: req.user.phoneNo,
        highestleve: req.user.highestLevel,
        purchaseList: records,
    });
};

/**  */
export let updateHighestLevel = async (req, res, next) => {
    req.user.highestLevel = req.body.highestLevel;
    await req.user.save();
    return res.json({
        code: 0,
        message: 'OK'
    });
};

export default { login, getVerificationCode };
