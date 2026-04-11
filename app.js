if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const { autoUpdateTournamentStatus } = require("./middleware");


const authRoutes = require("./routes/auth");
const tournamentRoutes = require("./routes/tournament");
const applicationRoutes = require("./routes/application");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const orgApplicationRoutes = require("./routes/organiser-application");

const app = express();

// DB Connection
const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/battlearena";

mongoose.connect(dbUrl)
  .then(() => console.log("Connected to BattleArena DB"))
  .catch(err => console.log(err));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SESSION_SECRET
  },
  touchAfter: 24 * 3600
});

store.on("error", (err) => {
  console.log("Session store error", err);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};

app.use(session(sessionOptions));

// Passport
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/user");
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash
app.use(flash());

// Global locals — available in every EJS template
app.use((req, res, next) => {
  res.locals.currUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use(autoUpdateTournamentStatus);
// Routes
app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/tournaments", tournamentRoutes);
app.use("/tournaments", applicationRoutes);
app.use("/profile", profileRoutes);
app.use("/become-organiser", orgApplicationRoutes);

// 404
app.use((req, res) => {
  res.status(404).render("errors/404");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const { status = 500, message = "Something went wrong." } = err;
  res.status(status).render("errors/error", { message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));