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

// Form state type where body is always a string (never null)
export interface PostFormType extends Omit<PostType, 'body'> {
  body: string;
}

