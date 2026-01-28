# <div align="center">Amazon - E-commerce Platform</div>

### <div align="center">Full-Stack Web Development Academic Project</div>

<div align="center">

**Coventry University ID:** 14188606
**Student ID:** 230143

**Developed by:** [Parash Mainali]
(https://github.com/mainaliparash2-coder/CW2-ST6005CEM-SECURITY)

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=flat&logo=github)](https://github.com/mainaliparash2-coder/CW2-ST6005CEM-SECURITY)

</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Academic Context](#academic-context)
- [Project Inspiration](#project-inspiration)
- [Learning Objectives](#learning-objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [Screenshots](#screenshots)
- [Challenges & Solutions](#challenges--solutions)
- [Future Enhancements](#future-enhancements)
- [References](#references)

---

## Project Overview

This project represents a comprehensive full-stack e-commerce web application inspired by Amazon's platform architecture. It demonstrates the practical implementation of modern web development principles, including RESTful API design, database management, user authentication, and secure payment integration. The application provides end-to-end e-commerce functionality, from product browsing to order completion.

**Live Demo:** Only Available On localhost

---

## Academic Context

### Institution

**Coventry University**

### Course/Module

ST6005CEM Security

### Submission Date

Janaury-28 2026

### Supervisor/Instructor

Arya Pokharel

### Project Duration

March Intake

---

## Project Inspiration

The inspiration for this project stems from the desire to understand and replicate the complex architecture of modern e-commerce platforms. Amazon, being one of the world's largest online retailers, provides an excellent case study for implementing:

1. **Scalable Architecture:** Understanding how large-scale applications handle multiple concurrent users and transactions
2. **User Experience Design:** Implementing intuitive navigation and seamless checkout processes
3. **Secure Transactions:** Integrating payment gateways while maintaining data security and privacy
4. **Full-Stack Integration:** Bridging frontend user interfaces with robust backend systems

The project aims to demonstrate proficiency in modern web technologies while addressing real-world challenges faced by e-commerce platforms, including inventory management, user authentication, cart persistence, and payment processing.

---

## Learning Objectives

Through the development of this project, the following learning outcomes were achieved:

### Technical Skills

- ✅ Implementing the MERN stack (MongoDB, Express.js, React.js, Node.js)
- ✅ Designing and developing RESTful APIs
- ✅ Database schema design and NoSQL database management
- ✅ User authentication and authorization mechanisms
- ✅ State management in React applications
- ✅ Payment gateway integration (Razorpay)
- ✅ Version control using Git and GitHub

### Professional Skills

- ✅ Project planning and time management
- ✅ Problem-solving and debugging complex applications
- ✅ Code organization and documentation
- ✅ Security best practices in web development
- ✅ Understanding of e-commerce business logic

---

## Features

### Core Functionality

#### User Management

- **Registration & Authentication:** Secure user sign-up and sign-in functionality
- **Session Management:** Persistent user sessions with secure logout
- **Profile Management:** View and manage user profile information
- **Order History:** Track all previous purchases and order details

#### Product Browsing

- **Product Catalog:** Browse extensive product listings
- **Search Functionality:** Search products by name or category
- **Product Details:** Detailed product information and specifications

#### Shopping Cart

- **Cart Management:**
  - Add multiple products with quantity selection
  - Update product quantities dynamically
  - Remove unwanted items
  - Cart persistence across sessions
- **Instant Checkout:** Buy products immediately without cart addition

#### Payment Processing

- **Secure Payments:** Integration with Razorpay payment gateway
- **Multiple Payment Options:** Support for various payment methods
- **Order Confirmation:** Transaction verification and order placement

---

## Technology Stack

### Development Environment

| Category            | Technology                 |
| ------------------- | -------------------------- |
| **IDE**             | Visual Studio Code         |
| **Version Control** | Git & GitHub               |
| **Package Manager** | npm (Node Package Manager) |

### Frontend Technologies

| Technology       | Purpose                        |
| ---------------- | ------------------------------ |
| **React.js**     | Component-based UI development |
| **React Router** | Client-side routing            |
| **Axios**        | HTTP client for API requests   |
| **CSS3**         | Styling and responsive design  |

### Backend Technologies

| Technology     | Purpose                   |
| -------------- | ------------------------- |
| **Node.js**    | Runtime environment       |
| **Express.js** | Web application framework |
| **MongoDB**    | NoSQL database            |
| **Mongoose**   | MongoDB object modeling   |

### Additional Services

| Service          | Purpose                            |
| ---------------- | ---------------------------------- |
| **Razorpay API** | Payment gateway integration        |
| **JWT**          | JSON Web Tokens for authentication |
| **bcrypt**       | Password hashing                   |

---

## System Architecture

### Architecture Pattern

The application follows a **three-tier architecture**:

1. **Presentation Layer (Frontend):** React.js handles the user interface and client-side logic
2. **Application Layer (Backend):** Express.js manages business logic, authentication, and API endpoints
3. **Data Layer (Database):** MongoDB stores user data, product information, and order details

### Data Flow

```
User Interface (React)
    ↕ (HTTP/HTTPS)
REST API (Express.js)
    ↕ (Mongoose ODM)
Database (MongoDB)
```

### Key Design Patterns

- **MVC (Model-View-Controller):** Separation of concerns in backend structure
- **Component-Based Architecture:** Reusable React components
- **RESTful API Design:** Standard HTTP methods for CRUD operations
- **Authentication Middleware:** JWT-based protected routes

---

## Installation & Setup

### Prerequisites

- Node.js (v14.x or higher)
- MongoDB (v4.x or higher)
- npm (v6.x or higher)
- Git

### Backend Setup

1. **Clone the repository:**

```bash
git clone https://github.com/mainaliparash2-coder/CW2-ST6005CEM-SECURITY
cd CW2-ST6005CEM-SECURITY
```

2. **Install server dependencies:**

```bash
npm install
```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret
```

4. **Start the server:**

```bash
nodemon
```

Server runs at: http://localhost:5000/

### Frontend Setup

1. **Navigate to client directory:**

```bash
cd client
```

2. **Install client dependencies:**

```bash
npm install
```

3. **Start the React application:**

```bash
npm start
```

Client runs at: http://localhost:3000/

---

## Screenshots

### Home Page

![Home Page](https://user-images.githubusercontent.com/84243683/168798477-5441dcb3-f0dc-422d-83bb-e14dee297576.png)
_Main landing page displaying featured products and navigation_

### User Authentication

**Sign Up**
![Sign Up](https://user-images.githubusercontent.com/84243683/168797684-01651633-52f3-40e9-887a-8cbca72d4491.png)
_User registration with form validation_

**Sign In**
![Sign In](https://user-images.githubusercontent.com/84243683/168797547-ccbac103-eb06-49dc-a509-d61caf15603f.png)
_Secure login functionality_

### Shopping Experience

**Product Details**
![Product](https://user-images.githubusercontent.com/84243683/168797859-25d26a38-d48c-48fa-8ff5-d21ade5621b4.png)
_Detailed product information and add to cart_

**Shopping Cart**
![Cart](https://user-images.githubusercontent.com/84243683/168797981-ea56d3a5-256f-4280-b75a-7fa54952c147.png)
_Cart management with quantity updates_

**Payment Gateway**
![Payment](https://user-images.githubusercontent.com/84243683/168798064-dc774ad5-89e6-4a83-aecd-ebcf75c6cd80.png)
_Razorpay payment integration_

### User Dashboard

**Profile**
![Profile](https://user-images.githubusercontent.com/84243683/168798275-e195649f-f0e6-4648-b96d-2c09ab6a72d5.png)
_User profile information_

**Order History**
![Orders](https://user-images.githubusercontent.com/84243683/168798196-7ed1a8a0-7622-428f-a291-84d9ca92ee06.png)
_Complete order tracking_

---

## Challenges & Solutions

### Challenge 1: Authentication & Session Management

**Problem:** Maintaining user sessions across different pages and browser refreshes.  
**Solution:** Implemented JWT (JSON Web Tokens) stored in localStorage with token verification on protected routes.

### Challenge 2: Cart Persistence

**Problem:** Retaining cart items when users close and reopen the application.  
**Solution:** Integrated cart data with user profiles in MongoDB, ensuring cart synchronization across devices.

### Challenge 3: Payment Integration

**Problem:** Securing payment transactions and handling payment failures.  
**Solution:** Utilized Razorpay's secure API with server-side verification and error handling mechanisms.

### Challenge 4: Real-time Updates

**Problem:** Keeping cart quantities and prices updated dynamically.  
**Solution:** Implemented React state management with useEffect hooks for real-time UI updates.

---

## Future Enhancements

Based on the learning experience, the following features could enhance the project:

### Technical Improvements

- [ ] Implement Redux for advanced state management
- [ ] Add product reviews and ratings system
- [ ] Integrate advanced search with filters and sorting
- [ ] Implement wishlist functionality
- [ ] Add email notifications for order confirmations
- [ ] Deploy to cloud platforms (AWS, Heroku, or Vercel)

### User Experience

- [ ] Implement recommendation engine
- [ ] Add product comparison feature
- [ ] Create admin dashboard for product management
- [ ] Implement order tracking system
- [ ] Add multi-language support

### Security Enhancements

- [ ] Implement two-factor authentication
- [ ] Add CAPTCHA for bot prevention
- [ ] Enhanced input validation and sanitization
- [ ] Rate limiting for API endpoints

---

## References

### Documentation

1. **React.js Documentation** - https://react.dev/
2. **Express.js Guide** - https://expressjs.com/
3. **MongoDB Manual** - https://docs.mongodb.com/
4. **Node.js Documentation** - https://nodejs.org/docs/
5. **Razorpay API Documentation** - https://razorpay.com/docs/

### Learning Resources

1. MERN Stack Development Best Practices
2. RESTful API Design Principles
3. Web Application Security Standards (OWASP)
4. E-commerce Platform Architecture Patterns

### Similar Projects & Inspiration

1. Amazon.com - Platform Architecture Analysis
2. Full-Stack E-commerce Case Studies
3. Payment Gateway Integration Tutorials

---

## Acknowledgments

I would like to express my gratitude to:

- **Coventry University** for providing the academic framework and resources
- **[Supervisor Name]** for guidance and support throughout the project
- The open-source community for excellent documentation and learning resources
- Razorpay for their comprehensive payment integration documentation

---

## License

This project is developed for academic purposes as part of coursework at Coventry University.

---

## Contact

**Developer:** Parash Mainali
**GitHub:** (https://github.com/mainaliparash2-coder)  
**Repository:** [Click Here](https://github.com/mainaliparash2-coder/CW2-ST6005CEM-SECURITY)  
**University ID:** 14188606

---

<div align="center">

**Coventry University | [2026] | Full-Stack Web Development**

_This project demonstrates the practical application of modern web technologies in building scalable e-commerce solutions._

</div>
