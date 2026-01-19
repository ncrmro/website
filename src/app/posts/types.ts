export interface PostType {
  id: string;
  title: string;
  description: string;
  body: string | null;
  slug: string;
  published: boolean;
  publishDate: string | null;
  tags: { id: string; value: string }[];
}
