export type Preview = {
  file?: File;
  displayUrl: string;
};

// types/general.type.ts (atau userManagement.type.ts)
export type UserData = {
  public_id: string;
  name: string;
  email: string;
  role: "admin" | "mahasiswa" | "dosen";
  phone: string;
  location: string;
  about_me?: string;
  nidn?: string;
  nip?: string;
  npm?: string;
  is_active: boolean;
  image?: string;
  created_at: string;
};

export type AppModuleData = {
  id: number;
  name: string;
  url: string | null;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  order: number;
  roles: string[]; // ['admin', 'mahasiswa', 'dosen']
};