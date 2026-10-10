
const express = require("express");

const app = express();
const PORT = 3000;
const TIMEOUT_MS = 30 * 1000;

// Allow JSON request bodies
app.use(express.json());
app.use(express.static("public"));
// Store devices in memory
const devices = new Map();

// Calculate the current status of a device
function getDeviceStatus(device) {
    if (!device.last_heartbeat) {
        return "OFFLINE";
    }

    const lastHeartbeatTime = Date.parse(device.last_heartbeat);
    const currentTime = Date.now();

    if (currentTime - lastHeartbeatTime <= TIMEOUT_MS) {
        return "ONLINE";
    }

    return "OFFLINE";
}

// Test endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Mini Device Fleet Monitor is running!"
    });
});

// Register a device
app.post("/devices", (req, res) => {
    const { id, name } = req.body;

    if (
        typeof id !== "string" ||
        !id.trim() ||
        typeof name !== "string" ||
        !name.trim()
    ) {
        return res.status(400).json({
            error: "Device ID and name are required"
        });
    }

    if (devices.has(id)) {
        return res.status(409).json({
            error: "Device already exists"
        });
    }

    const device = {
        id,
        name,
        last_heartbeat: null,
        heartbeat_status: null
    };

    devices.set(id, device);

    res.status(201).json(device);
});

// Receive a heartbeat
app.post("/devices/:id/heartbeat", (req, res) => {
    const { id } = req.params;
    const { timestamp, status } = req.body;

    const device = devices.get(id);

    if (!device) {
        return res.status(404).json({
            error: "Device not found"
        });
    }

    if (
        typeof timestamp !== "string" ||
        !timestamp.trim() ||
        Number.isNaN(Date.parse(timestamp)) ||
        typeof status !== "string" ||
        !status.trim()
    ) {
        return res.status(400).json({
            error: "A valid timestamp and status are required"
        });
    }

    // Record when the server receives the heartbeat
    device.last_heartbeat = new Date().toISOString();
    device.heartbeat_status = status;

    res.status(200).json({
        message: "Heartbeat received successfully",
        id: device.id,
        last_heartbeat: device.last_heartbeat,
        heartbeat_status: device.heartbeat_status,
        status: getDeviceStatus(device)
    });
});

// List all devices and their current status
app.get("/devices", (req, res) => {
    const result = Array.from(devices.values()).map(device => ({
        ...device,
        status: getDeviceStatus(device)
    }));

    res.json(result);
});

// Get details of one device
app.get("/devices/:id", (req, res) => {
    const device = devices.get(req.params.id);

    if (!device) {
        return res.status(404).json({
            error: "Device not found"
        });
    }

    res.json({
        ...device,
        status: getDeviceStatus(device)
    });
});

 // Get a summary of the fleet
app.get("/summary", (req, res) => {
    const allDevices = Array.from(devices.values());

    const total = allDevices.length;

    const online = allDevices.filter(
        device => getDeviceStatus(device) === "ONLINE"
    ).length;

    const offline = total - online;

    res.json({
        total,
        online,
        offline
    });
});


// Start the server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

module.exports = { app, devices, getDeviceStatus };
