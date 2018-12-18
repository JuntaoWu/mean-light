
// import { Request, Response, NextFunction } from 'express';
// import { IncomingMessage } from 'http';
// import * as jwt from 'jsonwebtoken';
// import * as httpStatus from 'http-status';
// import { AES, CipherOption } from 'crypto-js';
// import * as CryptoJS from 'crypto-js';
// import { InstanceType } from 'typegoose';

// import { config } from '../config/config';
// import { APIError } from '../helpers/APIError';
// import WxUserModel, { WxUser } from '../models/wxuser.model';
// import { DocumentQuery } from 'mongoose';
// import RankModel from '../models/rank.model';

// export let load = async (params: any) => {
//     return WxUserModel.findOne({ userId: params.userId });
// };

// export let loginWxGame = async (req, res, next) => {
//     return login(req, res, next);
// };

// export let loginNative = async (req, res, next) => {
//     console.log('loginNative');
//     console.log(req.user, req.body);

//     // Step 1. Check if user had been logged in Native app.
//     const condition = {};
//     if (req.user.userId) {  // for anonymous-login & jwt-token login.
//         condition['userId'] = req.user.userId;
//     } else if (req.user.nativeOpenId) {  // for wx-authorize login.
//         condition['nativeOpenId'] = req.user.nativeOpenId;
//     }
//     let user = await WxUserModel.findOne(condition)
//         .catch((error) => {
//             console.error(error);
//             return undefined;
//         });
//     if (!user) {
//         user = new WxUserModel(req.user);
//         user.registeredAt = new Date();
//         await user.save();
//     } else {
//         user.nativeOpenId = req.user.nativeOpenId;
//         user.nickName = req.user.nickName;
//         user.gender = req.user.gender;
//         user.province = req.user.province;
//         user.city = req.user.city;
//         user.country = req.user.country;
//         user.avatarUrl = req.user.avatarUrl;
//     }

//     // Step 2. Check if unionId had been saved in DB.
//     if (!user.unionId) {
//         user.unionId = req.user.unionId;
//     }

//     // Step 3.1 If user had been migrated.
//     if (!user.migrated) {
//         req.user = await migrate(user, 'wxgameOpenId');
//     } else {
//         // Step 3.2 Update existing WxGameUser's basic info.
//         await user.save().catch((error) => {
//             console.error(error);
//             return undefined;
//         });
//         req.user = user;
//     }

//     return login(req, res, next);
// };

// export let authorizeWxGame = async (req: Request, res: Response, next: NextFunction) => {
//     console.log('authorizeWxGame');
//     console.log(req.body);

//     // Step 1. Check if user had been logged in WxGame.
//     let user = await WxUserModel.findOne({ wxgameOpenId: req.body.wxgameOpenId })
//         .catch((error) => {
//             console.error(error);
//             return undefined;
//         });
//     if (!user) {
//         user = new WxUserModel(req.body);
//         user.registeredAt = new Date();
//         await user.save();
//     } else {
//         user.wxgameOpenId = req.body.wxgameOpenId;
//         user.nickName = req.body.nickName;
//         user.gender = req.body.gender;
//         user.province = req.body.province;
//         user.city = req.body.city;
//         user.country = req.body.country;
//         user.avatarUrl = req.body.avatarUrl;
//     }

//     // Step 2. Check if unionId had been saved in DB.
//     if (!user.unionId) {
//         const encryptedData = req.body.encryptedData;  // new Buffer(req.body.encryptedData, "base64");
//         // tslint:disable-next-line:max-line-length
//         const sessionKey = CryptoJS.enc.Base64.parse(req.body.session_key.toString());  // new Buffer(user.session_key.toString(), "base64");
//         const iv = CryptoJS.enc.Base64.parse(req.body.iv);  // new Buffer(req.body.iv, "base64");
//         const result = AES.decrypt(encryptedData as any, sessionKey as any, {
//             iv: iv as any,
//             mode: CryptoJS.mode.CBC,
//             padding: CryptoJS.pad.Pkcs7
//         }).toString(CryptoJS.enc.Utf8);

