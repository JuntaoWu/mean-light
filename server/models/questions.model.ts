import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { makeConnection } from '../config/mongoose-pool';

/**
 * Schema
 */
export class Questions extends Typegoose {
    @prop({ unique: true })
    levelPackageId: String;
    @prop()
    questionTitle: String;
    @prop()
    questionDes: String;
    @prop()
    qVersion: String;
    @prop()
    qUrl: String;

    @prop()
    updatedAt: Date;
}

export class QuestionsDefault extends Questions {

    // @prop()
    // tenantId: String;
}

export class QuestionsTenant1 extends Questions {

    // @prop()
    // tenantId: String;
}

// const QuestionModel = new QuestionsDefault().getModelForClass(QuestionsDefault, {
//     schemaOptions: {
//         collection: 'questions',
//         timestamps: true,
//     },
//     existingConnection: makeConnection('Default')
// });

function getInstance(tenantId: string = 'Default'): QuestionsDefault | QuestionsTenant1 {
    let instance;
    switch (tenantId) {
        case 'Default':
            instance = new QuestionsDefault();
            break;
        case 'Tenant1':
            instance = new QuestionsTenant1();
            break;
    }
    return instance;
}

export function QuestionModelPool(tenantId: string = 'Default') {
    let instance = getInstance(tenantId);
    return instance.getModelForClass(instance.constructor, {
        schemaOptions: {
            collection: 'questions',
            timestamps: true,
        },
        existingConnection: makeConnection(tenantId)
    });
}

export default QuestionModelPool();
