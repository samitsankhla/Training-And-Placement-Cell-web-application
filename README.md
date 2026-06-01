# 🎓 Training and Placement Cell Web App

<div align="center">
  <h3>A Full‑Stack MERN Application for Managing Training & Placement Activities</h3>
</div>

---

## 📋 Overview
The Training and Placement Cell Web App is designed to streamline placement activities for colleges and universities. It provides secure role‑based access for students, faculty, and administrators, enabling efficient job notifications, drive scheduling, inquiries, and reporting.

---

## ✨ Features
- 🔐 **Authentication & Roles**: Secure login with JWT, role‑based access (Admin, Student, Recruiter).
- 📊 **Dashboard**: Placement statistics, upcoming drives, recent activity.
- 📝 **Job & Drive Management**: Create, update, and manage job postings and placement drives.
- 💬 **Inquiries System**: Students can raise queries, admins can respond.
- 📄 **Reports & Analytics**: Track placement progress and generate insights.
- 📱 **Responsive Design**: Optimized for desktop and mobile.

---

## 🛠️ Tech Stack
**Frontend**
- React (with React Router)
- Tailwind CSS
- Axios

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (for email notifications)

**Dev Tools**
- Vite
- ESLint
- VS Code

---

## 🚀 Project Setup & Run Instructions

### 1. Install Backend Dependencies
```bash
cd backend
npm install

2. Install Frontend Dependencies
cd ../frontend
npm install

3. Configure Environment Variables
Create .env files in both backend and frontend.

Example: backend/.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password


REACT_APP_API_URL=http://localhost:5000

4. Start Backend Server
cd backend
npm start

5. Start Frontend Development Server
cd ../frontend
npm start

👤 Admin Account Setup
Currently, there is no UI to create an admin account. Use the provided script:
cd backend
node createAdmin.js

🛠 Troubleshooting
- Ensure MongoDB is running locally or via Atlas.
- For CORS errors, check backend CORS configuration.
- For email features, use a Gmail App Password (not your regular Gmail password).

📦 Build for Production
To create a production build of the frontend:
cd frontend
npm run build

📄 License
This project is licensed under the MIT License
<div align="center">
<p>Made with ❤️ by <a href="https://github.com/samitsankhla">Samit Sankhla</a></p>
</div>


---










