import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { getToken } from "next-auth/jwt";

export interface AuthPayload {
  id?: string;
  _id?: string;
  uid?: string;
  email: string;
  role: "admin" | "customer" | "warehouse";
  userCode?: string;
}

export async function getAuthFromRequest(req: Request): Promise<AuthPayload | null> {
  try {
    // Method 1: Try NextAuth JWT token first
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (token && token.email && token.role) {
      return {
        id: token.id as string,
        email: token.email as string,
        role: token.role as "admin" | "customer" | "warehouse",
        userCode: token.userCode as string | undefined,
      };
    }

    // Method 2: Try Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const bearerToken = authHeader.substring(7);
      const payload = verifyToken(bearerToken);
      if (payload) return payload as AuthPayload;
    }

    // Method 3: Try cookie-based auth token
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    if (authToken) {
      const payload = verifyToken(authToken);
      if (payload) return payload as AuthPayload;
    }

    return null;
  } catch (error) {
    console.error("[Auth] Error in getAuthFromRequest:", error);
    return null;
  }
}

export function requireRole(payload: AuthPayload | null, role: string) {
  if (!payload || payload.role !== role) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

export function isWarehouseAuthorized(req: Request): boolean {
  const key = req.headers.get("x-warehouse-key") || req.headers.get("x-api-key");
  if (!key) return false;
  const allowed = getAllowedWarehouseKeys();
  return allowed.includes(key);
}

export function getAllowedWarehouseKeys(): string[] {
  const keys = process.env.WAREHOUSE_API_KEYS || "";
  return keys.split(",").filter(Boolean);
}

export function verifyWarehouseKeyFromRequest(req: Request): boolean {
  const key = req.headers.get("x-warehouse-key") || req.headers.get("x-api-key");
  if (!key) return false;
  const allowed = getAllowedWarehouseKeys();
  return allowed.includes(key);
}

export async function verifyWarehouseApiKey(
  req: Request,
  requiredPermissions?: string[]
): Promise<{ valid: boolean; keyInfo?: { keyPrefix: string; permissions: string[] } }> {
  const key = req.headers.get("x-warehouse-key") || req.headers.get("x-api-key");
  if (!key) return { valid: false };

  const allowed = getAllowedWarehouseKeys();
  if (!allowed.includes(key)) return { valid: false };

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return {
      valid: true,
      keyInfo: {
        keyPrefix: key.substring(0, 12),
        permissions: ["*"],
      },
    };
  }

  return {
    valid: true,
    keyInfo: {
      keyPrefix: key.substring(0, 12),
      permissions: ["*"],
    },
  };
}