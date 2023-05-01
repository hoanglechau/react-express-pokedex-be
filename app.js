require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

// routers
const indexRouter = require("./routes/index");

const { error } = require("console");

const app = express();

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// routes
app.use("/", indexRouter);

// 404 error
app.use((req, res) => {
  res.send(error);
});

// error handler
app.use((err, req, res) => {
  res.status(err.status || 400).send({ errors: { message: err.message } });
});

module.exports = app;
