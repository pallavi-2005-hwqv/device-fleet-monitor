
const test = require("node:test");
const assert = require("node:assert");
const { app, devices, getDeviceStatus } = require("../src/server");

const BASE_URL = "http://localhost:3000";

// Start a temporary server for testing
let server;
let baseUrl;

test("Start test server", async () => {
    server = app.listen(0);
    await new Promise(resolve => server.once("listening", resolve));

    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
});

test("Register a new device", async () => {
    const response = await fetch(`${baseUrl}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: "test-device-01",
            name: "Test Device"
        })
    });

    assert.strictEqual(response.status, 201);

    const data = await response.json();
    assert.strictEqual(data.id, "test-device-01");
    assert.strictEqual(data.name, "Test Device");
});

test("Reject duplicate device registration", async () => {
    const response = await fetch(`${baseUrl}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: "test-device-01",
            name: "Test Device"
        })
    });

    assert.strictEqual(response.status, 409);
});

test("Receive a heartbeat and mark device ONLINE", async () => {
    const response = await fetch(
        `${baseUrl}/devices/test-device-01/heartbeat`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                status: "OK"
            })
        }
    );

    assert.strictEqual(response.status, 200);

    const data = await response.json();
    assert.strictEqual(data.status, "ONLINE");
});

test("Device without a heartbeat is OFFLINE", () => {
    const device = {
        id: "offline-test",
        name: "Offline Test",
        last_heartbeat: null,
        heartbeat_status: null
    };

    assert.strictEqual(getDeviceStatus(device), "OFFLINE");
});

test("Device becomes OFFLINE after 30 seconds", () => {
    const oldHeartbeat = new Date(Date.now() - 35000).toISOString();

    const device = {
        id: "timeout-test",
        name: "Timeout Test",
        last_heartbeat: oldHeartbeat,
        heartbeat_status: "OK"
    };

    assert.strictEqual(getDeviceStatus(device), "OFFLINE");
});

test("List devices", async () => {
    const response = await fetch(`${baseUrl}/devices`);

    assert.strictEqual(response.status, 200);

    const data = await response.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.some(device => device.id === "test-device-01"));
});

test("Return fleet summary", async () => {
    const response = await fetch(`${baseUrl}/summary`);

    assert.strictEqual(response.status, 200);

    const data = await response.json();

    assert.ok(data.total >= 1);
    assert.ok(data.online >= 0);
    assert.ok(data.offline >= 0);
    assert.strictEqual(data.total, data.online + data.offline);
});

// Close the temporary server after the tests
test("Close test server", async () => {
    await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
    });
});
