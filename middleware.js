const Tournament = require("./models/tournament");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to do that.");
    return res.redirect("/login");
  }
  if (req.user.banned) {
    req.logout(err => {
      if (err) return next(err);
      return res.redirect("/banned");
    });
  }
  next();
};

module.exports.isOrganiser = (req, res, next) => {
  if (!req.user || (req.user.role !== "organiser" && req.user.role !== "admin")) {
    req.flash("error", "Only organisers can do that.");
    return res.redirect("/tournaments");
  }
  next();
};

module.exports.isPlayer = (req, res, next) => {
  if (!req.user || (req.user.role !== "player" && req.user.role !== "organiser")) {
    req.flash("error", "Only players can apply to tournaments.");
    return res.redirect("back");
  }
  next();
};

module.exports.isTournamentOwner = async (req, res, next) => {
  const { id } = req.params;
  const tournament = await Tournament.findById(id);
  if (!tournament) {
    req.flash("error", "Tournament not found.");
    return res.redirect("/tournaments");
  }
  if (!tournament.organiser.equals(req.user._id)) {
    req.flash("error", "You are not the organiser of this tournament.");
    return res.redirect(`/tournaments/${id}`);
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    req.flash("error", "Access denied.");
    return res.redirect("/tournaments");
  }
  next();
};

module.exports.autoUpdateTournamentStatus = async (req, res, next) => {
  try {
    const Tournament = require("./models/tournament");
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const upcomingToOngoing = await Tournament.updateMany(
      { status: "upcoming", startDate: { $lte: now } },
      { $set: { status: "ongoing" } }
    );

    const ongoingToCompleted = await Tournament.updateMany(
      { status: "ongoing", startDate: { $lte: sevenDaysAgo } },
      { $set: { status: "completed" } }
    );

    console.log(`Status update: ${upcomingToOngoing.modifiedCount} → ongoing, ${ongoingToCompleted.modifiedCount} → completed`);
  } catch (err) {
    console.error("Status auto-update error:", err);
  }
  next();
};