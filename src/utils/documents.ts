import { loadPost } from "@utils/getPosts";
import TechUrls from "@utils/techUrls";
import fs from "fs";

export enum DocumentType {
  jobs = "jobs",
}

interface Document {
  body: string;
}

export interface JobDocument extends Document {
  title: string;
  url: string;
  favicon?: string;
  role: string;
  type: "Contract" | "Salaried";
  start: string;
  end: string | "Present";
  tech: Array<TechUrls>;
}

// TODO should prob delete this
export const getDocuments = async (type: DocumentType) => {
  const documentsDir = await fs.promises.readdir(
    `${process.env.DOCUMENTS_DIR}/${type}`
  );

  return await Promise.all(
    documentsDir.map((file) =>
      loadPost(`${process.env.DOCUMENTS_DIR}/${type}/${file}`)
    )
  );
};
