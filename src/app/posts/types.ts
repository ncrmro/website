export interface PostType {
  id: string;
  title: string;
  description: string;
  body: string;
  slug: string;
  published: boolean;
  publishDate: string | null;
  tags: { id: string; value: string }[];
}
