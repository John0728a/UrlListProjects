import { Timestamp } from 'firebase/firestore';

export interface LinkItem {
  id: string;
  url: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  customTitle: string | null;
  customDescription: string | null;
  order: number;
}

export interface LinkList {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  description: string;
  items: LinkItem[];
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SlugEntry {
  listId: string;
}
