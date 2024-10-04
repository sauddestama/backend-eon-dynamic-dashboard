import mongoose, { Schema, Document } from "mongoose";

interface PagePermission {
  pageId: mongoose.Types.ObjectId;
  actions: {
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface IRole extends Document {
  name: string;
  pagePermissions: PagePermission[];
}

const RoleSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  pagePermissions: [
    {
      pageId: { type: mongoose.Schema.Types.ObjectId, ref: "Page" },
      actions: {
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
    },
  ],
});

export default mongoose.model<IRole>("Role", RoleSchema);
