export type ProjectStatus = "draft" | "published";

export interface ProjectRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  description: string | null;
  cover_url: string | null;
  link_url: string | null;
  tags: string[];
  status: ProjectStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFileRow {
  id: string;
  project_id: string;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size: number | null;
  created_at: string;
}

export interface ProjectFileWithUrl extends ProjectFileRow {
  url: string | null;
}

export interface ProjectImageRow {
  id: string;
  project_id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
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
  updated_at: string;
}

export interface AdminStats {
  total: number;
  published: number;
  drafts: number;
  files: number;
}
