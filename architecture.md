# ShopWave Architecture Documentation

## System Architecture Overview

```
                        ┌─────────────────────────────────────────────────────────────┐
                        │                    AWS CLOUD INFRASTRUCTURE                  │
                        │                                                               │
  ┌──────────┐          │  ┌──────────────┐    ┌──────────────┐    ┌────────────────┐ │
  │          │  HTTPS   │  │              │    │ Application  │    │   Auto Scaling │ │
  │   User   │─────────►│  │  CloudFront  │───►│   Load       │───►│     Group      │ │
  │ Browser  │          │  │    (CDN)     │    │  Balancer    │    │  (EC2 × 1..N)  │ │
  │          │          │  │              │    │    (ALB)     │    │                │ │
  └──────────┘          │  └──────────────┘    └──────────────┘    └───────┬────────┘ │
                        │         │                                         │          │
                        │         │ Static Assets                           │ API      │
                        │         ▼                                         ▼          │
                        │  ┌──────────────┐                      ┌─────────────────┐  │
                        │  │   Amazon S3  │                      │  Amazon RDS /   │  │
                        │  │ (HTML/CSS/JS)│                      │  MongoDB Atlas  │  │
                        │  └──────────────┘                      └─────────────────┘  │
                        │                                                               │
                        └─────────────────────────────────────────────────────────────┘
```

---

## Component Explanations

### 1. Amazon CloudFront (CDN)

**What it does:**
CloudFront is a Content Delivery Network (CDN) that caches and delivers static content (HTML, CSS, JavaScript, images) from **edge locations** physically close to the user.

**Why we use it:**
- Reduces latency by serving static files from the nearest AWS edge location (200+ worldwide)
- Offloads traffic from EC2 instances (only dynamic API calls reach backend)
- Provides HTTPS termination and DDoS protection at the edge level
- Dramatically speeds up page load time for global users

**How it works in ShopWave:**
```
User in Mumbai → CloudFront Edge (Mumbai) → cached HTML/CSS/JS served instantly
                                           → /api/* requests forwarded to Load Balancer
```

**CloudFront configuration (simplified):**
```
Origin 1: S3 bucket (static frontend files)     → cached at edge
Origin 2: ALB DNS name (API requests /api/*)    → forwarded, NOT cached
Cache Behavior:
  - /api/* → No cache, forward all headers
  - /*     → Cache for 86400 seconds (24h)
```

---

### 2. Application Load Balancer (ALB)

**What it does:**
The ALB distributes incoming HTTP/HTTPS requests evenly across multiple EC2 instances using a **round-robin** algorithm (or least-connections).

**Why we use it:**
- **Single entry point**: Users/CloudFront always hit one stable DNS name regardless of how many EC2s are running
- **Health checks**: ALB continuously checks `/health` endpoint on each EC2. If an instance fails, ALB stops sending traffic to it automatically
- **High Availability**: Spread across multiple Availability Zones (AZs)

**Health Check config:**
```
Protocol : HTTP
Path     : /health
Interval : 30 seconds
Threshold: 2 consecutive successes = healthy
           2 consecutive failures  = unhealthy → removed from rotation
```

**Traffic distribution example:**
```
Request 1  →  EC2-A (Node.js on port 5000)
Request 2  →  EC2-B (Node.js on port 5000)
Request 3  →  EC2-C (Node.js on port 5000)
EC2-B dies →  ALB detects via health check → only A and C receive traffic
```

---

### 3. Auto Scaling Group (ASG)

**What it does:**
ASG automatically adds or removes EC2 instances based on real-time demand metrics (CPU, memory, request count).

**Why we use it:**
- **Scale out** (add instances) during traffic spikes → handle more users
- **Scale in** (remove instances) during low traffic → save costs
- Ensures a minimum number of instances are always running for reliability

**Our Scaling Policy (CPU-based):**

| Condition                    | Action                        |
|------------------------------|-------------------------------|
| CPU usage > 70% for 3 min   | Add 2 EC2 instances           |
| CPU usage < 30% for 5 min   | Remove 1 EC2 instance         |
| Always maintain minimum       | Min: 1 instance, Max: 6       |

**AWS CLI to create scaling policy:**
```bash
# Scale-out policy (add instances when CPU > 70%)
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name ShopWave-ASG \
  --policy-name ScaleOut-CPU70 \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 70.0,
    "ScaleOutCooldown": 60,
    "ScaleInCooldown": 300
  }'
```

---

### 4. EC2 Instances (Node.js Backend)

Each EC2 instance runs an identical copy of the ShopWave Node.js/Express API server.

**Recommended instance type for college project:** `t3.micro` (Free Tier eligible)  
**Production recommendation:** `t3.small` or `t3.medium`

**What runs on each EC2:**
```
Port 5000: Node.js Express server
           ├── /api/auth     → User registration & login
           ├── /api/products → Product catalog with filters
           ├── /api/cart     → Cart CRUD (JWT protected)
           └── /health       → ALB health check endpoint
```

**Stateless Design (critical for scaling):**
- EC2 instances store NO session data locally
- Authentication uses JWT tokens (stored client-side)
- All data stored in MongoDB (external to EC2)
- Any instance can handle any request → perfect for load balancing

---

### 5. Amazon RDS / MongoDB

**What it does:**
Persistent storage layer for users, products, and cart data.

**Options:**
| Option | Use Case |
|--------|----------|
| MongoDB Atlas (Free) | Easiest for college project, cloud-managed |
| MongoDB on EC2 | Full control, manual management |
| Amazon RDS (MySQL) | If you prefer relational DB |

**Why separate from EC2:**
- Data persists even if all EC2 instances are replaced during scaling
- Single source of truth for all instances
- Managed backups, replication, failover

---

## Request Flow (End-to-End)

```
1. User opens browser → https://shopwave.example.com

2. DNS resolves to CloudFront distribution

3. Request type check:
   a. Static asset (HTML/CSS/JS)?
      → CloudFront returns cached file from edge location (< 5ms)
   b. API call (/api/products)?
      → CloudFront forwards to ALB

4. ALB receives API request
   → Health checks all EC2 instances
   → Routes to healthiest/least-busy EC2

5. EC2 (Node.js) processes request:
   → Validates JWT token (if protected route)
   → Queries MongoDB
   → Returns JSON response

6. Response travels back: EC2 → ALB → CloudFront → User
```

---

## Cost Estimate (AWS Free Tier)

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| EC2 t3.micro | 750 hrs/month | ~$8/month |
| ALB | 750 hrs/month | ~$16/month |
| CloudFront | 1TB transfer/month | ~$0.085/GB |
| MongoDB Atlas | 512MB free forever | ~$0-57/month |
| RDS (if used) | 750 hrs/month | ~$13/month |

**Total for college project: ~$0 (Free Tier)**

---

## Security Checklist

- [x] JWT tokens expire in 7 days
- [x] Passwords hashed with bcrypt (12 rounds)
- [x] CORS configured (restrict to CloudFront domain in production)
- [x] Environment variables for all secrets (never hardcoded)
- [ ] Production: Enable HTTPS on ALB (SSL certificate via ACM)
- [ ] Production: Set up Security Groups (only port 5000 from ALB, not public)
- [ ] Production: Enable CloudFront WAF for DDoS protection
