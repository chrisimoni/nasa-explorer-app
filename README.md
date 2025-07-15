# NASA Explorer App

> Explore the universe with NASA's APIs — from daily astronomical wonders to stunning Mars rover photos.

**GitHub Repository:** [https://github.com/chrisimoni/nasa-explorer-app](https://github.com/chrisimoni/nasa-explorer-app)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features Implemented](#features-implemented)
- [Technologies Used](#technologies-used)
- [Backend API Documentation](#backend-api-documentation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Cloning the Repository](#cloning-the-repository)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the Application](#running-the-application)
- [Usage](#usage)
  - [Astronomy Picture of the Day (APOD)](#astronomy-picture-of-the-day-apod)
  - [Mars Rover Photos](#mars-rover-photos)

---

## Project Overview

The NASA Explorer App is a full-stack web application that visualizes exciting data from NASA's public APIs. Built with React (frontend) and Node.js/Express (backend), it offers a rich and responsive experience to explore APODs and Mars rover imagery.

---

## Features Implemented

### 🔭 Astronomy Picture of the Day (APOD)

- View NASA’s daily featured image or video
- Select specific dates with a calendar picker

### 🚀 Mars Rover Photos

- Browse rover images from Curiosity, Opportunity, Spirit, and Perseverance
- Advanced filtering by Sol, camera type, and rover
- Dynamic camera options based on selected rover
- Rover stats: landing date, status, latest Sol
- Pagination for browsing multiple photos
- Photo viewer modal with image metadata
- Bar chart showing "Photos per Camera"

### 💻 UI/UX & Design

- Fully responsive across all devices
- Smooth animations with Framer Motion
- Cosmic particle background

---

## Technologies Used

**Frontend:**

- React.js + Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Chart.js & React Chart.js 2

**Backend:**

- Node.js
- Express.js
- Axios
- dotenv

**APIs:**

- [NASA APOD API](https://api.nasa.gov/)
- [NASA Mars Rover Photos API](https://api.nasa.gov/)

---

## Backend API Documentation

📮 Postman collection with API documentation:  
[**View in Postman**](YOUR_POSTMAN_DOCUMENTATION_LINK_HERE)

---

## Getting Started

Follow these steps to set up and run the NASA Explorer App locally.

---

### Prerequisites

- Node.js (v18.x or higher recommended)
- npm or Yarn

---

### Cloning the Repository

```bash
git clone https://github.com/chrisimoni/nasa-explorer-app
cd nasa-explorer-app
```

---

## Environment Variables

Both the **frontend** and **backend** require environment variables to function correctly.

---

### 🔧 1. Backend

Rename the sample file:

```bash
cd backend
cp .env.sample .env
```

Edit the `.env` file with your NASA API key from [https://api.nasa.gov](https://api.nasa.gov):

```env
PORT=3000
NASA_API_KEY=YOUR_NASA_API_KEY_HERE
NASA_BASE_URL=https://api.nasa.gov
NODE_ENV=development
CACHE_DURATION_SECONDS=3600
```

---

### 🖼 2. Frontend

Rename the sample file:

```bash
cd ../frontend
cp .env.sample .env
```

Update the API URL if needed:

```env
BACKEND_API_URL=http://localhost:3000/api/v1
```

---

## Backend Setup

Install dependencies and start the development server:

```bash
cd backend
npm install
npm run dev
```

The backend server should now be running at:  
[http://localhost:3000](http://localhost:3000)

## Running Tests

To run unit and integration tests for the backend:

```bash
cd backend
npm run test
```

This will execute all test suites and display the results in your terminal.

## Frontend Setup

Install dependencies and start the Vite development server:

```bash
cd ../frontend
npm install
npm run dev
```

The frontend app should now be running at:  
[http://localhost:5173](http://localhost:5173)

---

## Running the Application

To run both the backend and frontend:

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend app:

```bash
cd frontend
npm run dev
```

Open your browser at:  
[http://localhost:5173](http://localhost:5173)

---

## Usage

### 🌌 Astronomy Picture of the Day (APOD)

- View daily NASA images and videos
- Pick specific dates to explore historical APODs
- Click on a thumbnail to view media and description

---

### 🪐 Mars Rover Photos

- Choose between Mars rovers: Curiosity, Opportunity, Spirit, Perseverance
- Filter images by Sol (Martian day), camera, and rover
- View metadata-rich image previews in a modal
- Bar chart for photo distribution by camera
- Pagination support for large image sets

---
