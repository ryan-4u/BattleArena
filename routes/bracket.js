const express = require("express");
const router = express.Router();
const Tournament = require("../models/tournament");
const Match = require("../models/match");
const { isLoggedIn, isOrganiser, isTournamentOwner, isAdmin } = require("../middleware");

// ─── Helpers ────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRoundName(roundNumber, totalMainRounds) {
  if (roundNumber === 0) return "Prelim";
  const remaining = totalMainRounds - roundNumber + 1;
  if (remaining === 1) return "Final";
  if (remaining === 2) return "SF";
  if (remaining === 3) return "QF";
  if (remaining === 4) return "R16";
  if (remaining === 5) return "R32";
  if (remaining === 6) return "R64";
  return `Round ${roundNumber}`;
}

// ─── Generate Bracket ────────────────────────────────────────────────────────

router.post("/:id/bracket/generate", isLoggedIn, isOrganiser, isTournamentOwner, async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);

  if (!tournament) {
    req.flash("error", "Tournament not found.");
    return res.redirect("/tournaments");
  }

  if (tournament.bracketGenerated) {
    req.flash("error", "Bracket has already been generated.");
    return res.redirect(`/tournaments/${req.params.id}/bracket`);
  }

  if (tournament.status !== "ongoing") {
    req.flash("error", "Bracket can only be generated for ongoing tournaments.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  const acceptedApplicants = tournament.applicants
    .filter(a => a.status === "accepted")
    .sort((a, b) => new Date(a.appliedAt) - new Date(b.appliedAt)); // earliest first

  if (acceptedApplicants.length < 2) {
    req.flash("error", "Need at least 2 accepted players to generate a bracket.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  const n = acceptedApplicants.length;

  // Largest power of 2 <= n
  const mainSize = Math.pow(2, Math.floor(Math.log2(n)));
  const prelimCount = n - mainSize; // number of prelim matches needed
  const prelimPlayerCount = prelimCount * 2;

  // Last to apply → prelims. First to apply → byes into R1
  const byePlayers = acceptedApplicants.slice(0, mainSize - prelimCount).map(a => a.player);
  const prelimPlayers = acceptedApplicants.slice(mainSize - prelimCount).map(a => a.player);

  // Shuffle within each group
  const shuffledBye = shuffle(byePlayers);
  const shuffledPrelim = shuffle(prelimPlayers);

  // Total main rounds: log2(mainSize)
  const totalMainRounds = Math.log2(mainSize);
  const hasPrelim = prelimCount > 0;

  // Store all created matches keyed by [round][matchIndex]
  // We'll build from Final backwards to link nextMatchId

  // ── Step 1: Create all match shells from R1 to Final ──
  // Round 1 has mainSize/2 matches, each subsequent round halves
  const roundMatches = []; // roundMatches[i] = array of match docs for round i (1-indexed)

  for (let r = 1; r <= totalMainRounds; r++) {
    const matchCount = mainSize / Math.pow(2, r);
    const roundName = getRoundName(r, totalMainRounds);
    const matches = [];
    for (let m = 0; m < matchCount; m++) {
      const match = new Match({
        tournament: tournament._id,
        round: roundName,
        roundNumber: r,
        matchNumber: m,
        status: "awaiting"
      });
      matches.push(match);
    }
    roundMatches.push(matches);
  }

  // Final is roundMatches[totalMainRounds - 1][0]
  // Link nextMatchId from R1 up to Final
  for (let r = 0; r < totalMainRounds - 1; r++) {
    const currentRound = roundMatches[r];
    const nextRound = roundMatches[r + 1];
    for (let m = 0; m < currentRound.length; m++) {
      const nextMatchIndex = Math.floor(m / 2);
      const slot = (m % 2) + 1; // 1 or 2
      currentRound[m].nextMatchId = nextRound[nextMatchIndex]._id;
      currentRound[m].nextMatchSlot = slot;
    }
  }

  // ── Step 2: Fill R1 slots with bye players ──
  // R1 = roundMatches[0], has mainSize/2 matches
  const r1Matches = roundMatches[0];
  // First (mainSize/2 - prelimCount) matches get bye players directly
  const directR1Count = mainSize / 2 - prelimCount;

  for (let m = 0; m < directR1Count; m++) {
    r1Matches[m].player1 = shuffledBye[m * 2];
    r1Matches[m].player2 = shuffledBye[m * 2 + 1];
    r1Matches[m].status = "pending";
  }
  // Remaining R1 slots (directR1Count to mainSize/2 - 1) await prelim winners
  // status stays "awaiting"

  // ── Step 3: Create prelim matches ──
  const prelimMatchDocs = [];
  if (hasPrelim) {
    for (let m = 0; m < prelimCount; m++) {
      const targetR1Match = r1Matches[directR1Count + Math.floor(m / 2)];
      const slot = (m % 2) + 1;

      const prelim = new Match({
        tournament: tournament._id,
        round: "Prelim",
        roundNumber: 0,
        matchNumber: m,
        player1: shuffledPrelim[m * 2],
        player2: shuffledPrelim[m * 2 + 1],
        status: "pending",
        nextMatchId: targetR1Match._id,
        nextMatchSlot: slot
      });
      prelimMatchDocs.push(prelim);
    }
  }

  // ── Step 4: Handle Final match specially ──
  const finalMatch = roundMatches[totalMainRounds - 1][0];
  // Final has no nextMatch

  // ── Step 5: Save everything ──
  const allMainMatches = roundMatches.flat();
  await Match.insertMany([...prelimMatchDocs, ...allMainMatches]);

  // Update tournament
  tournament.bracketGenerated = true;
  tournament.totalRounds = totalMainRounds;
  await tournament.save();

  req.flash("success", "Bracket generated successfully!");
  res.redirect(`/tournaments/${req.params.id}/bracket`);
});

// ─── View Bracket ────────────────────────────────────────────────────────────

router.get("/:id/bracket", async (req, res) => {
  const tournament = await Tournament.findById(req.params.id)
    .populate("organiser");

  if (!tournament) {
    req.flash("error", "Tournament not found.");
    return res.redirect("/tournaments");
  }

  if (!tournament.bracketGenerated) {
    req.flash("error", "Bracket has not been generated yet.");
    return res.redirect(`/tournaments/${req.params.id}`);
  }

  const matches = await Match.find({ tournament: req.params.id })
    .populate("player1", "username")
    .populate("player2", "username")
    .populate("winner", "username")
    .sort({ roundNumber: 1, matchNumber: 1 });

  // Group by round
  const rounds = {};
  for (const match of matches) {
    if (!rounds[match.round]) rounds[match.round] = [];
    rounds[match.round].push(match);
  }

  // Ordered round keys: Prelim first, then R64/R32/.../Final
  const roundOrder = ["Prelim", "R64", "R32", "R16", "QF", "SF", "Final"];
  const orderedRounds = roundOrder
    .filter(r => rounds[r])
    .map(r => ({ name: r, matches: rounds[r] }));

  res.render("tournaments/bracket", {
    tournament,
    orderedRounds,
    matches
  });
});

// ─── Report Result ───────────────────────────────────────────────────────────

router.post("/:id/bracket/matches/:matchId/result", isLoggedIn, async (req, res) => {
  const { result } = req.body; // "win" or "loss"

  if (!["win", "loss"].includes(result)) {
    req.flash("error", "Invalid result.");
    return res.redirect(`/tournaments/${req.params.id}/bracket`);
  }

  const match = await Match.findById(req.params.matchId);

  if (!match || match.tournament.toString() !== req.params.id) {
    req.flash("error", "Match not found.");
    return res.redirect(`/tournaments/${req.params.id}/bracket`);
  }

  if (match.status === "confirmed" || match.status === "bye") {
    req.flash("error", "This match is already resolved.");
    return res.redirect(`/tournaments/${req.params.id}/bracket`);
  }

  const isPlayer1 = match.player1 && match.player1.equals(req.user._id);
  const isPlayer2 = match.player2 && match.player2.equals(req.user._id);

  if (!isPlayer1 && !isPlayer2) {
    req.flash("error", "You are not a participant in this match.");
    return res.redirect(`/tournaments/${req.params.id}/bracket`);
  }

  // Set result
  if (isPlayer1) match.player1Result = result;
  if (isPlayer2) match.player2Result = result;

  // Check if both reported
  if (match.player1Result && match.player2Result) {
    const p1Win = match.player1Result === "win";
    const p2Win = match.player2Result === "win";

    if (p1Win && !p2Win) {
      // Agreement: player1 wins
      match.status = "confirmed";
      match.winner = match.player1;
      await match.save();
      await advanceWinner(match);
    } else if (!p1Win && p2Win) {
      // Agreement: player2 wins
      match.status = "confirmed";
      match.winner = match.player2;
      await match.save();
      await advanceWinner(match);
    } else {
      // Conflict: both claim win or both claim loss
      match.status = "conflict";
      await match.save();
    }
  } else {
    await match.save();
  }

  req.flash("success", "Result reported. Waiting for opponent.");
  res.redirect(`/tournaments/${req.params.id}/bracket`);
});

// ─── Organiser Resolve Conflict ──────────────────────────────────────────────

router.patch("/:id/bracket/matches/:matchId/resolve", isLoggedIn, isOrganiser, isTournamentOwner, async (req, res) => {
  const { winnerId } = req.body;
  const match = await Match.findById(req.params.matchId);

  if (!match || match.tournament.toString() !== req.params.id) {
    req.flash("error", "Match not found.");
    return res.redirect(`/tournaments/${req.params.id}/bracket`);
  }

  if (match.status !== "conflict") {
    req.flash("error", "This match is not in conflict.");
    return res.redirect(`/tournaments/${req.params.id}/bracket`);
  }

  const validWinner =
    (match.player1 && match.player1.equals(winnerId)) ||
    (match.player2 && match.player2.equals(winnerId));

  if (!validWinner) {
    req.flash("error", "Invalid winner selection.");
    return res.redirect(`/tournaments/${req.params.id}/bracket`);
  }

  match.status = "confirmed";
  match.winner = winnerId;
  await match.save();
  await advanceWinner(match);

  req.flash("success", "Conflict resolved. Winner advanced.");
  res.redirect(`/tournaments/${req.params.id}/bracket`);
});

// ─── Advance Winner Helper ───────────────────────────────────────────────────

async function advanceWinner(match) {
  if (!match.nextMatchId) {
    // This is the Final — update tournament winner
    const Tournament = require("../models/tournament");
    await Tournament.findByIdAndUpdate(match.tournament, {
      winner: match.winner,
      winnerDeclaredAt: new Date(),
      status: "completed"
    });
    const User = require("../models/user");
    await User.findByIdAndUpdate(match.winner, {
      $addToSet: { tournamentsWon: match.tournament }
    });
    return;
  }

  // Find next match and fill the correct slot
  const nextMatch = await Match.findById(match.nextMatchId);
  if (!nextMatch) return;

  if (match.nextMatchSlot === 1) {
    nextMatch.player1 = match.winner;
  } else {
    nextMatch.player2 = match.winner;
  }

  // If both players now assigned, set to pending
  if (nextMatch.player1 && nextMatch.player2) {
    nextMatch.status = "pending";
  }

  await nextMatch.save();
}

module.exports = router;