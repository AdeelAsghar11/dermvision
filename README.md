# DermVision 🩺

> AI-powered skin lesion classification — upload a dermoscopy image, get a real-time diagnosis with confidence scores, risk assessment, and full probability breakdown across 7 lesion classes.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![Django](https://img.shields.io/badge/Django-REST-092E20?style=flat&logo=django&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=nodedotjs&logoColor=white)
![ONNX](https://img.shields.io/badge/ONNX-Runtime-005CED?style=flat)
![Model Accuracy](https://img.shields.io/badge/Model%20Accuracy-78.4%25-teal?style=flat)

---

## 🚀 What This Project Demonstrates

- Building a **production-style full-stack AI application** with three independent services
- Training and deploying a **deep learning model** (MobileNetV2) using transfer learning
- Serving real-time model inference via **ONNX Runtime** (no TensorFlow at runtime)
- Implementing **JWT-based authentication** across a React + Node.js + Django stack
- Designing a clean, responsive medical UI with **Tailwind CSS**
- Persisting user data and predictions using **Django ORM + SQLite**

---

## Overview

DermVision classifies dermoscopy images into 7 skin lesion categories using a fine-tuned MobileNetV2 model trained on the HAM10000 dataset. It is built as a showcase of full-stack engineering, from the AI model pipeline to the frontend UI.

The application demonstrates a realistic architecture: a React SPA communicates with a Node.js API gateway, which proxies requests to a Django ML backend running ONNX inference. All predictions are stored in a database and accessible via a history dashboard.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│              React + Vite + Tailwind CSS                │
│                   (localhost:5173)                      │
└─────────────────────┬───────────────────────────────────┘
                      │  REST API calls (axios + JWT)
┌─────────────────────▼───────────────────────────────────┐
│                  Node.js API Gateway                    │
│             Express.js (localhost:5000)                 │
│   • JWT authentication & token signing                  │
│   • Multer file upload handling                         │
│   • Request proxying to Django                          │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTP (multipart/form-data)
┌─────────────────────▼───────────────────────────────────┐
│                  Django ML Engine                       │
│         Django REST Framework (localhost:8000)          │
│   • User registration & login                           │
│   • ONNX inference pipeline                             │
│   • Prediction storage via Django ORM                   │
│   • SQLite database                                     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│         MobileNetV2 ONNX Model (9.1 MB)                 │
│     Trained on HAM10000 — 78.4% validation accuracy     │
└─────────────────────────────────────────────────────────┘
```

---

## Features

- **User Authentication** — JWT-based register/login with protected routes
- **Image Upload** — Drag-and-drop dermoscopy image upload with preview
- **AI Classification** — Real-time inference via MobileNetV2 ONNX model
- **Confidence Scores** — Full probability breakdown across all 7 lesion classes
- **Risk Assessment** — Color-coded risk badges (Low / Medium / High)
- **Prediction History** — Per-user history of all past analyses stored in SQLite
- **Responsive UI** — Clean medical-grade interface built with Tailwind CSS

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router v6 |
| API Gateway | Node.js, Express.js, Multer, JWT (jsonwebtoken), bcryptjs |
| ML Backend | Python 3.10+, Django 4, Django REST Framework, ONNX Runtime |
| Database | SQLite (via Django ORM) |
| AI Model | MobileNetV2 (ImageNet pretrained → fine-tuned), ONNX Runtime |
| Dataset | HAM10000 (10,015 dermoscopy images, 7 classes) |

---

## AI Model

### Architecture

MobileNetV2 with a custom classification head, fine-tuned on HAM10000.

### Training Approach

**Phase 1 — Head Training (frozen base)**
- Trained custom Dense → Dropout → Softmax head only
- Val accuracy: **76.4%**

**Phase 2 — Fine-tuning (top 30 layers unfrozen)**
- Learning rate: 1e-5
- Val accuracy: **78.4%** (final)

### Model Details

| Property | Value |
|----------|-------|
| Base architecture | MobileNetV2 (ImageNet weights) |
| Dataset | HAM10000 |
| Training images | 10,015 |
| Classes | 7 |
| Input size | 224 × 224 × 3 |
| Export format | ONNX (9.1 MB) |
| Final val accuracy | **78.4%** |
| Runtime | ONNX Runtime (no TensorFlow at inference) |

### Lesion Classes & Risk Levels

| Class | Risk Level |
|-------|------------|
| Melanoma | 🔴 High |
| Basal cell carcinoma | 🔴 High |
| Actinic keratosis | 🟡 Medium |
| Dermatofibroma | 🟡 Medium |
| Melanocytic nevi | 🟢 Low |
| Benign keratosis | 🟢 Low |
| Vascular lesion | 🟢 Low |

---

## Project Structure

```
DermVision/
├── frontend/                      # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/axios.js           # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx      # Upload + prediction results
│   │       └── History.jsx
│   └── package.json
│
├── backend-node/                  # Express.js API Gateway
│   ├── middleware/auth.js         # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js                # /api/auth/register + /login
│   │   └── predict.js             # /api/predict + /api/history
│   ├── server.js
│   └── .env
│
└── backend-django/                # Django ML Engine
    ├── api/
    │   ├── ai/
    │   │   ├── model.py           # ONNX session loader
    │   │   ├── inference.py       # Preprocess → predict pipeline
    │   │   ├── dermvision_model.onnx
    │   │   └── class_indices.json
    │   ├── models.py              # UserProfile, Prediction ORM models
    │   ├── serializers.py
    │   ├── views.py               # Register, Login, Predict, History views
    │   └── urls.py
    ├── requirements.txt
    └── manage.py
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- Python 3.10+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/AdeelAsghar11/dermvision.git
cd dermvision
```

### 2. Start the Django ML Engine (Terminal 1)

```bash
cd backend-django
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

> **Expected:** `Starting development server at http://127.0.0.1:8000/`  
> Also look for: `ONNX model loaded successfully`

> **Note:** The ONNX model file (`dermvision_model.onnx`) and `class_indices.json` must be placed inside `backend-django/api/ai/`. If you re-train the model, export it to ONNX and copy it there.

### 3. Start the Node.js API Gateway (Terminal 2)

```bash
cd backend-node
npm install
node server.js
```

> **Expected:** `Node server running on port 5000`

### 4. Start the React Frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

> **Expected:** `Local: http://localhost:5173/`

### 5. Open the App

Navigate to [http://localhost:5173](http://localhost:5173), register an account, and start uploading images.

---

## Database Models

### UserProfile

| Field | Type |
|-------|------|
| `user` | OneToOne → Django User |
| `created_at` | DateTimeField |

### Prediction

| Field | Type |
|-------|------|
| `user` | ForeignKey → User |
| `image_path` | CharField |
| `lesion_type` | CharField |
| `confidence` | FloatField |
| `risk_level` | CharField (`low` / `medium` / `high`) |
| `created_at` | DateTimeField (auto) |

---

## ⚠️ Disclaimer

This application is an **educational project** and not a medically approved diagnostic tool. The model was trained on the HAM10000 dataset and may not generalise to all skin tones, image qualities, or real-world clinical conditions. Always consult a qualified dermatologist for any skin concerns.