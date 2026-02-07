Encrypted Time-series System
----------------------------------


This project demonstrate secure data transmission, data intregity verification, and optimized time-series storage.  

1- Security: Each message is hashed using SHA-256 before encryption using secret_key.
2- Encryption: Used AES-256-CTR to encrypt every message with a unique initialization vector(IV) .[Format : iv:encryptedData]
3- Database: This app Bucket Pattern, instead of a document-per-second approach. Data grouped  into documents by the minute helps
   reduce indexsize and faster aggregation queries. Used findOneAndUPdate with $push and $inc for atomic and thread-safe db updates.

Prerequisites
----------------
  > Node.js v24+
  > Docker Desktop
  > Angular CLI

Environment Setup
-------------------- 
# App Details
Port=3000
APP_NAME=Encrypted-Timeseries
Version=1.0.0

# App Secret Key
APP_SECRET=your-32-char-very-secret-pass-key

# DB URI
MONGO_URI=mongodb://localhost:27017/timeseries

# Listener URL
LISTENER_URL=http://localhost:3000

# Socket.IO Reconnection Settings
RECONNECTION_ENABLED=true
RECONNECTION_DELAY=3000
RECONNECTION_ATTEMPTS=5
RECONNECTION_DELAY_MAX=9000
RECONNECTION_TIMEOUT=21000

Installation
--------------------
  Start Docker DB -> docker-compose up --build
  Start listner Services -> npm install && npm run dev:listener
  Start Emitter Service -> npm run dev:emitter
  Start Frontend -> npm run dev:frontend
  Test -> npm test



