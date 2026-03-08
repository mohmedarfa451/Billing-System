# 📄 Billing & Invoice Management System

![Project Status](https://img.shields.io/badge/Status-Complete-green)
![Framework](https://img.shields.io/badge/Backend-Laravel-red)
![Library](https://img.shields.io/badge/Frontend-React-blue)

A professional Full-Stack application designed to streamline invoice management and business tracking, built with **Laravel** and **React.js**.

## 🚀 Key Features

- **Business Insights Dashboard:** Real-time tracking of total sales, invoice counts, and active customers.
- **Dynamic Invoicing:** Create, view, and manage detailed invoices with multi-item support.
- **Professional PDF Export:** Generate and download professional PDF invoices using DomPDF.
- **Secure Authentication:** User-specific data isolation using Laravel Sanctum, ensuring users only access their own invoices.
- **Customer Management:** Link invoices to specific customers with full data persistence.

## 🛠 Tech Stack

- **Frontend:** React.js, Axios, React Router, CSS3.
- **Backend:** Laravel (PHP), RESTful API.
- **Database:** MySQL.
- **Version Control:** Git & GitHub.

## ⚙️ Installation & Setup

1. **Backend Setup:**
   ```bash
   cd backend
   composer install
   php artisan migrate
   php artisan serve