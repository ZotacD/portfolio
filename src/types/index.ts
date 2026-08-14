export type ProjectStatus = "draft" | "published";

export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  coverUrl: string | null;
  linkUrl: string | null;
  tags: string[];
  status: ProjectStatus;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFileRow {
  id: string;
  projectId: string;
  name: string;
  storagePath: string;
  mimeType: string | null;
  size: number | null;
  createdAt: Date;
}

export interface ProjectFileWithUrl extends ProjectFileRow {
  url: string | null;
}

export interface ProjectImageRow {
  id: string;
  projectId: string;
  storagePath: string;
  alt: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface ProjectImageWithUrl extends ProjectImageRow {
  url: string | null;
}

export interface ProfileRow {
  id: number;
  name: string | null;
  title: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  social: Record<string, string>;
  updatedAt: Date;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface AdminStats {
  total: number;
  published: number;
  drafts: number;
  files: number;
}
