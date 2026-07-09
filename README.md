# Aadhaar OCR System

A high-performance MERN-stack web application designed to perform local Optical Character Recognition (OCR) on Aadhaar card images (front & back). The backend is developed using Node.js, Express, and Mongoose with TypeScript, fully structured around **CLEAN Architecture** and **SOLID Principles**. The frontend is powered by React with Vite and TypeScript, featuring a premium dark-themed glassmorphism interface.

---

## Technical Specifications

- **Frontend:** React, TypeScript, Vite, Axios, Lucide Icons, Custom CSS layouts.
- **Backend:** Node.js, Express.js, TypeScript, Mongoose, Multer, Tesseract.js.
- **Database:** MongoDB.
- **Aesthetics:** Vibrant dark theme, glassmorphism panels, custom interactive micro-animations (e.g., laser scanner lines).

---

## 4-Layer CLEAN Architecture

The source code under `backend/src/` is partitioned strictly into four layers:

1. **domain:** Holds core business entities (`Aadhaar.ts`) and repository interfaces (`IAadhaarRepository.ts`). Zero external dependencies.
2. **application:** Houses core orchestrator use cases (`ProcessAadhaarOCR.ts`, `GetAadhaarHistory.ts`), service abstractions (`IOCRService.ts`), unified DTOs, and mapping logic.
3. **presentation:** Handles Express controllers and routes, routing requests to the application layer.
4. **infrastructure:** Plugs in database drivers (Mongoose schemas), file upload helpers (Multer), local OCR engine (Tesseract.js), application settings, and Express initializers (`app.ts`).

The server entrypoint (`server.ts`) sits outside the `src/` folder at the root level of `backend/`.

---

## Project Structure

```
aadharOCRSystem/
├── backend/                            # Node.js + Express backend
│   ├── src/
│   │   ├── domain/                     # Entities & repository interfaces
│   │   ├── application/                # Use cases, DTOs, mappers, service interfaces
│   │   ├── presentation/               # Controllers & routers
│   │   └── infrastructure/             # Mongoose schemas/repositories, uploads static path, Express setup
│   ├── uploads/                        # Uploaded image files storage (auto-created)
│   ├── server.ts                       # Backend entry point
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                           # React + Vite frontend
    ├── src/
    │   ├── assets/
    │   ├── App.tsx                     # Main layout & states
    │   ├── index.css                   # Responsive layouts & animations
    │   └── main.tsx
    ├── tsconfig.json
    └── package.json
```

---

## Running the Application

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally (e.g. `mongodb://localhost:27017`) or a MongoDB Atlas connection string.

### 1. Start MongoDB

Ensure MongoDB is running locally on port `27017`.

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will launch on `http://localhost:5000`.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will launch on `http://localhost:5173`. Open this URL in your browser.

---

## Verification & Testing

1. Navigate to `http://localhost:5173`.
2. Drag and drop or select the **front side** and **back side** images of an Aadhaar card.
3. Click **PARSE AADHAAR**.
4. The scanner line animation will trigger while Tesseract.js processes the text in the backend.
5. The extracted parameters (Name, UID, DOB, Gender, Address, Pincode) and the raw JSON will display side-by-side.
6. The record will be successfully written to MongoDB and will appear in the **OCR Audit History Logs** at the bottom.

================

Render backend url : https://aadhar-ocr-backend-wy9n.onrender.com

vercel frontend : https://aadhar-ocr-system-five.vercel.app/