//         const decryptedData = JSON.parse(result);

//         user.unionId = decryptedData.unionId;
//     }

//     // Step 3. Check if user had been migrated.
//     if (!user.migrated) {
//         req.user = await migrate(user, 'nativeOpenId');
//     } else {
//         // Step 4. Update existing WxGameUser's basic info.
//         await user.save().catch((error) => {
//             console.error(error);
//             return undefined;
//         });
//         req.user = user;
//     }

//     return login(req, res, next);
// };

// async function migrate(newUser: InstanceType<WxUser>, existingUserCondition: string) {
//     // existing user from db.
//     const condition = { unionId: newUser.unionId };
//     condition[existingUserCondition] = { $exists: true };

//     const existingUser = await WxUserModel.findOne(condition)
//         .catch((error) => {
//             console.error(error);
//             return undefined;
//         });

//     // Step 1. Check if user had been logged in via another way.
//     if (existingUser) {
//         // Step 1.1 Update existingUser's basic info.
//         existingUser.wxgameOpenId = newUser.wxgameOpenId;
//         existingUser.nickName = newUser.nickName;
//         existingUser.gender = newUser.gender;
//         existingUser.province = newUser.province;
//         existingUser.city = newUser.city;
//         existingUser.country = newUser.country;
//         existingUser.avatarUrl = newUser.avatarUrl;

//         // Step 1.2 Migrate newUser's rank to existingUser's.
//         const ranks = await RankModel.find({ userId: newUser.userId })
//             .catch((error) => {
//                 console.error(error);
//                 return undefined;
//             });
//         // Step 1.2.1 find newUser's rank data.
//         if (ranks) {
//             ranks.forEach(async rank => {
//                 const existingRank = await RankModel.findOne({ userId: existingUser.userId, mode: rank.mode, role: rank.role })
//                     .catch((error) => {
//                         console.error(error);
//                         return undefined;
//                     });

//                 if (existingRank) {
//                     existingRank.countWin = +(existingRank.countWin || 0) + (+rank.countWin || 0);
//                     existingRank.countTotal = +(existingRank.countTotal || 0) + (+rank.countTotal || 0);
//                     existingRank.winRate = +existingRank.countTotal ? +existingRank.countWin / +existingRank.countTotal : 0;
//                     await existingRank.save();
//                     await rank.remove();
//                 } else {
//                     rank.userId = existingUser.userId;
//                     await rank.save();
//                 }
//             });
//             existingUser.migrated = true;

//             await existingUser.save();

//             // todo: check if we need to remove the newly created user.
//             await newUser.remove();
//         }

//         return existingUser;
//     } else {
//         // Step 3.2. Create/Update WxGameUser without migration.
//         await newUser.save().catch((error) => {
//             console.error(error);
//             return undefined;
//         });

//         return newUser;
//     }
// }

// function login(req, res, next) {
//     if (req.user) {
//         const token = jwt.sign({
//             userId: req.user.userId,
//             wxgameOpenId: req.user.wxgameOpenId,
//             nativeOpenId: req.user.nativeOpenId,
//             unionId: req.user.unionId  // if we do not have unionId here, the token will not be any use.
//         }, config.jwtSecret);

//         return res.json({
//             error: false,
//             message: 'OK',
//             data: {
//                 token,
//                 userId: req.user.userId,
//                 wxgameOpenId: req.user.wxgameOpenId,
//                 nativeOpenId: req.user.nativeOpenId,
//                 unionId: req.user.unionId,
//                 session_key: req.user.session_key,
//                 nickName: req.user.nickName,
//                 avatarUrl: req.user.avatarUrl,
//                 anonymous: req.user.anonymous,
//             }
//         });
//     }

//     const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
//     return next(err);
// }

// export default { loginWxGame, loginNative, authorizeWxGame, load };
