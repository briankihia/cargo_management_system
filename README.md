# 🌊 Global Cargo Shipping Management System 🚢

![Status](https://img.shields.io/badge/Status-Development-blue)  
![License](https://img.shields.io/badge/License-MIT-green)  
![Database](https://img.shields.io/badge/Database-MySQL-orange)  
![Backend](https://img.shields.io/badge/Backend-Django%20|%20Node.js-purple)  
![Frontend](https://img.shields.io/badge/Frontend-React%20|%20Bootstrap-pink)  

> 📅 **ICTA Internship Project No. 3** — *15 July 2025*  
> 🛳️ A **maritime logistics management platform** for registering ships, managing crew, tracking cargo, scheduling shipments, and monitoring operations across global shipping routes.

---

## 📖 Overview

The **Global Cargo Shipping Management System** is a comprehensive platform designed for shipping companies to **track, schedule, and optimize cargo shipments across continents**.  
It integrates **ships, crew, ports, clients, cargo, and shipments** into a single, unified dashboard.

This system aims to:
- 📦 Improve **cargo visibility**  
- 🗺️ Optimize **route planning**  
- ⚙️ Streamline **ship & crew management**  
- 📊 Support **data-driven decisions**

---

## ✨ Features

### 🚢 Ship Registration & Tracking
- Register ships with **name, type, registration number, and capacity**.
- Track location by **port or coordinates**.
- Manage statuses: `Active`, `Under Maintenance`, `Decommissioned`.

### 🧑‍✈️ Crew Management
- Add crew with **role, nationality, and contact details**.
- Assign crew to specific ships.
- Track active/inactive status.

### 🏢 Client Management
- Register client companies and contact persons.
- Link cargo ownership to clients.
- Activate/deactivate clients without deleting history.

### 📦 Cargo Management
- Create cargo records with **weight, volume, and type**.
- Assign cargo to clients.
- Archive completed shipments without losing history.

### 📍 Ports Management
- Maintain a global ports database with **coordinates, capacity, customs clearance**.
- Filter ports by country, type, and operational status.

### ⛴️ Shipment Management
- Schedule shipments with **origin & destination ports**.
- Track **departure, estimated arrival, and actual arrival**.
- Manage statuses: `Pending`, `In Transit`, `Delivered`, `Delayed`.

---

## 🗄️ Database Schema (MySQL)

The system uses a **normalized MySQL database** with relational integrity via foreign keys.

**Core Tables**:
- `clients`
- `ships`
- `crew`
- `ports`
- `cargo`
- `shipments`

**Schema Highlights**:
- `is_active` flag for soft deletion.
- ENUM fields for **statuses and types**.
- **Foreign keys** to maintain relationships.

---

## 📌 User Stories

### As an **Admin**, I can:
1. **Add/Edit/Deactivate Ships** to manage fleet capacity.
2. **Assign Crew** to ships and track active staff.
3. **Manage Clients** and their cargo records.
4. **Add/Edit Ports** with capacity & customs data.
5. **Register Cargo** with safety protocols for dangerous goods.
6. **Schedule Shipments** with real-time tracking.

---

## 🛠️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| **Frontend** | React.js, Bootstrap, Chart.js (for analytics) |
| **Backend**  | Django REST Framework / Node.js (API) |
| **Database** | MySQL |
| **Deployment** | Docker, Nginx |
| **Version Control** | Git & GitHub |

---

## 🎯 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/global-cargo-shipping.git
cd global-cargo-shipping
2️⃣ Backend Setup (Django)
bash
Copy
Edit
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
3️⃣ Frontend Setup (React)
bash
Copy
Edit
cd frontend
npm install
npm start
📊 Example Dashboard View
text
Copy
Edit
🚢 Ships: 25 Active | 3 Under Maintenance
🧑‍✈️ Crew: 120 Total | 110 Active
📦 Cargo: 350 Records | 280 Active
⛴️ Shipments: 50 In Transit | 12 Delivered
🔮 Future Enhancements
🌐 Live GPS Tracking of ships via API integration.

📱 Mobile App for on-the-go access.

📊 Advanced Analytics Dashboard with predictive ETAs.

📤 Automated Email Notifications for shipment status updates.

📜 License
This project is licensed under the MIT License.

🙌 Acknowledgements
ICTA Internship Program

Open Source Community

To God be All the Glory