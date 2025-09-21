🚀 Product Management - Crud Operation API


A clear and concise description of what your project does and why it exists.
(Example: A RESTful API for managing tasks with authentication, built using Node.js, Express, and MongoDB.)

📖 Table of Contents

Project Description

Tech Stack

Setup Instructions

Environment Variables

API Documentation

Example Requests

License

📌 Project Description

This project provides a backend API for managing resources securely. It includes authentication using JWT, database persistence with MongoDB, and clean RESTful API design.

Key features:

🔐 User authentication & authorization (JWT-based)

📂 CRUD operations for resources

⚡ Scalable and modular architecture

🛠 Tech Stack

Node.js (Runtime)

Express.js (Web framework)

MongoDB + Mongoose (Database & ORM)

JWT (Authentication)

⚙️ Setup Instructions
1. Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

2. Install dependencies
npm install

3. Setup environment variables

Create a .env file in the root directory. Use .env.example as reference.

4. Run the project
# Development
npm run dev

# Production
npm start


The server will start at: http://localhost:5000 (default)

🔑 Environment Variables

The following environment variables must be set in a .env file:

Variable	Description	Example Value
PORT	Port number for the server	5000
MONGO_URI	MongoDB connection string	mongodb://localhost:27017/mydb
JWT_SECRET	Secret key for signing JWT tokens	supersecretkey123
NODE_ENV	Environment (development/production)	development
📄 .env.example
PORT=5000
MONGO_URI=mongodb://localhost:27017/mydb
JWT_SECRET=supersecretkey123
NODE_ENV=development

📡 API Documentation
Authentication
🔹 Register User

URL: /api/auth/register

Method: POST

Request Body:

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword123"
}


Success Response:

{
  "success": true,
  "message": "User registered successfully"
}


Error Response:

{
  "success": false,
  "message": "Email already exists"
}

🔹 Login User

URL: /api/auth/login

Method: POST

Request Body:

{
  "email": "john@example.com",
  "password": "mypassword123"
}


Success Response:

{
  "success": true,
  "token": "jwt_token_here"
}


Error Response:

{
  "success": false,
  "message": "Invalid credentials"
}

Protected Routes (Require JWT in Authorization: Bearer <token>)
🔹 Get All Items

URL: /api/items

Method: GET

Success Response:

[
  {
    "_id": "64a3b5c12e9d1a7c12345",
    "name": "Sample Item",
    "createdAt": "2025-09-22T10:00:00.000Z"
  }
]

🔹 Create Item

URL: /api/items

Method: POST

Request Body:

{
  "name": "New Item"
}


Success Response:

{
  "success": true,
  "data": {
    "_id": "64a3b5c12e9d1a7c54321",
    "name": "New Item"
  }
}

🔹 Delete Item

URL: /api/items/:id

Method: DELETE

Success Response:

{
  "success": true,
  "message": "Item deleted"
}

📌 Example Requests

Using cURL:

# Register
curl -X POST http://localhost:5000/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"John Doe","email":"john@example.com","password":"mypassword123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"john@example.com","password":"mypassword123"}'

# Get Items (Authenticated)
curl -X GET http://localhost:5000/api/items \
   -H "Authorization: Bearer <jwt_token>"

📜 License

This project is licensed under the MIT License.
