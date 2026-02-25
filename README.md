# Recycle Backend

This is the backend and frontend for the Recycle Material Collectors website, integrated with MongoDB.

## Prerequisites

- Node.js and npm installed.
- A MongoDB Atlas account (connection string is pre-configured in `.env`).

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Server**:
    ```bash
    npm start
    ```
    The server will start at `http://localhost:5000`.

3.  **Access the Website**:
    Open your browser and navigate to:
    - [Home](http://localhost:5000/) - Directory of collectors
    - [Calculator](http://localhost:5000/calculate.html) - Calculate green points
    - [Profile](http://localhost:5000/profile.html) - View your profile and history

## Features

- **User Profile**: Create a profile with name, email, and phone.
- **Green Points**: Calculate points based on recycled material weight.
- **History**: Track all recycling activities and earned points.
- **MongoDB Integration**: All data is stored persistently in MongoDB.

## API Endpoints

- `POST /api/profile`: Create or update user profile.
- `GET /api/profile/:email`: Get user profile by email.
- `POST /api/calculate`: Add recycling entry and update points.
