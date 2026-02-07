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
  APP_SECRET=your_32_char_secret_key_here
  MONGO_URI=mongodb://localhost:27017/timeseries
  LISTENER_URL=http://localhost:3000

Installation
--------------------
  Start Docker DB -> docker-compose up --build
  Start listner Services -> npm install && npm run dev:listener
  Start Emitter Service -> npm run dev:emitter
  Start Frontend -> cd frontend && ng serve
  Test -> npm test



