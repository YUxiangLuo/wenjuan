import { describe, expect, test, beforeAll, afterAll } from "bun:test";

describe("Auth API", () => {
    let serverProc: any;

    beforeAll(async () => {
        // Start the server
        serverProc = Bun.spawn(["bun", "src/index.ts"], {
            env: { ...process.env, PORT: "4000" }
        });
        // Wait for server to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    afterAll(() => {
        serverProc.kill();
    });

    const BASE_URL = "http://localhost:4000";

    test("POST /api/login with valid credentials returns token", async () => {
        const res = await fetch(`${BASE_URL}/api/login`, {
            method: "POST",
            body: JSON.stringify({ username: "admin", password: "admin" })
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.token).toBeDefined();
        expect(data.user.role).toBe("admin");
    });

    test("POST /api/login with invalid credentials returns 401", async () => {
        const res = await fetch(`${BASE_URL}/api/login`, {
            method: "POST",
            body: JSON.stringify({ username: "admin", password: "wrong" })
        });
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.success).toBe(false);
    });

    test("GET /api/me without token returns 401", async () => {
        const res = await fetch(`${BASE_URL}/api/me`);
        expect(res.status).toBe(401);
    });

    test("GET /api/me with valid token returns user", async () => {
        // First login to get token
        const loginRes = await fetch(`${BASE_URL}/api/login`, {
            method: "POST",
            body: JSON.stringify({ username: "admin", password: "admin" })
        });
        const { token } = await loginRes.json();

        // Use token to get user info
        const res = await fetch(`${BASE_URL}/api/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.user.username).toBe("admin");
    });
});
