import { createContext } from "react";
import { UserDTO } from "../types/auth.types";

export interface AuthContextType {
  user: UserDTO | null;
  loading: boolean;
  login: (phone: string, passwordHash: string) => Promise<UserDTO>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserDTO | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
