# 🌾 AI-Based Farmer Query Support and Advisory System

**Role:** Cloud Backend & API Integration Developer
**Environment:** AWS EC2 (Ubuntu 24.04), Docker

## 📌 Project Overview
An intelligent backend system built with FastAPI and integrated with the Google Gemini API to process and answer farmer queries using NLP.

## 🏗️ System Architecture
- **Backend Framework:** FastAPI for high-performance API routing.
- **AI Integration:** Google Gemini API for Natural Language Processing.
- **Infrastructure:** Hosted on AWS EC2, utilizing custom Security Groups.

## ⚙️ MLOps Pipeline
- **Containerization:** Dockerized deployment ensuring environment consistency.
- **Version Control:** Git & GitHub for continuous integration.

## 🚀 Quick Start
```bash
docker build -t farmer-ai-backend .
docker run -d -p 8000:8000 farmer-ai-backend      
