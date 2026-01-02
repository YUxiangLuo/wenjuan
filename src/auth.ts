import * as jose from "jose";

// Secret key for JWT signing (in production, use environment variable)
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-super-secret-key-change-in-production"
);

const JWT_ISSUER = "wenjuan-app";
const JWT_EXPIRATION = "24h";

export interface JWTPayload {
    id: number;
    username: string;
    role: "admin" | "teacher" | "student";
    name: string;
}

/**
 * Sign a JWT token with user payload
 */
export async function signToken(payload: JWTPayload): Promise<string> {
    const jwt = await new jose.SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer(JWT_ISSUER)
        .setExpirationTime(JWT_EXPIRATION)
        .sign(JWT_SECRET);

    return jwt;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
            issuer: JWT_ISSUER,
        });
        return payload as unknown as JWTPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(req: Request): string | null {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.slice(7);
}

/**
 * Middleware helper: Get authenticated user from request
 */
export async function getAuthUser(req: Request): Promise<JWTPayload | null> {
    const token = extractToken(req);
    if (!token) return null;
    return verifyToken(token);
}
