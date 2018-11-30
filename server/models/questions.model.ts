import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';

/**
 * Schema
 */
export class Questions extends Typegoose {
    @prop()
    questionsId: Number;
    @prop()
    questionsNo: String;
    @prop()
    questionTitle: String;
    @prop()
    questionDes: String;
    @prop()
    qVersion: String;
    @prop()
    qUrl: String;
}

const GameModel = new Questions().getModelForClass(Questions, {
    schemaOptions: {
        timestamps: true
    }
});

export default GameModel;
