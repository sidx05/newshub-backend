import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    key: string;
    label: string;
    icon: string;
    color: string;
    parent?: mongoose.Types.ObjectId;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Category.d.ts.map