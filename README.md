💻 Product Management System:

A complete backend system for product management with secure authentication, user profile management, and full CRUD operations. The system features comprehensive user activity logging and a modern web interface.
🚀 Features

Secure Authentication: JWT-based authentication with bcrypt password hashing
User Management: Complete user profile system with role-based access
Product CRUD: Full Create, Read, Update, Delete operations for products
Activity Logging: Comprehensive logging of all user interactions
Modern UI: Responsive web interface with glassmorphism design
Input Validation: Schema-based validation using Joi
Security: HTTP-only cookies, password strength validation

🛠️ Technology Stack

Backend: Node.js, Express.js
Database: MongoDB with Mongoose ODM
Authentication: JSON Web Tokens (JWT), bcrypt
Validation: Joi schema validation
Frontend: Vanilla HTML, CSS, JavaScript
Styling: Modern CSS with glassmorphism effects

📋 Prerequisites
Before running this application, make sure you have the following installed:

Node.js (v14.0.0 or higher)
npm (v6.0.0 or higher)
MongoDB (local installation or MongoDB Atlas account)

🔧 Installation & Setup
1. Clone the Repository
bashgit clone <repository-url>
cd product-management-system
2. Install Dependencies
bashnpm install
3. Environment Configuration
Create a .env file in the root directory and configure the following variables:
bash# Copy from .env.example
cp .env.example .env
Edit the .env file with your configurations:
bash# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/productmanagement

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Server Configuration
PORT=3000
NODE_ENV=development
4. MongoDB Setup
Option A: MongoDB Atlas (Recommended)

Create a free account at MongoDB Atlas
Create a new cluster
Get your connection string and update MONGO_URI in .env

Option B: Local MongoDB

Install MongoDB locally
Start MongoDB service
Update MONGO_URI to: mongodb://localhost:27017/productmanagement

5. Start the Application
Development Mode
bashnpm run dev
Production Mode
bashnpm start
The application will be available at http://localhost:3000
📚 API Documentation
Authentication Endpoints
POST /api/auth/signup
Register a new user account.
Request Body:
json{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
Response:
json{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "userId",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
POST /api/auth/login
Authenticate user and create session.
Request Body:
json{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
Response:
json{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "userId",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "user"
  }
}
POST /api/auth/logout
Logout user and clear session.
Response:
json{
  "success": true,
  "message": "Logout successful"
}
User Profile Endpoint
GET /api/users/profile
Get current user's profile information (Protected).
Response:
json{
  "success": true,
  "user": {
    "id": "userId",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "about": "User description",
    "skills": ["JavaScript", "Node.js"]
  }
}
Product Endpoints
POST /api/products
Create a new product (Protected).
Request Body:
json{
  "name": "Sample Product",
  "description": "This is a sample product description",
  "price": 99.99,
  "category": "Electronics"
}
Response:
json{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "productId",
    "name": "Sample Product",
    "description": "This is a sample product description",
    "price": 99.99,
    "category": "Electronics",
    "createdBy": "userId",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
GET /api/products
Get all products (Protected).
Response:
json{
  "success": true,
  "count": 1,
  "products": [
    {
      "id": "productId",
      "name": "Sample Product",
      "description": "Product description",
      "price": 99.99,
      "category": "Electronics",
      "createdBy": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
PUT /api/products/:id
Update a product (Protected - Only product owner).
Request Body: Same as POST /api/products
Response:
json{
  "success": true,
  "message": "Product updated successfully",
  "product": { /* updated product data */ }
}
DELETE /api/products/:id
Delete a product (Protected - Only product owner).
Response:
json{
  "success": true,
  "message": "Product deleted successfully"
}
🔐 Error Responses
All endpoints return consistent error responses:
json{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
Common HTTP status codes:

400 - Bad Request (validation errors)
401 - Unauthorized (authentication required)
403 - Forbidden (insufficient permissions)
404 - Not Found (resource doesn't exist)
500 - Internal Server Error

📊 Activity Logging
The system automatically logs the following user activities:

User signup and login
Profile access
Product creation, updates, and deletions
Product list access

Logs include:

User ID and timestamp
Action type and details
IP address (optional)
User agent (optional)

🔒 Security Features

Password Security: bcrypt hashing with salt rounds
JWT Authentication: Secure token-based authentication
HTTP-only Cookies: Prevents XSS attacks
Input Validation: Joi schema validation
Password Strength: Enforced strong password requirements
CORS Protection: Cross-origin request protection

🎨 Frontend Features

Modern Design: Glassmorphism UI with gradient backgrounds
Responsive Layout: Mobile-first responsive design
Real-time Updates: Dynamic content updates
Toast Notifications: User feedback system
Form Validation: Client-side input validation
Loading States: User experience enhancements

📁 Project Structure
product-management-system/
├── app.js                 # Main application file
├── config/
│   └── database.js        # Database configuration
├── middleware/
│   └── user.js           # Authentication middleware
├── model/
│   ├── user.js           # User model
│   ├── product.js        # Product model
│   └── activityLog.js    # Activity logging model
├── index.html            # Frontend HTML
├── style.css             # Frontend styling
├── package.json          # Dependencies
├── .env.example          # Environment variables template
└── README.md            # This file
🚀 Deployment
Heroku Deployment

Create a Heroku account and install Heroku CLI
Create a new Heroku app: heroku create your-app-name
Set environment variables: heroku config:set JWT_SECRET=your-secret
Deploy: git push heroku main

Vercel Deployment

Install Vercel CLI: npm i -g vercel
Run: vercel
Follow the prompts to deploy

Environment Variables for Production

Set NODE_ENV=production
Use strong, unique JWT_SECRET
Configure production MongoDB connection

🤝 Contributing

Fork the repository
Create a feature branch: git checkout -b feature-name
Commit changes: git commit -m 'Add feature'
Push to branch: git push origin feature-name
Submit a pull request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
🐛 Troubleshooting
Common Issues

MongoDB Connection Error

Check your MongoDB URI in .env
Ensure MongoDB service is running
Verify network access for MongoDB Atlas


JWT Token Issues

Clear browser cookies
Check if JWT_SECRET is set in .env
Ensure token hasn't expired


Port Already in Use

Change PORT in .env file
Kill process using the port: lsof -ti:3000 | xargs kill



Getting Help

Check the Issues section
Review the error logs in the console
Ensure all dependencies are installed: npm install

📞 Support
For support and questions:

Create an issue in this repository
Review the documentation above
Check the troubleshooting section


Happy Coding! 🎉
