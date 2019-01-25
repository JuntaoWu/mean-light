import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { ObjectID, Int32 } from 'bson';

/**
 * User Schema
 */
export class User extends Typegoose {

  @prop()
  public phoneNo?: Int32;

  @prop()
  public username?: String;  // make username same as phoneNo in China.

  @prop()
  public fromApp?: String; //

  @prop()
  public nickname?: String;

  @prop()
  public password?: String;

  @prop()
  public gender?: Number;

  @prop()
  public avatarUrl?: String;

  @prop()
  public securityStamp?: String;

  @prop()
  public highestLevel?: Number;
  
  @prop()
  public avatarUrlGroup?: Number;
}

const UserModel = new User().getModelForClass(User, {
  schemaOptions: {
    timestamps: true,
  }
});

export default UserModel;
