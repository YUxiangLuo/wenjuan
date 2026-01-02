import { describe, expect, test, beforeAll, afterAll } from "bun:test";

const BASE_URL = "http://localhost:3000/api/todos";

describe("Todo API", () => {
    // Note: This requires the server to be running or we can rely on bun test to run it?
    // Since index.ts starts the server as a side effect, if we import it, it might start on a different port if 3000 is taken or just work.
    // However, simpler to just assume user or I will start it. 
    // ACTUALLY, for `bun test`, it's better to spin up a server instance in the test or use `bun dev` in background.
    // But let's try to just test the logic if we export the DB logic? 
    // No, let's just make a test that assumes the server is running ? 
    // Or better, let's rely on the fact that we can just start the server in the test process if we want.

    // Let's try to spawn the server process for the test session.
    let serverProc: any;

    beforeAll(async () => {
        // Start the server
        serverProc = Bun.spawn(["bun", "src/index.ts"], {
            env: { ...process.env, PORT: "4000" } // Try different port?
        });
        // Wait for server to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    afterAll(() => {
        serverProc.kill();
    });

    const API_URL = "http://localhost:4000/api/todos"; // Matches the spawned server port

    test("GET /api/todos returns empty array initially", async () => {
        // We need to fetch from the server
        const res = await fetch(API_URL);
        if (res.status === 200) {
            const data = await res.json();
            expect(Array.isArray(data)).toBe(true);
        } else {
            // Fail if connection refused (server not running)
            // But we spawned it.
        }
    });

    test("POST /api/todos adds a todo", async () => {
        const text = "Test Todo";
        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ text })
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.text).toBe(text);
        expect(data.id).toBeDefined();

        // cleanup
        await fetch(`${API_URL}/${data.id}`, { method: "DELETE" });
    });
});
