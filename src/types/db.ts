import type {
  Account,
  Session,
  User,
  Verification,
} from "better-auth";

export interface AuthUserTable {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  image: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthSessionTable {
  id: string;
  expires_at: Date;
  token: string;
  created_at: Date;
  updated_at: Date;
  ip_address: string | null;
  user_agent: string | null;
  user_id: string;
}

export interface AuthAccountTable {
  id: string;
  account_id: string;
  provider_id: string;
  user_id: string;
  access_token: string | null;
  refresh_token: string | null;
  id_token: string | null;
  access_token_expires_at: Date | null;
  refresh_token_expires_at: Date | null;
  scope: string | null;
  password: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AuthVerificationTable {
  id: string;
  identifier: string;
  value: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DB {
  user: AuthUserTable;
  session: AuthSessionTable;
  account: AuthAccountTable;
  verification: AuthVerificationTable;
}

export type { User, Session, Account, Verification };
