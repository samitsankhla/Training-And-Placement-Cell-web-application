# 🎓 Training & Placement Cell Management System

<div align="center">

# 🚀 Training & Placement Cell Web Application

### A Full-Stack MERN Platform for Streamlining Campus Recruitment Activities

![MERN](https://img.shields.io/badge/MERN-Stack-green)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-success)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 📖 About The Project

The **Training & Placement Cell Management System** is a comprehensive web-based platform designed to simplify and automate campus placement activities for educational institutions.

The system provides dedicated portals for **Students, Recruiters, and Administrators**, enabling seamless communication, placement drive management, job applications, inquiry handling, and placement analytics.

By digitizing placement processes, the platform improves efficiency, transparency, and accessibility for all stakeholders.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* Secure JWT-based authentication
* Role-Based Access Control (RBAC)
* Protected routes and API endpoints
* Persistent login sessions

### 👨‍🎓 Student Portal

* View available job opportunities
* Apply for placement drives
* Track application status
* Raise placement-related inquiries
* Receive important notifications

### 🏢 Recruiter Portal

* Post job openings
* Schedule placement drives
* Manage candidate applications
* View applicant information

### 👨‍💼 Admin Portal

* Manage students and recruiters
* Create and monitor placement drives
* Respond to student inquiries
* Track placement statistics
* Generate reports and analytics

### 📊 Analytics Dashboard

* Placement statistics overview
* Drive participation insights
* Student application tracking
* Recent activities monitoring

### 📱 Responsive User Interface

* Mobile-friendly design
* Optimized for desktops and tablets
* Modern and intuitive user experience

---

## 🛠️ Technology Stack

### Frontend

| Technology   | Purpose                  |
| ------------ | ------------------------ |
| React.js     | User Interface           |
| React Router | Client-side Routing      |
| Tailwind CSS | Styling                  |
| Axios        | API Communication        |
| Vite         | Development & Build Tool |

### Backend

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Runtime Environment |
| Express.js | Web Framework       |
| MongoDB    | Database            |
| Mongoose   | ODM                 |
| JWT        | Authentication      |
| Nodemailer | Email Notifications |

### Development Tools

* VS Code
* Git & GitHub
* ESLint
* Postman

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Node.js (v18 or higher)
* npm
* MongoDB (Local or Atlas)
* Git

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/samitsankhla/Training-And-Placement-Cell-web-application.git

cd training-placement-cell
```

### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

### 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

### Backend (.env)

Create a `.env` file inside the backend folder:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

or

```bash
npm start
```

### Start Frontend

```bash
cd frontend
npm run dev
```

Application URL:

```bash
http://localhost:5173
```

---

## 👤 Admin Account Setup

To create the first administrator account:

```bash
cd backend

node createAdmin.js
```

After execution, use the generated credentials to log in as Admin.

---

## 📧 Email Notifications

The system uses **Nodemailer** for sending:

* Placement drive notifications
* Job announcements
* Application updates
* Inquiry responses

For Gmail:

1. Enable Two-Factor Authentication.
2. Generate an App Password.
3. Use the generated password in `EMAIL_PASS`.

---

## 📊 Future Enhancements

* Resume Builder
* Interview Scheduling
* AI Resume Screening
* Company Dashboard
* Real-Time Notifications
* Placement Performance Reports
* Student Skill Assessment Module
* Chat System

---

## 🛡️ Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Role-Based Access Control
* Input Validation
* Secure API Access
* Environment Variable Protection

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 🐛 Troubleshooting

### MongoDB Connection Error

* Verify MongoDB is running
* Check `MONGO_URI`
* Ensure network access is allowed in MongoDB Atlas

### CORS Issues

* Verify backend CORS configuration
* Ensure frontend API URL is correct

### Email Not Sending

* Use Gmail App Password
* Verify email credentials
* Check internet connectivity

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

### Samit Sankhla

* GitHub: https://github.com/samitsankhla
* LinkedIn: https://www.linkedin.com/in/samit-sankhla-5322a8258/

---

<div align="center">

### ⭐ If you found this project useful, please give it a star on GitHub!



  <p>Made with ❤️ by <a href="https://github.com/samitsankhla">Samit Sankhla</a></p>


</div>










