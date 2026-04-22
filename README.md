Great. Here is a complete, portfolio-ready README content you can use for your project.

# DevConnect

DevConnect is a full stack developer community app where users can sign up, create posts, like posts, add comments, view profile data, and use a basic AI code explainer for pasted snippets.

## Features

- User authentication (signup and login with JWT)
- Protected routes with auth middleware
- Create and fetch posts
- Like and unlike posts
- Add comments on posts
- User profile with authored posts
- Basic AI code explanation (summary, complexity, key points)
- Responsive and polished frontend UI

## Tech Stack

- Frontend: React, TypeScript, Vite, CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Auth: JWT + bcrypt
- Deployment: Vercel (frontend), backend host of your choice (Render/Railway/etc.)

## Project Structure

- Client
- Server

## Local Setup

### 1. Clone

git clone https://github.com/Itisamanrai/DevConnect.git  
cd DevConnect

### 2. Install dependencies

cd Server  
npm install  
cd ../Client  
npm install

### 3. Add environment variables

Create .env with:

PORT=5001  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_jwt_secret

Optional: create Server/.env.example for public sharing (without real values).

### 4. Run backend

cd Server  
npm run dev

### 5. Run frontend

cd Client  
npm run dev

Frontend default: http://localhost:5173  
Backend default: http://localhost:5001

## API Endpoints

### Auth

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /api/auth/signup | No | Register user |
| POST | /api/auth/login | No | Login user and return token |
| GET | /api/auth/profile | Yes | Get current user profile and user posts |

### Posts

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /api/post | Yes | Get feed posts |
| POST | /api/post | Yes | Create post |
| GET | /api/post/:id | Yes | Get single post |
| DELETE | /api/post/:id | Yes | Delete own post |
| POST | /api/post/:id/comment | Yes | Add comment |
| POST | /api/post/:id/like | Yes | Toggle like or unlike |

### AI

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /api/ai/explain | Yes | Explain pasted code snippet |

## Frontend Highlights

- Feed and Profile tab navigation
- Card-based post layout
- Like button with live count update
- Comments rendered with author and timestamp
- AI side panel to explain selected or pasted code

## Security Notes

- Do not commit any .env files
- Rotate secrets if exposed
- Keep production secrets in hosting provider environment settings

## Screenshots

Add your screenshots in a folder named screenshots and reference them like this:

![Home Feed](./screenshots/feed.png)  
![Profile Page](./screenshots/profile.png)  
![AI Explainer](./screenshots/ai-explainer.png)

## Deployment Notes

- Frontend can be deployed to Vercel
- Backend can be deployed to Render/Railway
- Add frontend domain to backend CORS config
- Set environment variables in deployment dashboard

## Future Improvements

- Upload image-based code snippets
- Bookmark and save posts
- Search and filtering
- Pagination or infinite scroll
- Unit and integration tests

## Author

Aman Rai  
GitHub: https://github.com/Itisamanrai

If you want, I can also provide a shorter recruiter-focused README version (clean one-page style) and a separate detailed developer README version.
