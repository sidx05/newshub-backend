import mongoose, { Document } from 'mongoose';
export interface ITicker extends Document {
    text: string;
    priority: number;
    expiry: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Ticker: mongoose.Model<ITicker, {}, {}, {}, mongoose.Document<unknown, {}, ITicker, {}, {}> & ITicker & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Ticker.d.ts.map