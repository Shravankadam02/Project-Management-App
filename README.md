# 🚀 PROJECT MANAGEMENT Backend

PROJECT MANAGEMENT APP Backend is a RESTful API that powers a collaborative project management platform.  
It enables teams to organize projects, manage tasks and subtasks, attach files, maintain notes, and collaborate securely using role-based access control.

Built with scalability and security in mind, CollabNest Backend is designed for real-world team workflows.

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication (Access & Refresh Tokens)
- Multer (File Uploads)
- Nodemailer (Email Verification & Password Reset)
- bcrypt (Password Hashing)

---

## 🔐 Core Features

- Secure user authentication with JWT
- Email verification & password reset flow
- Role-Based Access Control (Admin, Project Admin, Member)
- Project creation and lifecycle management
- Team member invitations and role management
- Task and subtask management with status tracking
- File attachments for tasks
- Project-level notes system
- API health monitoring endpoint

---

## 👥 User Roles

| Role | Permissions |
|----|----|
| Admin | Full system and project control |
| Project Admin | Manage tasks and subtasks |
| Member | View projects, update task/subtask status |

---

## 📁 API Modules

### Authentication

/api/v1/auth


### Projects


/api/v1/projects


### Tasks & Subtasks


/api/v1/tasks


### Notes


/api/v1/notes


### Health Check


/api/v1/healthcheck


---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:



PORT=8000
MONGODB_URI=your_mongodb_connection
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password


---

## ▶️ Installation & Running the Project

```bash
git clone https://github.com/your-username/collabnest-backend.git
cd collabnest-backend
npm install
npm run dev


Server will run at:

http://localhost:8000

📎 File Management

Supports multiple file attachments per task

Files stored in public/images

Tracks file metadata (URL, size, MIME type)

Secure upload handling

❤️ Health Check
GET /api/v1/healthcheck


Returns API uptime and status.

📌 Project Status

Backend API: ✅ Completed

Authentication & RBAC: ✅ Implemented

File Uploads: ✅ Implemented

Ready for Frontend Integration 🚀

🧑‍💻 Author

Shravan Kadam


