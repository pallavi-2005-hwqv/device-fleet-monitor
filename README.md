# Mini Device Fleet Monitor

## Overview

The Mini Device Fleet Monitor is a Node.js and Express application that monitors registered devices using periodic heartbeats.

Devices send heartbeats every 5 seconds through a simulator. The server records the latest heartbeat and determines whether each device is `ONLINE` or `OFFLINE`.

A device is considered `ONLINE` when its latest heartbeat was received within the last 30 seconds. Otherwise, it is considered `OFFLINE`.

## Features

- Register devices with a unique ID and name.
- Receive and record device heartbeats.
- Automatically determine device status using a 30-second timeout.
- List all registered devices and their current status.
- Retrieve details for an individual device.
- View a summary of total, online, and offline devices.
- Simulate five devices sending heartbeats every 5 seconds.
- Stop and resume individual simulated devices.
- Display device information through a web dashboard.
- Filter devices by their current status.
- Run automated tests for the main API functionality.

## Architecture

The application follows a simple client-server architecture.

- **Express server (`src/server.js`):** Handles API requests, registers devices, processes heartbeats, calculates device status, and provides device information and fleet summaries.
- **In-memory storage:** A JavaScript `Map` stores registered devices and their latest heartbeat information.
- **Device simulator (`simulator/simulator.js`):** Simulates five devices by registering them and sending heartbeats every 5 seconds. Individual devices can be stopped or resumed through terminal commands.
- **Web dashboard (`public/index.html`):** Displays fleet statistics, device details, heartbeat timestamps, and status filters.
- **Automated tests (`test/server.test.js`):** Uses Node.js's built-in test runner to verify registration, heartbeat handling, status calculation, timeout behavior, and API responses.

### How Device Status Is Calculated

1. When a device is registered, its last heartbeat is empty, so its status is `OFFLINE`.
2. When a heartbeat is received, the server records the current server time.
3. If the latest heartbeat was received within the last 30 seconds, the device is `ONLINE`.
4. If more than 30 seconds have passed since the last heartbeat, the device is `OFFLINE`.

## Technologies Used

- JavaScript
- Node.js
- Express.js
- HTML and CSS for the dashboard
- Fetch API for simulator requests
- Node.js built-in test runner (`node:test`)

## Prerequisites

Before running the project, install:

- Node.js
- npm (included with Node.js)
- Git
- A code editor such as Visual Studio Code

Verify the installations:

```bash
node --version
npm --version
git --version
```

## Setup and Installation

### Clone the Repository

```bash
git clone https://github.com/pallavi-2005-hwqv/device-fleet-monitor.git
cd device-fleet-monitor
```

### Install Dependencies

```bash
npm install
```

### Build the Application

No separate build step is required. The application runs directly using Node.js after the dependencies are installed.

### Run the Application

Open a terminal in the project directory and start the server:

```bash
npm start
```

The server runs at:

`http://localhost:3000`

Open this URL in your browser to access the web dashboard.

### Run the Device Simulator

Open a second terminal in the project directory and run:

```bash
node simulator/simulator.js
```

The simulator registers five devices and sends heartbeats every 5 seconds. Keep the server running while using the simulator.

The simulator supports the following commands:

```text
stop device-03
resume device-03
```

- `stop device-03` stops heartbeat transmission for the specified device.
- `resume device-03` resumes heartbeat transmission for the specified device.

To verify offline detection, stop a device and wait more than 30 seconds. Its status should change to `OFFLINE`. Resume the device and wait for the next heartbeat to see it return to `ONLINE`.

Press `Ctrl+C` in the relevant terminal to stop the server or simulator.

**Note:** Device information is stored in memory. Restarting the server clears the registered devices, so restart the simulator after restarting the server.

## Running Automated Tests

Run the following command from the project directory:

```bash
npm test
```

The tests cover:

- Device registration.
- Duplicate device registration.
- Heartbeat processing.
- Device status calculation.
- The 30-second timeout behavior.
- Listing registered devices.
- Fleet summary calculations.
- Relevant API error cases.

The test suite was run locally and passed with **9 tests passing and 0 failures**.

## API Documentation

The API base URL is:

