import { User } from "../../user/models/user.model";

export interface Session {
  id: number;
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string | null;
  isRevoked: boolean;
  previousSessionId: number | null;
  updatedAt: string;

  user?: User;
}
