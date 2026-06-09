export type Preview = {
  file?: File;
  displayUrl: string;
};

// types/general.type.ts (atau userManagement.type.ts)
export interface UserData {
  id: string;
  email: string;
  role: string;
  nidn?: string;
  npm?: string;
  isverified: boolean;
  created_at: string;
}

export type AppModule = {
  id: number;
  name: string;
  url: string;
  sso_client?: SsoClient;
  ssoClient?: SsoClient;
  created_at?: string;
  updated_at?: string;
};

export type Role = {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
  updated_at?: string;
};

export type Permission = {
  id: number;
  name: string;
  guard_name: string;
  appModule_id: number;
  appModule?: AppModule;
  app_module?: AppModule; // support snake_case relationship from Laravel Eloquent serialization
  created_at?: string;
  updated_at?: string;
};

export type SsoClient = {
  id: number;
  name: string;
  client_id: string;
  client_secret?: string;
  callback_url: string;
  description?: string;
  allowed_module_ids?: number[];
  is_active: boolean;
  total_requests: number;
  last_used_at?: string;
  created_at?: string;
  updated_at?: string;
};
