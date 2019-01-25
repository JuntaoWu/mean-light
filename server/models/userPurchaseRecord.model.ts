import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { ObjectID, Int32 } from 'bson';

/**
 * UserPurchaseRecord Schema
 */
export class UserPurchaseRecord extends Typegoose {

  @prop()
  public phoneNo: Int32;

  @prop()
  public produceid?: String;

  @prop()
  public fromApp?: String;

  @prop()
  public title?: string;
}

const UserPurchaseRecordModel = new UserPurchaseRecord().getModelForClass(UserPurchaseRecord, {
  schemaOptions: {
    timestamps: true,
  }
});

export default UserPurchaseRecordModel;
