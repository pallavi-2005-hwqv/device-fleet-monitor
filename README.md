
# Mini Device Fleet Monitor

## Overview

The Mini Device Fleet Monitor is a Node.js and Express application that monitors the status of registered devices using periodic heartbeats.

Devices send heartbeats every 5 seconds through a simulator. The server records the latest heartbeat and determines whether each device is ONLINE or OFFLINE.

A device is considered ONLINE when its latest heartbeat was received within the last 30 seconds. Otherwise, it is considered OFFLINE.

## Features

- Register devices with a unique ID and name.
- Receive and record device heartbeats.
- Automatically determine device status using a 30-second timeout.
- List all registered devices and their current status.
- Retrieve details for an individual device.
- View a summary of total, online, and offline devices.
- Simulate five devices sending heartbeats every 5 seconds.
- Stop and resume individual simulated devices.
- Run automated tests for the main API functionality.


## Architecture

The application follows a simple client-server architecture.

- **Express server (`src/server.js`):** Handles API requests, registers devices, processes heartbeats, calculates device status, and provides device information and fleet summaries.
- **In-memory storage:** A JavaScript Map stores registered devices and their latest heartbeat information.
- **Device simulator (`simulator/simulator.js`):** Simulates five devices by registering them and sending heartbeats every 5 seconds. Individual devices can be stopped or resumed through terminal commands.
- **Automated tests (`test/server.test.js`):** Uses Node.js's built-in test runner to verify registration, heartbeat processing, device status, timeout behavior, and API responses.

### How Device Status Is Calculated

1. When a device is registered, its last heartbeat is empty, so its status is OFFLINE.
2. When a heartbeat is received, the server records the current server time.
3. If the last heartbeat was received within 30 seconds, the device is ONLINE.
4. If more than 30 seconds have passed since the last heartbeat, the device is OFFLINE.

## Technologies Used

- JavaScript
- Node.js
- Express.js
- Node.js built-in test runner
- Fetch API for simulator requests

## Prerequisites

- Node.js installed
- npm installed
- A code editor such as Visual Studio Code

## Setup and Installation

1. Clone or download this repository.
2. Open a terminal in the project directory.
3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open another terminal in the project directory and start the simulator:

   ```bash
   node simulator/simulator.js
   ```

6. The simulator registers five devices and sends heartbeats every 5 seconds.

## Running Automated Tests

Run the following command:

```bash
npm test
```

The tests verify device registration, duplicate registration, heartbeat processing, online/offline status, timeout behavior, device listing, and fleet summary.


## API Documentation

The server runs at `http://localhost:3000`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/devices` | Register a new device |
| POST | `/devices/:id/heartbeat` | Record a device heartbeat |
| GET | `/devices` | List all devices and their current statuses |
| GET | `/devices/:id` | Retrieve details of a specific device |
| GET | `/summary` | Retrieve total, online, and offline device counts |

### 1. Register a Device

**Request:** `POST /devices`

Example request body:

```json
{
  "id": "device-01",
  "name": "Lab Device 01"
}
```

A successful registration returns HTTP `201 Created`. Duplicate device IDs return HTTP `409 Conflict`.

### 2. Send a Heartbeat

**Request:** `POST /devices/device-01/heartbeat`

Example request body:

```json
{
  "timestamp": "2026-10-10T10:00:00.000Z",
  "status": "OK"
}
```

A successful heartbeat returns HTTP `200 OK` and includes the device's latest heartbeat time and calculated status.

### 3. List All Devices

**Request:** `GET /devices`

Returns a list of registered devices, including their names, last heartbeat times, heartbeat status values, and calculated ONLINE/OFFLINE statuses.

### 4. Get a Device's Details

**Request:** `GET /devices/device-01`

Returns details for the requested device. If the device does not exist, the server returns HTTP `404 Not Found`.

### 5. Get Fleet Summary

**Request:** `GET /summary`

Example response:

```json
{
  "total": 5,
  "online": 4,
  "offline": 1
}
```

The counts reflect the current calculated status of all registered devices.


## Assumptions

- Every device has a unique ID.
- Devices send heartbeats periodically to indicate that they are active.
- A device is ONLINE if its most recent heartbeat was received within the last 30 seconds.
- A device without a heartbeat is considered OFFLINE.
- The server's receipt time is used to determine the latest heartbeat time.
- The simulator uses five sample devices to demonstrate device monitoring.
- Device information is stored in memory during application execution.

## Limitations

- Device information is lost when the server restarts because persistent storage is not implemented.
- The application does not use authentication or authorization.
- The simulator and server must be running separately.
- The application is intended as a small proof of concept and has not been optimized for large device fleets.
- Heartbeat status values are accepted as strings rather than being restricted to a predefined set of values.

## Future Improvements

- Add persistent storage using SQLite or PostgreSQL.
- Introduce authentication and authorization for device registration and heartbeat requests.
- Add input validation and more detailed error handling.
- Build a dashboard to visualize device status and heartbeat history.
- Add structured logging and monitoring.
- Support configurable heartbeat intervals and timeout thresholds.
- Add integration tests for additional error cases and concurrent requests.

## AI Usage

AI assistance was used to help understand the requirements, plan the application structure, develop parts of the implementation, troubleshoot errors, and organize the project documentation.

The implementation and its behavior were tested locally, including device registration, heartbeat simulation, online/offline timeout handling, fleet summary, and automated tests.

