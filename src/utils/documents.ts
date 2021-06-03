import { getMetadata } from "@utils/markdown";

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
  tech: string[];
}

export const getDocuments = (type: DocumentType): Array<Record<any, any>> => {
  const fs = require("fs");
  const documentsDir = `${process.env.DOCUMENTS_DIR}/${type}`;
  let documents = [];
  fs.readdirSync(documentsDir).forEach((file) => {
    file = `${documentsDir}/${file}`;
    if (file.includes(".md")) {
      const content = fs.readFileSync(file, "utf8");
      const { body, attributes } = getMetadata(content);
      documents.push({
        ...attributes,
        body,
      });
    }
  });

  return documents;
};
