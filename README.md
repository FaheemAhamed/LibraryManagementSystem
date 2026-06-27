# Library Management System

A secure, RESTful backend application built with **Node.js**, **Express**, and **MongoDB** to manage books, library members, and borrowing activities. The system features secure Authentication (JWT), input validation, and role-based authorization to differentiate privileges between librarians and members.

---

## 🚀 Deployment URL
Live API URL: [https://librarymanagementsystem-4yre.onrender.com](https://librarymanagementsystem-4yre.onrender.com)

---

## 🛠️ Technologies Used
- **Runtime Environment:** Node.js (v18+)
- **Backend Framework:** Express.js
- **Database Layer:** MongoDB & Mongoose ORM
- **Security & Auth:** JSON Web Tokens (JWT) & bcryptjs (password hashing)
- **Validation:** express-validator
- **Cross-Origin Resource Sharing:** CORS
- **Configuration Management:** dotenv

---

## 🔑 Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

---

## ⚙️ Database Setup
1. Create a database instance on **MongoDB Atlas** or set up a local MongoDB server.
2. Get the connection string.
3. Paste it under `MONGO_URI` in your `.env` file.

---

## 📥 Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FaheemAhamed/LibraryManagementSystem.git
   cd LibraryManagementSystem
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   * Create a `.env` file and add the config as outlined above.
4. **Run the Server:**
   ```bash
   node server.js
   ```

---

## 📑 API Endpoints

### 🔐 Authentication APIs
| Method | Endpoint | Access | Description | Input Fields |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user | `name`, `email`, `password`, `role` |
| `POST` | `/api/auth/login` | Public | Authenticate user & get token | `email`, `password` |

### 📚 Book Management APIs
| Method | Endpoint | Access | Description | Query Parameters / ID |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/books` | Librarian Only | Add a new book to the library | Body: `title`, `author`, `isbn`, `category`, `quantity` |
| `GET` | `/api/books` | Authenticated | View books (supports search & filter) | Query: `page`, `limit`, `search`, `category` |
| `GET` | `/api/books/:id` | Authenticated | View details of a specific book | `:id` (MongoDB ObjectId) |
| `PUT` | `/api/books/:id` | Librarian Only | Modify book details | `:id`, Body: `title`/`author`/`isbn`/`category`/`quantity` |
| `DELETE`| `/api/books/:id` | Librarian Only | Remove a book from the inventory | `:id` |
| `POST` | `/api/books/:id/borrow`| Authenticated | Borrow a book copy | `:id` |
| `POST` | `/api/books/:id/return`| Authenticated | Return a borrowed book copy | `:id` |

### 👥 Member Management APIs
| Method | Endpoint | Access | Description | Query/ID |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/members` | Librarian Only | View all registered members | None |
| `DELETE`| `/api/members/:id` | Librarian Only | Remove member account | `:id` |
| `GET` | `/api/members/me/books`| Authenticated | View logged-in user's active borrows | None |

---

## 🔒 Authentication Flow

This project uses JWT (JSON Web Tokens) to secure routes.

1. **User Login:** A request is sent to `POST /api/auth/login`. On success, the API returns a JWT token.
2. **Accessing Protected Routes:** Send the token in the `Authorization` header as a Bearer token:
   ```text
   Authorization: Bearer <your_jwt_token_here>
   ```
3. **Role Validation:** Librarian-only routes check if the decoded user payload has `role === 'librarian'` and throws a `403 Access Denied` error if validation fails.
