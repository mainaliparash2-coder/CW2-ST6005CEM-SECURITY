// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");
// const cookieParser = require("cookie-parser");
// const path = require("path");

// const https = require("https");
// const fs = require("fs");

// const port = process.env.PORT || 5000;
// const { connectDB, createInitialAdmin } = require("./database/connection.js");

// const app = express();

// // =====================
// // MIDDLEWARE (FIRST)
// // =====================
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(cookieParser(""));

// // Proper CORS for HTTPS + cookies
// app.use(
//   cors({
//     credentials: true,
//     origin: ["http://localhost:3000/", "https://localhost:3000/"],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // =====================
// // FORCE HTTP → HTTPS (AFTER middleware)
// // =====================
// app.use((req, res, next) => {
//   if (req.headers["x-forwarded-proto"] === "http" || req.protocol === "http") {
//     return res.redirect(`https://${req.headers.host}${req.url}`);
//   }
//   next();
// });

// // =====================
// // ROUTES
// // =====================
// const router = require("./routes/router");
// const adminRoutes = require("./routes/adminRoutes");

// app.use("/api", router);
// app.use("/api/admin", adminRoutes);

// // =====================
// // PRODUCTION BUILD
// // =====================
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("client/build"));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client/build", "index.html"));
//   });
// }

// // =====================
// // HTTPS SERVER
// // =====================
// const httpsOptions = {
//   key: fs.readFileSync("./ssl/localhost-key.pem"),
//   cert: fs.readFileSync("./ssl/localhost.pem"),
// };

// https.createServer(httpsOptions, app).listen(port, function () {
//   console.log("===========================================");
//   console.log("HTTPS Server running at: https://localhost:" + port);
//   console.log("Admin panel: https://localhost:" + port + "/api/admin");
//   console.log("===========================================");

//   connectDB();
//   createInitialAdmin();
// });

// // Libraries
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const port = process.env.PORT || 8000;
// var path = require('path');

// const app = express();

// // Database connection
// require('./database/connection');

// // Product Model
// const Product = require('./models/Product');

// // Routes
// const router = require('./routes/router');

// // Middleware
// app.use(morgan('dev'));
// app.use(express.json());
// app.use(cookieParser(""));
// app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
// app.use('/api', router);

// // For deployment
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('client/build'));
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname,  "client/build", "index.html"));
//   });
// }

// // Server
// app.listen(port, function() {
//   console.log("Server started at port " + port);
// })

// // ===== To store data from productsData.js =====
// // const defaultData = require('./defaultData');
// // defaultData();

// ==========================================
// ENHANCED INDEX.JS - ADDS ADMIN FUNCTIONALITY
// Original code preserved, only additions made
// ==========================================

// Libraries
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
var path = require("path");
const { connectDB, createInitialAdmin } = require("./database/connection.js");

const app = express();

// Database connection
require("./database/connection");

// Product Model
const Product = require("./models/Product");

// Routes
const router = require("./routes/router");

// ===== NEW: ADMIN ROUTES (ADDED) =====
const adminRoutes = require("./routes/adminRoutes");
// =====================================

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser(""));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// ===== UPDATED: Add admin routes prefix =====
app.use("/api", router);
app.use("/api/admin", adminRoutes);
// ============================================

// For deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client/build", "index.html"));
  });
}

// Server
app.listen(port, function () {
  console.log("Server started at port " + port);
  console.log(
    "Admin panel available at: http://localhost:" + port + "/api/admin",
  );
  connectDB();
  createInitialAdmin();
});
