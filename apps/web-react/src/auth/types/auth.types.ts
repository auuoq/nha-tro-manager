export interface LoginPayload {
  phone: string;
  passwordHash: string;
}

export interface UserDTO {
  id: string;
  phone: string;
  email: string | null;
  fullName: string;
  role: "SUPER_ADMIN" | "OWNER" | "TENANT";
  isActive: boolean;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}
