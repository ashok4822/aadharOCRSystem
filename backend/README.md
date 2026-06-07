# Aadhaar OCR System - Backend

This is the Express-based TypeScript backend engine for the Aadhaar OCR System, built using **CLEAN Architecture** and **SOLID Principles**.

---

## Folder Architecture

All files are strictly organized inside 4 layers:
- **`src/domain`**: Zero-dependency layer representing core business rules. Contains `Aadhaar.ts` entities and `IAadhaarRepository.ts` interface contracts.
- **`src/application`**: Houses use-case logic and core utility abstractions:
  - `ProcessAadhaarOCR.ts`: Runs OCR and handles regular expression data parsing.
  - `GetAadhaarHistory.ts`: Fetches logs from MongoDB.
  - `dtos/`: Unified data transfer objects.
  - `mappers/`: Unified mappings between Database models, Entities, and DTOs.
  - `services/`: Interfaces for helper services (e.g. `IOCRService`).
- **`src/presentation`**: Interfaces with the outside web layer:
  - `controllers/`: Directs input/output validation and maps requests.
  - `routes/`: Express endpoint mappings.
- **`src/infrastructure`**: Concrete frame integrations:
  - `database/`: Mongoose schemas (`AadhaarModel.ts`) and implementation repositories (`MongooseAadhaarRepository.ts`).
  - `ocr/`: Concrete implementation of local character recognition via Tesseract.js.
  - `middleware/`: File upload middleware via Multer.
  - `config/`: Database connect configurations.
  - `app.ts`: Global middleware hooks and Express configuration.

The entry point `server.ts` is placed at the root of the `backend/` folder to bootstrap the connection details and start the server.

---

## Environment Variables

Create a `.env` file at the root of the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/aadhaar-ocr
```

---

## API Endpoints

### 1. Parse Aadhaar Images (OCR)
- **Endpoint:** `POST /api/aadhaar/ocr`
- **Body:** `multipart/form-data`
  - `frontImage`: Image file (Front of Aadhaar card)
  - `backImage`: Image file (Back of Aadhaar card)
- **Response:**
  ```json
  {
    "status": true,
    "message": "Parsing Successful",
    "data": {
      "id": "64bfd53459c3a37b3f46adbc",
      "aadhaarNumber": "123456789012",
      "name": "Amit Kumar Singh",
      "dob": "12/03/1995",
      "gender": "MALE",
      "address": "123, Ring Road, Sector-5, Navi Mumbai",
      "pincode": "400706",
      "frontImage": "uploads/frontImage-169123456.png",
      "backImage": "uploads/backImage-169123457.png",
      "createdAt": "2026-06-07T10:30:00.000Z"
    }
  }
  ```

### 2. Fetch OCR History
- **Endpoint:** `GET /api/aadhaar/history`
- **Response:**
  ```json
  {
    "status": true,
    "message": "Fetched history successfully",
    "data": [
      {
        "id": "64bfd53459c3a37b3f46adbc",
        "aadhaarNumber": "123456789012",
        "name": "Amit Kumar Singh",
        "dob": "12/03/1995",
        "gender": "MALE",
        "address": "123, Ring Road, Sector-5, Navi Mumbai",
        "pincode": "400706",
        "frontImage": "uploads/frontImage-169123456.png",
        "backImage": "uploads/backImage-169123457.png",
        "createdAt": "2026-06-07T10:30:00.000Z"
      }
    ]
  }
  ```

---

## Setup & Execution
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run in developer mode:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Run in production mode:
   ```bash
   npm run start
   ```
