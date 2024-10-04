import mongoose, { Schema, Document } from "mongoose";

export interface IField {
  fieldName: string;
  fieldType: string;
}

export interface IPage extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  collectionName: string;
  fields: IField[];
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  collectionName: { type: String, required: true, unique: true },
  fields: [
    {
      fieldName: { type: String, required: true },
      fieldType: { type: String, required: true },
    },
  ],
  url: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPage>("Page", PageSchema);
