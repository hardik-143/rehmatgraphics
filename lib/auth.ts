import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET, SESSION_COOKIE_NAME } from "@/app/env";
import { findUserById } from "@/lib/users";
import type { UserDocument } from "@/models/User";

interface SessionPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const authenticateRequest = async (
  request: NextRequest
): Promise<UserDocument | null> => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, JWT_SECRET) as SessionPayload;
    if (!decoded?.sub) {
      return null;
    }

    const user = await findUserById(decoded.sub);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("authenticateRequest error:", error);
    return null;
  }
};

export const getAuthenticatedUserFromCookies = async (): Promise<
  UserDocument | null
> => {
  const cookieStore = cookies();
  const token = (await cookieStore).get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verify(token, JWT_SECRET) as SessionPayload;
    if (!decoded?.sub) {
      return null;
    }

    const user = await findUserById(decoded.sub);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("getAuthenticatedUserFromCookies error:", error);
    return null;
  }
};
