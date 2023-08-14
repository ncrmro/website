export interface PostType {
  id: string;
  title: string;
  description: string;
  body: string;
  slug: string;
  published: number;
  publish_date: string | null;
}
