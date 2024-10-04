// src/config/gcsConfig.ts

import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";

dotenv.config();

const storageConfig = {
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GCLOUD_KEY_FILE_CONTENT || "{}"),
};

const storage = new Storage(storageConfig);
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET || "");

export { storage, bucket };