`http://localhost:3000`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/devices` | Register a new device |
| POST | `/devices/:id/heartbeat` | Record a device heartbeat |
| GET | `/devices` | List all devices and their current statuses |
| GET | `/devices/:id` | Retrieve details of a specific device |
| GET | `/summary` | Retrieve total, online, and offline device counts |

### 1. Register a Device

**Request:** `POST /devices`

Example request using `curl`:

```bash
curl -X POST http://localhost:3000/devices \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"device-06\",\"name\":\"Lab Device 06\"}"
```

A successful registration returns HTTP `201 Created`. Duplicate device IDs return HTTP `409 Conflict`. Invalid required fields return HTTP `400 Bad Request`.

### 2. Send a Heartbeat

**Request:** `POST /devices/device-06/heartbeat`

Example request body:

```json
{
  "timestamp": "2026-10-10T10:00:00.000Z",
  "status": "OK"
}
```

A successful heartbeat returns HTTP `200 OK` and includes the device ID, recorded heartbeat time, heartbeat status, and calculated device status.

The timestamp must be a valid date string. The server records its own receipt time to determine whether the device is online.

### 3. List All Devices

**Request:** `GET /devices`

```bash
curl http://localhost:3000/devices
```

Returns all registered devices, including their names, heartbeat information, and calculated `ONLINE` or `OFFLINE` statuses.

### 4. Get a Device's Details

**Request:** `GET /devices/device-06`

```bash
curl http://localhost:3000/devices/device-06
```

Returns the details and current status of the requested device. If the device does not exist, the server returns HTTP `404 Not Found`.

### 5. Get the Fleet Summary

**Request:** `GET /summary`

```bash
curl http://localhost:3000/summary
```

Example response:

```json
{
  "total": 5,
  "online": 4,
  "offline": 1
}
```

The counts depend on the number of registered devices and their current statuses.

**Note:** Register `device-06` before sending the example heartbeat. If it is already registered, use a different unique ID or restart the server before repeating the registration example.

## Assumptions

- Every device has a unique ID.
- Devices send periodic heartbeats to indicate that they are active.
- A device is `ONLINE` if its most recent heartbeat was received within the last 30 seconds.
- A device without a heartbeat is considered `OFFLINE`.
- The server's receipt time is used to determine the latest heartbeat time.
- The simulator uses five sample devices to demonstrate device monitoring.
- Device information is stored in memory during application execution.

## Additional Features Implemented

- **Web dashboard and device status filtering:** Displays total, online, and offline device counts, device details, and heartbeat timestamps. Users can filter the device table to show all devices, online devices only, or offline devices only.
- **Interactive device simulator:** Simulates five devices sending heartbeats every 5 seconds. Individual devices can be stopped and resumed to demonstrate offline detection.

## Limitations

- Device information is lost when the server restarts because persistent storage is not implemented.
- The application does not use authentication or authorization.
- The server and simulator must be run separately.
- The application is intended as a small proof of concept and has not been optimized for large device fleets.
- Heartbeat status values are accepted as non-empty strings rather than being restricted to predefined values.
- The server port and heartbeat timeout are configured directly in the source code.
- The application does not maintain a historical record of heartbeats.

## Improvements With One Additional Day

If one additional day were available, I would prioritize the following improvements:

- **Persistent storage:** Add SQLite so device records can survive server restarts.
- **Improved validation:** Restrict heartbeat status values to an agreed set and improve error responses.
- **Configuration:** Move the server port and heartbeat timeout into environment variables.
- **Testing:** Add more tests for invalid inputs, unknown devices, and concurrent requests.
- **Logging:** Add structured logs for device registration, heartbeat reception, and errors.
- **Deployment:** Add Docker support to simplify setup and execution.

## AI Usage

AI assistance was used during development and documentation.

- **Tool used:** ChatGPT.
- **How it was used:** To understand the requirements, plan the application structure, assist with implementation and debugging, and improve project documentation.
- **Example of a design decision reviewed:** The heartbeat request contains a timestamp, but the server records its own receipt time for online/offline calculations. This avoids relying on the timestamp supplied by the simulator to determine device liveness.
- **Personal verification:** I ran the automated tests and manually verified device registration, heartbeat simulation, dashboard functionality, and the 30-second offline detection behavior.

AI-assisted code was reviewed and tested against the project requirements before submission. I am responsible for understanding and validating the implementation.
