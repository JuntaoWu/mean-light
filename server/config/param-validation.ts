import * as Joi from 'joi';

export default {

    // POST /api/posts
    createPlayer: {
        body: {
            openId: Joi.string().required(),
        }
    },
    // UPDATE /api/users/:userId
    updatePlayer: {
        body: {
            //   username: Joi.string().required(),
            //   mobileNumber: Joi.string().regex(/^[1-9][0-9]{9}$/).required()
        },
        params: {
            openId: Joi.string().required()
        }
    },
    // POST /api/user/getVerificationCode
    getVerificationCode: {
        body: {
            phoneNo: Joi.string().regex(/^[1-9][0-9]{10}$/).required()
        }
    },
};
