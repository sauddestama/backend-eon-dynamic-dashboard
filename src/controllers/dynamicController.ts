import { Request, Response } from "express";
import mongoose from "mongoose";
import Page from "../models/Page";
import { AppError } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";
import DynamicModelCreator from "../models/dynamicModel";
import { bucket } from "../config/gcsConfig";
import { format } from "util";

export const getItemDinamisByPageUrl = async (req: Request, res: Response) => {
  try {
    const { pageUrl } = req.params;

    const page = await Page.findOne({ url: `/${pageUrl.toLowerCase()}` });
    if (!page) {
      throw new AppError(`Page with URL ${pageUrl} not found`, 404);
    }

    const DynamicModel = await DynamicModelCreator.getModel(pageUrl);
    const items = await DynamicModel.find();

    res.json({ fields: page.fields, data: items });
  } catch (error) {
    console.error("Error fetching items by page URL:", error);
    res.status(500).json({ message: "An error occurred while fetching items" });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const { pageUrl } = req.params;

    const page = await Page.findOne({ url: `/${pageUrl.toLowerCase()}` });
    if (!page) {
      throw new AppError(`Page with URL ${pageUrl} not found`, 404);
    }

    const DynamicModel = await DynamicModelCreator.getModel(pageUrl);

    const itemData: any = {};
    const fileUploadPromises: Promise<void>[] = [];

    for (const field of page.fields) {
      if (
        field.fieldType === "File" &&
        req.files &&
        Array.isArray(req.files) &&
        req.files.length > 0
      ) {
        const file = req.files.find((f) => f.fieldname === field.fieldName);
        if (file) {
          const sanitizedOriginalname = file.originalname.replace(/\s+/g, "-");
          const fileName = `${uuidv4()}-${sanitizedOriginalname}`;

          const uploadPromise = new Promise<void>((resolve, reject) => {
            const blob = bucket.file(fileName);
            const blobStream = blob.createWriteStream();

            blobStream.on("error", (err) => {
              reject(
                new Error(
                  `Unable to upload image, something went wrong: ${err}`
                )
              );
            });

            blobStream.on("finish", () => {
              // The public URL can be used to directly access the file via HTTP.
              const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
              );
              itemData[field.fieldName] = publicUrl;
              resolve();
            });

            blobStream.end(file.buffer);
          });

          fileUploadPromises.push(uploadPromise);
        }
      } else {
        itemData[field.fieldName] = req.body[field.fieldName];
      }
    }

    // Wait for all file uploads to complete
    await Promise.all(fileUploadPromises);

    const newItem = new DynamicModel(itemData);
    const savedItem = await newItem.save();

    res.status(201).json({
      message: "Item created successfully",
      item: savedItem,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({
      message: "An error occurred while creating the item",
      error: (error as Error).message,
    });
  }
};

// Perbarui fungsi updateItem, deleteItem, dan getItemById dengan cara yang sama
// menggunakan DynamicModelCreator.getModel(pageUrl) untuk mendapatkan model yang sesuai
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { pageUrl, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid ID format", 400);
    }

    const page = await Page.findOne({ url: `/${pageUrl.toLowerCase()}` });
    if (!page) {
      throw new AppError(`Page with URL ${pageUrl} not found`, 404);
    }

    const DynamicModel = await DynamicModelCreator.getModel(pageUrl);

    const updateData = { ...req.body };
    delete updateData._id;

    const updatedItem = await DynamicModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedItem) {
      throw new AppError(`Item with ID ${id} not found`, 404);
    }

    res.json({ message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred while updating the item" });
    }
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { pageUrl, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid ID format", 400);
    }

    const page = await Page.findOne({ url: `/${pageUrl.toLowerCase()}` });
    if (!page) {
      throw new AppError(`Page with URL ${pageUrl} not found`, 404);
    }

    const DynamicModel = await DynamicModelCreator.getModel(pageUrl);

    const deletedItem = await DynamicModel.findByIdAndDelete(id);

    if (!deletedItem) {
      throw new AppError(`Item with ID ${id} not found`, 404);
    }

    // Delete associated files from Google Cloud Storage
    for (const field of page.fields) {
      if (field.fieldType === "File" && deletedItem[field.fieldName]) {
        const fileName = deletedItem[field.fieldName].split("/").pop();
        try {
          await bucket.file(fileName).delete();
        } catch (err) {
          console.error(`Error deleting file from GCS: ${err}`);
        }
      }
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred while deleting the item" });
    }
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const { pageUrl, id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid ID format", 400);
    }

    const page = await Page.findOne({ url: `/${pageUrl.toLowerCase()}` });
    if (!page) {
      throw new AppError(`Page with URL ${pageUrl} not found`, 404);
    }

    const DynamicModel = await DynamicModelCreator.getModel(pageUrl);

    const item = await DynamicModel.findById(id);

    if (!item) {
      throw new AppError(`Item with ID ${id} not found`, 404);
    }

    res.json({ message: "Item found", item });
  } catch (error) {
    console.error("Error getting item by ID:", error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred while fetching the item" });
    }
  }
};
