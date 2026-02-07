// Prisma Client generated types
// Auto-generated - do not edit manually

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  password: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface Model {
  id: string;
  name: string;
  description: string | null;
  power?: string;
  depth?: string;
  weight?: string;
  bucket?: string;
  price: string;
  featured: boolean;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  url: string;
  alt: string | null;
  modelId: string;
  createdAt: Date;
}
