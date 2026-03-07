# 📄 PaperChat

![PaperChat](https://img.shields.io/badge/PaperChat-Real--Time%20Messaging-FF6B6B?style=for-the-badge&labelColor=4ECDC4)

<div align="center">

A handcrafted real-time chat application with an origami-inspired paper fold aesthetic

[🌐 Live Demo](https://paperchat-zeta.vercel.app) · [✨ Features](#-features) · [🚀 Quick Start](#-quick-start) · [📡 API Reference](#-api-reference)

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=flat-square&logo=socket.io&logoColor=white) ![Express](https://img.shields.io/badge/Express-5.2-000000?style=flat-square&logo=express&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture](#-architecture)
- [🚀 Quick Start](#-quick-start)
- [🔧 Environment Variables](#-environment-variables)
- [📁 Project Structure](#-project-structure)
- [📡 API Reference](#-api-reference)
- [🔐 Authentication Flow](#-authentication-flow)
- [💬 Real-Time WebSocket Events](#-real-time-websocket-events)
- [🎨 Frontend Deep Dive](#-frontend-deep-dive)
- [⚡ Performance & Optimizations](#-performance--optimizations)
- [🚢 Deployment](#-deployment)
- [🔧 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 💬 Messaging

| Feature | Description |
| ------- | ----------- |
| ⚡ Real-Time Messaging | Instant message delivery via Socket.IO WebSockets |
| ✏️ Edit Messages | Edit your own messages with real-time updates |
| 🗑️ Delete Messages | Remove messages with confirmation dialog |
| 📝 Message History | Persistent chat history with scroll-to-bottom |
| 🔔 Live Updates | See messages appear instantly without refresh |

### 👥 Social Features

| Feature | Description |
| ------- | ----------- |
| 🤝 Friend Requests | Send, accept, or reject friend requests |
| 🔍 User Search | Search users by username or email |
| 👤 User Profiles | View user profiles with avatar and username |
| 💬 One-on-One Chats | Private conversations between friends |
| 📊 Chat List | View all active chats with last message preview |

### � Video Calling

| Feature | Description |
| ------- | ----------- |
| 📞 Peer-to-Peer Calls | Direct WebRTC video and audio streaming |
| 🔔 Instant Ringing | Real-time incoming call dialog with caller info |
| 📷 Media Controls | Toggle camera and microphone during calls |
| 🔄 Robust Signaling | Reliable connection state tracking via Socket.IO |
| 📱 Responsive Video | Adapts to mobile and desktop screens seamlessly |

### �🔐 Security & Authentication

| Feature | Description |
| ------- | ----------- |
| 🔑 JWT Authentication | Secure httpOnly cookie-based access & refresh tokens |
| 🔒 Password Hashing | bcrypt with salt rounds for secure storage |
| 🍪 Cookie Management | Secure, httpOnly cookies for production |
| 🔄 Auto Token Refresh | Seamless authentication with token rotation |
| 🚪 Protected Routes | Client-side route guards for authenticated pages |

### 🎨 UI/UX

| Feature | Description |
| ------- | ----------- |
| 📄 Paper Fold Design | Handcrafted origami-inspired aesthetic |
| ✍️ Handwritten Fonts | Caveat, Kalam, Patrick Hand fonts |
| 📓 Notebook Lines | Ruled paper background effect |
| 🎀 Washi Tape Accents | Decorative tape elements |
| 📐 Folded Corners | Paper fold corner animations |
| 📱 Responsive Design | Mobile-first layout (320px–4K) |
| 🌓 Custom Scrollbars | Themed scrollbar styling |

### 👤 User Management

| Feature | Description |
| ------- | ----------- |
| 📸 Avatar Uploads | Cloud-hosted via Cloudinary with auto-optimization |
| ✏️ Username Updates | Change username with validation |
| 🔑 Password Changes | Secure password update flow |
| 🚪 Logout | Clear all sessions and cookies |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| **React** | 19.2 | UI framework with hooks & context |
| **Vite** | 7.2 | Lightning-fast build tool & HMR |
| **React Router** | 7.13 | Client-side routing & navigation |
| **Tailwind CSS** | 4.1 | Utility-first styling framework |
| **Socket.IO Client** | 4.8 | Real-time bidirectional communication |
| **WebRTC API** | Native | Peer-to-peer video streaming |

### Backend

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.2 | Fast web framework |
| **PostgreSQL** | Latest | Relational database (Neon hosted) |
| **Socket.IO** | 4.8 | WebSocket server with fallbacks |
| **JWT** | 9.0 | Token-based authentication |
| **bcrypt** | 6.0 | Password hashing with salt |
| **Cloudinary** | 2.9 | Image CDN & transformations |
| **Multer** | 2.0 | Multipart file upload handling |
| **postgres** | 3.4 | PostgreSQL client library |

---

## 🏗 Architecture

### System Overview

```mermaid
flowchart TB
    subgraph Client["🖥 Client (Browser)"]
        Router["React Router<br/>(Routes)"]
        AuthCtx["Auth Context<br/>(JWT Tokens)"]
        ChatCtx["Chat Context<br/>(Messages)"]
        VideoCtx["Video Context<br/>(WebRTC Sync)"]
        
        Router --- AuthCtx --- ChatCtx --- VideoCtx
    end

    subgraph Network["🌐 Network Layer"]
        Axios["Axios<br/>(REST API)"]
        Socket["Socket.IO Client<br/>(WebSockets)"]
        WebRTC["WebRTC<br/>(Peer-to-Peer)"]
    end

    Client --> Axios
    Client --> Socket
    Client <--> WebRTC

    subgraph Server["⚙️ Express Server (Node.js)"]
        Middleware["Middleware Stack<br/>(CORS → Cookies → Auth)"]
        Routes["API Routes<br/>(/api/...)"]
        Controllers["Controllers<br/>(Business Logic)"]
        WSS["Socket.IO Events<br/>(Rooms & Signaling)"]
        
        Middleware --> Routes --> Controllers
        Middleware --> WSS
    end

    subgraph External["☁️ External Services"]
        Neon[("PostgreSQL<br/>(Neon Cloud)")]
        Cloudinary["Cloudinary<br/>(Avatar CDN)"]
    end

    Axios <-->|"HTTP/HTTPS<br/>httpOnly Cookies"| Middleware
    Socket <-->|"WebSocket (WSS)"| WSS
    
    Controllers <--> Neon
    WSS <--> Neon
    Controllers --> Cloudinary
```

### Request Flow

#### REST API Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Auth Middleware
    participant R as Route Controller
    participant DB as PostgreSQL
    
    C->>M: HTTP Request + JWT Cookie
    M->>M: Verify Signature & Expiry
    alt Token Invalid
        M-->>C: 401 Unauthorized
    else Token Valid
        M->>R: req.user attached, next()
        R->>DB: Query / Mutation
        DB-->>R: Data Rows
        R-->>C: JSON Response
    end
```

#### WebSocket Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Socket.IO Server
    participant DB as PostgreSQL
    
    C->>S: Handshake + JWT accessToken
    S->>S: Verify Token
    S->>DB: Fetch user's chats
    DB-->>S: Chat IDs
    S->>S: Join matching Rooms (chatId)
    
    C->>S: emit("send_message", {chatId, content})
    S->>DB: INSERT INTO messages
    DB-->>S: New Message ID
    S->>S: io.to(chatId).emit(...)
    S-->>C: Broadcast to all room members
```

### Database Schema

```sql
users
├── id (SERIAL PRIMARY KEY)
├── username (VARCHAR UNIQUE)
├── email (VARCHAR UNIQUE)
├── password_hash (TEXT)
├── avatar (VARCHAR)
├── avatar_public_id (VARCHAR)
├── refresh_token (TEXT)
└── created_at, updated_at (TIMESTAMP)

chats
├── id (SERIAL PRIMARY KEY)
├── user1_id (FK → users.id)
├── user2_id (FK → users.id)
├── UNIQUE INDEX on (LEAST(user1, user2), GREATEST(user1, user2))
└── created_at, updated_at (TIMESTAMP)

messages
├── id (SERIAL PRIMARY KEY)
├── content (TEXT)
├── chat_id (FK → chats.id)
├── sender_id (FK → users.id)
├── is_read (BOOLEAN)
└── created_at, updated_at (TIMESTAMP)

chat_requests
├── id (SERIAL PRIMARY KEY)
├── sender_id (FK → users.id)
├── receiver_id (FK → users.id)
├── status (VARCHAR: pending|accepted|rejected)
└── created_at (TIMESTAMP)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm v9+
- **PostgreSQL** database ([Neon](https://neon.tech) free tier, [Supabase](https://supabase.com), or local)
- **Cloudinary** account ([free signup](https://cloudinary.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/paperchat.git
cd paperchat
```

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create environment files:

**Backend** (`backend/.env`):

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@host/database
ACCESS_TOKEN_SECRET=your_secret_here_min_32_chars
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_SECRET=another_secret_here_min_32_chars
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_cloudinary_secret
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

> 💡 **Tip:** Generate secure secrets with `openssl rand -base64 32`

### Run Development Servers

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example | Required |
| -------- | ----------- | ------- | -------- |
| `PORT` | Server port | `3000` | Yes |
| `NODE_ENV` | Environment | `development` / `production` | Yes |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host/db` | Yes |
| `ACCESS_TOKEN_SECRET` | JWT access token secret (32+ chars) | `your-secret-key` | Yes |
| `ACCESS_TOKEN_EXPIRY` | Access token TTL | `7d` / `15m` | Yes |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret (32+ chars) | `another-secret-key` | Yes |
| `REFRESH_TOKEN_EXPIRY` | Refresh token TTL | `7d` / `30d` | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud` | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` | Yes |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) | `http://localhost:5173,http://localhost:5174` | Yes |
| `RENDER_EXTERNAL_URL` | Auto-set by Render for keep-alive | (auto-provided) | No |

### Frontend (`frontend/.env`)

| Variable | Description | Example | Required |
| -------- | ----------- | ------- | -------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` | Yes |
| `VITE_SOCKET_URL` | Backend WebSocket URL | `http://localhost:3000` | Yes |

> ⚠️ **Never commit `.env` files.** Both directories have `.gitignore` entries.

---

## 📁 Project Structure

```
paperchat/
├── README.md
├── backend/
│   ├── package.json
│   ├── render.yaml              # Render deployment config
│   ├── public/
│   │   └── temp/                # Temporary multer uploads
│   └── src/
│       ├── index.js             # Entry point — DB connect & listen
│       ├── app.js               # Express + CORS + Socket.IO setup
│       ├── controllers/         # Request handlers
│       │   ├── chats.controllers.js      # Chat CRUD operations
│       │   ├── message.controllers.js    # Message CRUD + Socket logic
│       │   ├── requests.controllers.js   # Friend request management
│       │   └── user.controllers.js       # Auth + profile operations
│       ├── db/
│       │   └── index.js         # PostgreSQL connection + schema init
│       ├── middleware/
│       │   ├── auth.middleware.js        # JWT verification
│       │   └── multer.middleware.js      # File upload config
│       ├── routes/              # Express route definitions
│       │   ├── chats.routes.js
│       │   ├── messages.routes.js
│       │   ├── requests.routes.js
│       │   └── user.routes.js
│       ├── sockets/
│       │   └── chat.sockets.js  # Socket.IO event handlers
│       └── utils/
│           ├── ApiError.js      # Custom error class
│           ├── ApiResponse.js   # Standardized response wrapper
│           ├── asyncHandler.js  # Async error catcher
│           └── cloudinary.js    # Image upload/delete helpers
│
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── eslint.config.js
    ├── vercel.json              # Vercel SPA routing config
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Root component + routing
        ├── index.css            # Paper Fold design system + Tailwind
        ├── context/             # React Context providers
        │   ├── AuthContext.jsx  # Auth state + login/logout
        │   └── ChatContext.jsx  # Chat state + real-time updates
        ├── pages/               # Route components
        │   ├── LandingPage.jsx  # Public landing page
        │   ├── LoginPage.jsx    # Login form
        │   ├── HomePage.jsx     # Auth: Chat list
        │   ├── ChatPage.jsx     # Auth: Active chat view
        │   ├── AddUserPage.jsx  # Auth: Search & send requests
        │   └── ProfilePage.jsx  # Auth: User settings
        └── services/
            ├── api.js           # Axios instance with interceptors
            └── socket.js        # Socket.IO client instance
```

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api`

### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| **POST** | `/users/register` | Register new user | ❌ No |
| **POST** | `/users/login` | Login with email & password | ❌ No |
| **POST** | `/users/logout` | Logout (clear cookies) | ✅ Yes |
| **POST** | `/users/refresh-token` | Refresh access token | ❌ No (refresh token in cookie) |

#### Register Request

```json
POST /api/users/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login Request

```json
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Response Format

```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": "https://res.cloudinary.com/..."
    },
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1..."
  },
  "message": "User logged in successfully",
  "success": true
}
```

### 👤 User Management

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| **GET** | `/users/me` | Get current user profile | ✅ Yes |
| **GET** | `/users/search?query=john` | Search users by username/email | ✅ Yes |
| **PATCH** | `/users/change-username` | Update username | ✅ Yes |
| **PATCH** | `/users/change-password` | Change password | ✅ Yes |
| **PATCH** | `/users/change-avatar` | Upload new avatar | ✅ Yes |

#### Search Users

```bash
GET /api/users/search?query=john
Authorization: Bearer {accessToken}
```

#### Change Avatar

```bash
POST /api/users/change-avatar
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}

avatar: [file]
```

### 💬 Chats

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| **GET** | `/chats` | Get all user's chats | ✅ Yes |

### 📨 Messages

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| **GET** | `/messages/:chatId` | Get messages for a chat | ✅ Yes |
| **POST** | `/messages` | Send message | ✅ Yes |
| **PATCH** | `/messages/:id` | Edit message | ✅ Yes |
| **DELETE** | `/messages/:id` | Delete message | ✅ Yes |

#### Send Message

```json
POST /api/messages
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "chatId": 5,
  "content": "Hello, how are you?"
}
```

### 🤝 Friend Requests

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| **POST** | `/requests` | Send friend request | ✅ Yes |
| **GET** | `/requests` | Get pending requests | ✅ Yes |
| **PATCH** | `/requests/:id/accept` | Accept request (creates chat) | ✅ Yes |
| **PATCH** | `/requests/:id/reject` | Reject request | ✅ Yes |

#### Send Friend Request

```json
POST /api/requests
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "receiverId": 42
}
```

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation error",
  "success": false,
  "errors": ["Email is required"]
}
```

---

## 🔐 Authentication Flow

### JWT Token Strategy

```mermaid
sequenceDiagram
    participant Client
    participant Server as Express Server
    participant DB as Database

    Client->>Server: 1. POST /api/users/login (email, password)
    Server->>Server: 2. Verify Credentials
    Server->>Server: 3. Sign Access (7d) & Refresh (7d) Tokens
    Server->>DB: 4. Store refresh_token
    Server-->>Client: 5. Set httpOnly Cookies (access, refresh)
    Client->>Client: 6. Store user in AuthContext
    Client->>Client: 7. Redirect to /home
    
    Note over Client,Server: Subsequent API Requests
    
    Client->>Server: 8. Request + Cookies
    Server->>Server: 9. Auth Middleware (verifyJwt)
    Server->>Server: 10. Extract & verify token
    Server->>DB: 11. Controller executes query
    Server-->>Client: 12. Response
```

### Token Refresh Flow

When access token expires, the frontend can call `/api/users/refresh-token`:

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant DB

    Client->>Server: 1. POST /refresh-token (+ refreshToken cookie)
    Server->>Server: 2. Verify token from cookie
    Server->>DB: 3. Check if matching refresh_token in DB
    Server->>Server: 4. Generate new Access + Refresh Tokens
    Server->>DB: 5. Update refresh_token
    Server-->>Client: 6. Set new Cookies
    Client->>Client: 7. Retry failed request automatically
```

---

## 💬 Real-Time WebSocket Events

PaperChat uses **Socket.IO** for bidirectional real-time communication.

### Connection Flow

```javascript
// Client connects with JWT
const socket = io(VITE_SOCKET_URL, {
  auth: { accessToken: 'your-jwt-token' }
});

// Server verifies JWT and joins rooms
socket.userId = decoded.id;
socket.join(String(userId));        // Personal room
chats.forEach(chat => socket.join(String(chat.id))); // All chat rooms
```

### Events

#### Client → Server

| Event | Payload | Description |
| ----- | ------- | ----------- |
| `join_chat` | `{ chatId: number }` | Join a specific chat room |
| `send_message` | `{ chatId: number, content: string }` | Send new message |
| `edit_message` | `{ messageId: number, content: string }` | Edit existing message |
| `delete_message` | `{ messageId: number }` | Delete message |
| `call_user` | `{ chatId: number }` | Initiate video call to chat |
| `call_accepted` | `{ chatId: number }` | Accept incoming call |
| `webrtc_offer` | `{ chatId: number, offer: RTCSessionDescription }` | WebRTC session offer |
| `webrtc_answer` | `{ chatId: number, answer: RTCSessionDescription }` | WebRTC session answer |
| `webrtc_ice_candidate` | `{ chatId, candidate: RTCIceCandidate }` | WebRTC connection metadata |
| `call_rejected` | `{ chatId: number }` | Decline incoming call |
| `end_call` | `{ chatId: number }` | End an active video call |

#### Server → Client

| Event | Payload | Description |
| ----- | ------- | ----------- |
| `receive_message` | `{ id, content, chatId, senderId, ... }` | New message received |
| `message_updated` | `{ id, content, chatId, ... }` | Message edited |
| `message_deleted` | `{ messageId, chatId }` | Message removed |
| `new_chat` | `{ id, partner_name... }` | Friend request accepted, chat created |
| `incoming_call` | `{ from: number, chatId: number }` | Incoming video call |
| `call_accepted` | `{ from: number }` | Partner accepted call |
| `webrtc_offer` | `{ from, chatId, offer }` | Receiving remote WebRTC offer |
| `webrtc_answer` | `{ from, answer }` | Receiving remote WebRTC answer |
| `webrtc_ice_candidate` | `{ candidate }` | Receiving remote ICE candidate |
| `call_rejected` | `{ from: number }` | Partner rejected call |
| `call_ended` | `{ from: number }` | Partner ended the call |

### Example Usage

```javascript
// Send message (client)
socket.emit('send_message', {
  chatId: 5,
  content: 'Hello, world!'
});

// Receive message (client)
socket.on('receive_message', (message) => {
  console.log('New message:', message);
  // Update UI with new message
});

// Edit message (client)
socket.emit('edit_message', {
  messageId: 123,
  content: 'Updated message'
});

// Listen for edits (client)
socket.on('message_updated', (message) => {
  // Update message in chat history
});
```

### Room Broadcasting

Messages are broadcast only to users in the relevant chat room:

```javascript
// Server broadcasts to chat room
io.to(String(chatId)).emit('receive_message', message);
```

This ensures users only receive messages from chats they're part of.

---

## 🎨 Frontend Deep Dive

### Routing

| Path | Component | Access | Description |
| ---- | --------- | ------ | ----------- |
| `/` | `LandingPage` | Public | Landing page with CTA |
| `/login` | `LoginPage` | Guest only | Login form |
| `/home` | `HomePage` | 🔒 Auth | Chat list with search |
| `/chat/:chatId` | `ChatPage` | 🔒 Auth | Active chat with messages |
| `/add-user` | `AddUserPage` | 🔒 Auth | Search users & send requests |
| `/profile` | `ProfilePage` | 🔒 Auth | User settings & avatar upload |

### Context Providers

#### AuthContext

Manages authentication state across the app.

**State:**

- `user` — Current user object or `null`
- `loading` — Initial auth check loading state

**Methods:**

- `login(email, password)` — Login and set user
- `logout()` — Logout and clear user
- `updateUser(userData)` — Update user profile

**Usage:**

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  return <div>Welcome, {user.username}!</div>;
}
```

#### ChatContext

Manages chat and message state with real-time updates.

**State:**

- `chats` — Array of user's chats
- `messages` — Messages for current chat
- `socket` — Socket.IO client instance

**Methods:**

- `fetchChats()` — Load user's chats
- `fetchMessages(chatId)` — Load chat messages
- `sendMessage(chatId, content)` — Send via WebSocket
- `editMessage(messageId, content)` — Edit via WebSocket
- `deleteMessage(messageId)` — Delete via WebSocket

**Real-Time Listeners:**

```jsx
useEffect(() => {
  socket.on('receive_message', (message) => {
    setMessages(prev => [...prev, message]);
  });
  
  socket.on('message_updated', (message) => {
    setMessages(prev => 
      prev.map(m => m.id === message.id ? message : m)
    );
  });
  
  return () => {
    socket.off('receive_message');
    socket.off('message_updated');
  };
}, []);
```

### Paper Fold Design System

The app features a handcrafted paper aesthetic with:

**Typography:**

- `Caveat` — Primary handwritten font
- `Kalam` — Alternative handwritten
- `Patrick Hand` — Display font

**Visual Elements:**

- 📓 Notebook ruled lines (`background-image: repeating-linear-gradient`)
- 🎀 Washi tape accents (`.tape-accent` class)
- 📐 Folded corners (`:before` pseudo-elements)
- ✂️ Torn paper edges (`border-radius` with box-shadow)

**Custom Scrollbars:**

```css
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1e8d8;
}

::-webkit-scrollbar-thumb {
  background: #d4b895;
  border-radius: 5px;
}
```

---

## ⚡ Performance & Optimizations

| Optimization | Implementation | Impact |
| ------------ | -------------- | ------ |
| **Connection Pooling** | `postgres` library connection reuse | Reduced DB connection overhead |
| **Database Indexes** | Indexes on `chat_id`, `user_id`, `created_at` | 3-5x faster queries |
| **Auto Triggers** | PostgreSQL triggers for `updated_at` | Consistent timestamp updates |
| **Cloudinary CDN** | Auto-format, quality, and responsive transforms | <1s image load times |
| **CORS Optimization** | Specific origin whitelist | Reduced preflight requests |
| **Cookie Security** | `httpOnly`, `secure`, `sameSite` flags | XSS/CSRF protection |
| **Keep-Alive Ping** | Self-ping every 14min in production | Prevents cold starts on Render |
| **Compression** | (Ready to add) `compression` middleware | 60-70% response size reduction |
| **WebSocket Rooms** | Socket.IO room-based broadcasting | Only relevant clients receive updates |
| **Unique Chat Index** | `UNIQUE INDEX` on `(LEAST, GREATEST)` user pair | Prevents duplicate chats |

### Database Performance

**Indexes:**

```sql
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_chats_user1_id ON chats(user1_id);
CREATE INDEX idx_chats_user2_id ON chats(user2_id);
```

**Triggers:**

```sql
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🚢 Deployment

### Frontend — Vercel

The frontend is deployed on **Vercel** with SPA routing support.

**Configuration** (`vercel.json`):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Build Command:**

```bash
cd frontend
npm run build
```

**Environment Variables:**

- `VITE_API_URL` = `https://paperchat-b28g.onrender.com/api`
- `VITE_SOCKET_URL` = `https://paperchat-b28g.onrender.com`

**Deploy:**

```bash
# Via Vercel CLI
vercel --prod

# Or connect GitHub repo in Vercel dashboard (recommended)
```

### Backend — Render

The backend is deployed on **Render** as a Web Service.

**Configuration** (`render.yaml`):

```yaml
services:
  - type: web
    name: paperchat-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

**Start Command:**

```bash
npm start  # Runs: node src/index.js
```

**Environment Variables:**

Set in Render dashboard:

```
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://...
ACCESS_TOKEN_SECRET=your-secret
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_SECRET=your-secret
REFRESH_TOKEN_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
CORS_ORIGIN=https://paperchat-zeta.vercel.app
RENDER_EXTERNAL_URL=https://paperchat-b28g.onrender.com
```

> 🔒 **Security Note:** Ensure `CORS_ORIGIN` matches your Vercel frontend URL exactly.

### Database — Neon PostgreSQL

**Setup:**

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Add to `DATABASE_URL` env var
4. Schema auto-initializes on first connection

---

## 🔧 Troubleshooting

### Authentication Issues

| Problem | Possible Cause | Solution |
| ------- | -------------- | -------- |
| Login works but redirects to login | Cookies not being set | Ensure `credentials: true` in CORS and `withCredentials: true` in Axios |
| "Unauthorized" on all requests | JWT expired or invalid | Clear cookies and re-login |
| Socket connection fails | JWT not sent in handshake | Check `auth: { accessToken }` in socket connection |
| Cookie not sent cross-origin | `sameSite` misconfiguration | Set `sameSite: 'None', secure: true` in production |

### WebSocket Issues

| Problem | Possible Cause | Solution |
| ------- | -------------- | -------- |
| Messages not appearing | Socket not connected | Check `socket.connected` status |
| Duplicate messages | Multiple socket connections | Ensure socket cleanup in `useEffect` |
| Messages sent but not saved | Database error | Check server logs for SQL errors |

### Upload Issues

| Problem | Possible Cause | Solution |
| ------- | -------------- | -------- |
| Avatar upload fails | Cloudinary credentials wrong | Verify `CLOUDINARY_*` env vars |
| File too large | Size limit exceeded | Max 5MB for images |
| Wrong file type | Unsupported format | Use JPG, PNG, or WebP |

### Database Issues

| Problem | Possible Cause | Solution |
| ------- | -------------- | -------- |
| Connection timeout | Neon instance sleeping | Wake instance or use connection pooling |
| Duplicate chat error | Unique constraint violation | This is expected — existing chat is used |
| Migration errors on startup | Schema out of sync | Drop tables and restart (dev only) |

### General Debugging

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000
lsof -i :5173

# Run with verbose logging
DEBUG=* npm run dev

# Check database connection
node -e "import('postgres').then(p => { const sql = p.default('YOUR_DB_URL'); sql\`SELECT 1\`.then(() => console.log('✅ DB OK')); });"
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Guidelines

- Follow existing code patterns and architecture
- Keep components focused and single-purpose
- Add error handling and loading states
- Test on desktop and mobile viewports
- Use meaningful commit messages (Conventional Commits preferred)
- Update documentation if adding new features

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with 📄 and ✨ by [Your Name]**

[🌐 Live Demo](https://paperchat-zeta.vercel.app) · [Report Bug](https://github.com/YOUR_USERNAME/paperchat/issues) · [Request Feature](https://github.com/YOUR_USERNAME/paperchat/issues)

</div>
