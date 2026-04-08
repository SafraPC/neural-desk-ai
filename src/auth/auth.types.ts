import { UserRole } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  username: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
}
