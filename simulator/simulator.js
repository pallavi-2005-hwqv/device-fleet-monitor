
const BASE_URL = "http://localhost:3000";
const INTERVAL_MS = 5000;

const devices = [
    { id: "device-01", name: "Lab Device 01" },
    { id: "device-02", name: "Lab Device 02" },
    { id: "device-03", name: "Lab Device 03" },
    { id: "device-04", name: "Lab Device 04" },
    { id: "device-05", name: "Lab Device 05" }
];

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Track devices that should stop sending heartbeats
const stoppedDevices = new Set();

// Register each device before sending heartbeats
async function registerDevices() {
    for (const device of devices) {
        const response = await fetch(`${BASE_URL}/devices`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(device)
        });

        if (response.status === 409) {
            console.log(`${device.id} is already registered`);
        } else if (!response.ok) {
            throw new Error(`Could not register ${device.id}: ${response.status}`);
        } else {
            console.log(`Registered ${device.id}`);
        }
    }
}

// Send one heartbeat
async function sendHeartbeat(device) {
    if (stoppedDevices.has(device.id)) {
        return;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/devices/${device.id}/heartbeat`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    status: "OK"
                })
            }
        );

        if (!response.ok) {
            console.error(`Heartbeat failed for ${device.id}`);
            return;
        }

        console.log(`Heartbeat sent: ${device.id}`);
    } catch (error) {
        console.error(`Error sending heartbeat for ${device.id}:`, error.message);
    }
}

// Start the simulator
async function startSimulator() {
    try {
        await registerDevices();

        console.log("\nSimulator started. Sending heartbeats every 5 seconds.");
        console.log("Press Ctrl+C to stop all devices.\n");

        // Send an initial heartbeat immediately
        await Promise.all(devices.map(sendHeartbeat));

        // Continue sending heartbeats every 5 seconds
        setInterval(() => {
            devices.forEach(sendHeartbeat);
        }, INTERVAL_MS);
    } catch (error) {
        console.error("Simulator could not start:", error.message);
        process.exitCode = 1;
    }
}

rl.on("line", (input) => {
    const parts = input.trim().split(/\s+/);
    const command = parts[0];
    const deviceId = parts[1];

    if (command === "stop" && deviceId) {
        const deviceExists = devices.some(
            device => device.id === deviceId
        );

        if (!deviceExists) {
            console.log(`Unknown device: ${deviceId}`);
        } else {
            stoppedDevices.add(deviceId);
            console.log(`${deviceId} stopped sending heartbeats.`);
        }
    } else if (command === "resume" && deviceId) {
        if (devices.some(device => device.id === deviceId)) {
            stoppedDevices.delete(deviceId);
            console.log(`${deviceId} resumed sending heartbeats.`);
        } else {
            console.log(`Unknown device: ${deviceId}`);
        }
    } else {
        console.log("Commands: stop <device-id> or resume <device-id>");
    }
});

startSimulator();
