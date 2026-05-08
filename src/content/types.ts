export type DocType = "post" | "job";

export interface PostDoc {
  docType: "post";
  slug: string;
  title: string;
  description: string;
  date: string;
  published: boolean;
  tags: string[];
  places: string[];
  featuredImage?: string;
}

export interface JobDoc {
  docType: "job";
  slug: string;
  title: string;
  description: string;
  body: string;
  date: string;
  sourcePath: string;
  url?: string;
  favicon?: string;
  role: string;
  employmentType: string;
  start: string;
  end?: string;
  tech: string[];
}

export type SiteDoc = PostDoc | JobDoc;
