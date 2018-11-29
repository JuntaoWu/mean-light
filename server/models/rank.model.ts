
import { prop, Typegoose, ModelType, InstanceType, pre } from 'typegoose';

/**
 * Rank Schema
 */
export class Rank extends Typegoose {
    @prop({ index: true })
    userId: Number;
    @prop()
    mode?: Number;
    @prop()
    role?: Number;
    @prop()
    countWin?: Number;
    @prop()
    countTotal?: Number;
    @prop()
    winRate?: Number;

    // @prop()
    // _countWin?: Number;
    // @prop()
    // _countTotal?: Number;

    // @prop() // this will create a virtual property called 'countWin'
    // get countWin() {
    //     return this._countWin;
    // }
    // set countWin(value) {
    //     this._countWin = value;
    //     if (this._countWin && this._countTotal) {
    //         this.winRate = +this._countWin / +this._countTotal;
    //     }
    // }

    // @prop() // this will create a virtual property called 'countTotal'
    // get countTotal() {
    //     return this._countTotal;
    // }
    // set countTotal(value) {
    //     this._countTotal = value;
    //     if (this._countWin && this._countTotal) {
    //         this.winRate = +this._countWin / +this._countTotal;
    //     }
    // }
}

const RankModel = new Rank().getModelForClass(Rank, {
    schemaOptions: {
        shardKey: true,
        timestamps: true,
    },
});

export default RankModel;
