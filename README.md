# Tinyapp

A URL shortener application built with Express.js and EJS. This app allows users to shorten URLs, view their shortened URLs, manage their links and redirect to their long urls.

## Features

- User registration and login
- URL shortening
- View and manage shortened URLs
- Redirect from shortened URLs to the original long URL

## Installation

1. **Clone the repository:**

   git clone https://github.com/yourusername/url-shortener-app.git
   cd url-shortener-app

2. **Install dependencies:**

   Make sure you have Node.js installed. Then run:

   npm install "various tools inside package.json"

3. **Run the application:**

   npm start

   The app will start on http://localhost:8080.

## Usage

- **Home Page**: Displays a greeting message.
- **Register**: Create a new account.
- **Login**: Log into your account.
- **Shorten URL**: Submit a long URL to shorten it.
- **Manage URLs**: View and edit your shortened URLs.
- **Logout**: End your session.

## API Endpoints

- `GET /` - Home page
- `GET /register` - Registration page
- `POST /register` - Register a new user
- `GET /login` - Login page
- `POST /login` - Log in a user
- `POST /logout` - Log out the current user
- `GET /urls` - List of shortened URLs for the logged-in user
- `POST /urls` - Create a new shortened URL
- `GET /urls/new` - Form to create a new shortened URL
- `GET /urls/:id` - View a specific shortened URL
- `POST /urls/:id` - Update a specific shortened URL
- `POST /urls/:id/delete` - Delete a specific shortened URL
- `GET /u/:id` - Redirect to the original URL
