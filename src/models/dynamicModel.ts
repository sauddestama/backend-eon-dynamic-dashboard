import mongoose from "mongoose";
import Page, { IPage } from "./Page";

class DynamicModelCreator {
  private static models: { [key: string]: mongoose.Model<any> } = {};

  static async getModel(pageUrl: string): Promise<mongoose.Model<any>> {
    const normalizedUrl = `/${pageUrl.toLowerCase()}`;

    if (this.models[normalizedUrl]) {
      return this.models[normalizedUrl];
    }

    const page = await Page.findOne({ url: normalizedUrl });
    if (!page) {
      throw new Error(`Page with URL ${normalizedUrl} not found`);
    }

    const schemaDefinition: mongoose.SchemaDefinition = {};
    page.fields.forEach((field) => {
      let schemaType: any;
      switch (field.fieldType) {
        case "Text":
          schemaType = String;
          break;
        case "File":
          schemaType = String;
          break;
        default:
          schemaType = String;
      }
      schemaDefinition[field.fieldName] = schemaType;
    });

    const schema = new mongoose.Schema(schemaDefinition, {
      timestamps: true,
      collection: page.collectionName, // Menggunakan nama koleksi yang sudah ada
    });

    const modelName = `Dynamic${page.name.replace(/\s+/g, "")}`;
    // Menggunakan model yang sudah ada jika tersedia
    if (mongoose.models[modelName]) {
      this.models[normalizedUrl] = mongoose.models[modelName];
    } else {
      this.models[normalizedUrl] = mongoose.model(modelName, schema);
    }

    return this.models[normalizedUrl];
  }
}

export default DynamicModelCreator;
