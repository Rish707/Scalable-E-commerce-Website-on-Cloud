# 🛍️ ShopWave — Full-Stack E-Commerce Application

> **College Project** | Node.js + MongoDB + AWS Cloud Architecture

A complete full-stack e-commerce web application demonstrating scalable cloud deployment on AWS with CloudFront CDN, Application Load Balancer, Auto Scaling Groups, and MongoDB.

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Local Setup](#-local-setup)
- [AWS EC2 Deployment](#-aws-ec2-deployment)
- [API Reference](#-api-reference)
- [Cloud Architecture](#-cloud-architecture)
- [Screenshots](#-screenshots)

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🏠 **Home Page** | Hero section, featured products, category grid, architecture banner |
| 🛒 **Products Page** | Filter by category, search, sort (price/rating), pagination |
| 🛍️ **Cart Page** | Add/remove/update items, quantity controls, promo codes, order summary |
| 🔐 **Login/Register** | JWT authentication, bcrypt password hashing, tab-switching UI |
| ☁️ **Cloud Architecture** | CloudFront → ALB → EC2 ASG → MongoDB (full concept + code) |
| 📡 **REST API** | Products, Cart, Auth endpoints with proper error handling |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| HTML5 + CSS3 | Structure and dark-mode glassmorphism UI |
| Vanilla JavaScript | DOM manipulation, API calls, auth handling |
| Google Fonts (Inter) | Modern typography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 18+ | Runtime environment |
| Express.js | HTTP server and routing |
| Mongoose | MongoDB ODM (Object Document Mapper) |
| JWT (jsonwebtoken) | Stateless authentication |
| bcryptjs | Password hashing |
| Morgan | HTTP request logging |
| CORS | Cross-Origin Resource Sharing |

### Database
| Option | Details |
|--------|---------|
| MongoDB (local) | `mongodb://localhost:27017/shopwave` |
| MongoDB Atlas | Free 512MB cloud cluster |
| Amazon RDS MySQL | Optional — see `.env.example` |

### Cloud (AWS)
| Service | Role |
|---------|------|
| EC2 (t3.micro) | Hosts Node.js backend server |
| Application Load Balancer | Distributes traffic across EC2 instances |
| Auto Scaling Group | Scales EC2 count based on CPU load |
| CloudFront | CDN for static files + HTTPS termination |
| S3 (optional) | Hosts frontend static files |
| RDS (optional) | Managed MySQL database |

---

## 📁 Project Structure

```
assignment1/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema (name, email, password, cart)
│   │   └── Product.js       # Product schema (name, price, category, ...)
│   ├── routes/
│   │   ├── auth.js          # POST /register, POST /login
│   │   ├── products.js      # GET /products, GET /products/:id
│   │   └── cart.js          # GET/POST/PUT/DELETE /cart (JWT protected)
│   ├── middleware/
│   │   └── auth.js          # JWT verification middleware
│   ├── server.js            # Express app entry point
│   ├── seed.js              # Database seeder (12 sample products)
│   ├── package.json
│   ├── .env.example         # Environment variables template
│   └── .gitignore
├── frontend/
│   ├── pages/
│   │   ├── index.html       # Home page
│   │   ├── products.html    # Products listing page
│   │   ├── cart.html        # Shopping cart page
│   │   └── login.html       # Login / Register page
│   ├── css/
│   │   └── style.css        # Global design system (dark mode + glassmorphism)
│   └── js/
│       └── app.js           # Shared API client, auth helpers, toast notifications
└── docs/
    └── architecture.md      # Detailed AWS architecture explanation
```

---

## 🚀 Local Setup

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (or MongoDB Atlas)
- Git

### Step 1 — Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/shopwave.git
cd shopwave
```

### Step 2 — Setup Backend
```bash
cd backend
npm install
```

### Step 3 — Configure Environment Variables
```bash
# Copy the example file
copy .env.example .env       # Windows
cp .env.example .env         # Mac/Linux

# Edit .env with your values:
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopwave
JWT_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
```

### Step 4 — Seed the Database
```bash
# Make sure MongoDB is running first!
node seed.js
# Output: Seeded 12 products successfully!
```

### Step 5 — Start the Backend Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

You should see:
```
✅ MongoDB connected: mongodb://localhost:27017/shopwave
🚀 ShopWave API running on port 5000
   Health Check: http://localhost:5000/health
```

### Step 6 — Open the Frontend
```bash
# No build step needed! Open directly in browser:
# Windows:
start frontend/pages/index.html

# Or use VS Code Live Server extension for best experience
```

> **Tip:** If using VS Code, install the **Live Server** extension and click "Go Live" for hot-reload.

---

## ☁️ AWS EC2 Deployment

### Prerequisites
- AWS account (Free Tier works)
- Key pair (.pem file) for SSH
- EC2 instance: `t3.micro`, Ubuntu 22.04 LTS, port 5000 open in Security Group

### Step 1 — Launch EC2 Instance (AWS Console)
1. Go to EC2 → Launch Instance
2. Choose: **Ubuntu Server 22.04 LTS** (Free Tier)
3. Instance type: **t3.micro**
4. Key pair: Create or select existing
5. Security Group — Add rules:
   - SSH (port 22) — your IP
   - Custom TCP (port 5000) — 0.0.0.0/0 (or ALB security group only)
   - HTTP (port 80) — 0.0.0.0/0
6. Launch

### Step 2 — SSH Into EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Step 3 — Install Node.js & MongoDB on EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version   # v18.x.x
npm --version    # 9.x.x

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB
sudo systemctl status mongod
```

### Step 4 — Clone & Setup Application
```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/shopwave.git
cd shopwave/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

Paste into nano:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/shopwave
JWT_SECRET=your_super_secret_key_here_make_it_long
NODE_ENV=production
```
Press `Ctrl+X`, then `Y`, then `Enter` to save.

### Step 5 — Seed Database & Start Server
```bash
# Seed products
node seed.js

# Start server (test)
node server.js
```

### Step 6 — Run as Background Service with PM2
```bash
# Install PM2 process manager
sudo npm install -g pm2

# Start ShopWave with PM2
pm2 start server.js --name "shopwave-api"

# Auto-start on reboot
pm2 startup
pm2 save

# Useful PM2 commands
pm2 status           # View running processes
pm2 logs shopwave-api  # View live logs
pm2 restart shopwave-api
pm2 stop shopwave-api
```

### Step 7 — Test Your Deployment
```bash
# From EC2 (local test)
curl http://localhost:5000/health

# From browser (replace with your EC2 IP)
http://YOUR_EC2_PUBLIC_IP:5000/health
http://YOUR_EC2_PUBLIC_IP:5000/api/products
```

Expected response:
```json
{
  "status": "OK",
  "server": "ShopWave API",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Step 8 — Update Frontend API URL
In `frontend/js/app.js`, change:
```javascript
// From:
const API_BASE = 'http://localhost:5000/api';

// To:
const API_BASE = 'http://YOUR_EC2_PUBLIC_IP:5000/api';
// Or with CloudFront:
const API_BASE = 'https://YOUR_CLOUDFRONT_DOMAIN/api';
```

---

## ⚙️ Setting Up Load Balancer + Auto Scaling

### Create Application Load Balancer
1. EC2 → Load Balancers → Create → **Application Load Balancer**
2. Name: `shopwave-alb`
3. Scheme: Internet-facing
4. Listener: HTTP:80
5. Availability Zones: Select at least 2
6. Create **Target Group**: `shopwave-tg`, Protocol HTTP, Port 5000
7. Health Check path: `/health`
8. Register your EC2 instance as target

### Create Auto Scaling Group
1. EC2 → Auto Scaling Groups → Create
2. **Launch Template**: Ubuntu 22.04, t3.micro, with User Data:
```bash
#!/bin/bash
apt update
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs git
npm install -g pm2
git clone https://github.com/YOUR_USERNAME/shopwave.git /app
cd /app/backend
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://YOUR_MONGODB_IP:27017/shopwave
JWT_SECRET=your_secret_here
NODE_ENV=production
EOF
npm install
node seed.js
pm2 start server.js --name shopwave-api
pm2 startup
pm2 save
```
3. Min: 1, Max: 6, Desired: 2
4. Attach to `shopwave-alb` Target Group
5. Add **Scaling Policy**: Target tracking → CPU Utilization → 70%

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{name, email, password}` | Register new user |
| POST | `/api/auth/login` | `{email, password}` | Login, returns JWT |

### Products

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| GET | `/api/products` | `category, search, sort, page, limit` | List all products |
| GET | `/api/products/:id` | — | Single product |

### Cart (🔒 JWT Required)

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | — | Get user's cart |
| POST | `/api/cart/add` | `{productId, quantity}` | Add item |
| PUT | `/api/cart/update` | `{productId, quantity}` | Update quantity |
| DELETE | `/api/cart/remove/:id` | — | Remove single item |
| DELETE | `/api/cart/clear` | — | Empty the cart |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server + uptime status (used by ALB) |

**JWT Usage (protected routes):**
```
Authorization: Bearer <your_jwt_token>
```

---

## 🏗 Cloud Architecture

```
User → CloudFront (CDN) → ALB (Load Balancer) → EC2 Instances (Auto Scaling) → MongoDB
```

| Component | Role |
|-----------|------|
| **CloudFront** | Caches static assets at 200+ edge locations globally. Forwards `/api/*` to ALB. |
| **ALB** | Routes requests to healthy EC2 instances. Health-checks `/health` every 30s. |
| **Auto Scaling Group** | Adds EC2s when CPU > 70%; removes when CPU < 30%. Min 1, Max 6. |
| **EC2 (Node.js)** | Stateless API server — no local session state, JWT-based auth. |
| **MongoDB** | Single external database shared by all EC2 instances. |

📖 See [docs/architecture.md](docs/architecture.md) for full diagrams and explanations.

---

## 👨‍💻 Development Scripts

```bash
# Backend
cd backend
npm start          # Start production server
npm run dev        # Start with nodemon (auto-reload)
node seed.js       # Seed database with 12 sample products

# Test API
curl http://localhost:5000/health
curl http://localhost:5000/api/products
curl http://localhost:5000/api/products?category=Electronics&sort=price_asc
```

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/shopwave` |
| `JWT_SECRET` | Secret for signing tokens | *(required)* |
| `NODE_ENV` | Environment mode | `development` |

---

## 🔐 Security Notes

- Passwords hashed with **bcrypt** (12 salt rounds)
- JWT tokens expire in **7 days**
- All sensitive config in `.env` (never committed to Git)
- CORS configured — restrict `origin` to your CloudFront domain in production
- ALB Security Group: Only allow traffic from CloudFront IPs in production

---

## 🎓 College Project Notes

This project covers:
- ✅ Full-stack CRUD application (Node.js + MongoDB)
- ✅ RESTful API design with proper HTTP methods and status codes
- ✅ JWT-based stateless authentication
- ✅ Cloud deployment concepts (EC2, ALB, ASG, CloudFront, RDS)
- ✅ Scalability patterns (horizontal scaling, CDN, load balancing)
- ✅ Database design with Mongoose schemas
- ✅ Security best practices (bcrypt, JWT, environment variables)

---

## 📄 License

MIT License — Free to use for educational purposes.

---

*Built with ❤️ using Node.js, MongoDB, and AWS*
