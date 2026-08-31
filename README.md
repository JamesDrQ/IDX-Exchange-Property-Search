# IDX Exchange Property Search

A full-stack real estate property search application built with React, Express, and MySQL.

The application allows users to browse property listings, filter and sort results, navigate through paginated listings, view property details and photos, and check available open houses.

---

## Features

- Browse real estate property listings
- Filter properties by:
  - City
  - ZIP code
  - Minimum price
  - Maximum price
  - Minimum bedrooms
  - Minimum bathrooms
- Sort property results
- Paginate through large property datasets
- View detailed property information
- Browse property photos with an image carousel
- View scheduled open houses
- Responsive frontend built with React
- REST API built with Express
- MySQL-backed property data
- Backend API validation and error handling
- Automated frontend and backend tests

---

## Tech Stack

### Frontend

- React
- React Router
- JavaScript
- CSS
- React Testing Library
- Jest

### Backend

- Node.js
- Express 5
- MySQL
- mysql2
- CORS
- dotenv
- Jest
- Supertest

---

## Architecture

The project uses a traditional client-server architecture:

```text
React Frontend
      |
      | HTTP Requests
      v
Express REST API
      |
      | SQL Queries
      v
MySQL Database
