import fs from "fs";
import React from "react";
import fm, { FrontMatterResult } from "front-matter";

export interface PostAttributes {
  slug: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  description: string;
  tags: Array<string>;
}

export const getMetadata = (
  markdown: string
): FrontMatterResult<PostAttributes> => fm(markdown);

export interface Post extends PostAttributes {
  content: string;
}
