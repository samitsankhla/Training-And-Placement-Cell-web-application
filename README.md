# Training-And-Placement-Cell-Web-app

##  Project Setup & Run Instructions

Follow these steps to set up and run the Training and Placement Cell Web App on your local machine.


---

### 1. **Install Backend Dependencies**

```bash
cd backend
npm install
```

---

### 3. **Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

---

### 4. **Configure Environment Variables**

- In both `backend` and `frontend` folders, create a `.env` file.
- Example for `backend/.env`:
  ```
  PORT=5000
  MONGO_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  EMAIL_USER=your_gmail_address@gmail.com
  EMAIL_PASS=your_gmail_app_password
  ```
- Example for `frontend/.env` (if needed):
  ```
  REACT_APP_API_URL=http://localhost:5000
  ```

---

### 5. **Start the Backend Server**

```bash
cd ../backend
npm start
```
The backend will typically run on [http://localhost:5000](http://localhost:5000).

---

### 6. **Start the Frontend Development Server**

```bash
cd ../frontend
npm start
```
The frontend will typically run on [http://localhost:3000](http://localhost:3000).

---

### 7. **Access the Application**

- Open your browser and go to: [http://localhost:3000](http://localhost:3000)

---

### 8. **Default Credentials (if any)**

#### Creating an Admin Account

Currently, there is no interface to create an admin account. To create one, follow these steps:

1. Make sure your backend dependencies are installed (`npm install` in the `backend` folder).
2. In the `backend` directory, locate the `createAdmin.js` script.
3. Run the script using Node.js:

    ```bash
    cd backend
    node createAdmin.js
    ```

4. Follow any prompts or instructions in the terminal to set up the admin account.

After running the script, you can log in with the admin credentials you provided.      

---

### 9. **Troubleshooting**

- Make sure MongoDB is running.
- If you get CORS errors, check your backend CORS configuration.
- For email features, ensure you use a Gmail App Password (not your regular Gmail password).

---

### 10. **Build for Production**

To create a production build of the frontend:
```bash
cd frontend
npm run build
```

---

**Enjoy using the Training and Placement Cell Web App!**