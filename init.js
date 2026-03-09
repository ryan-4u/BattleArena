require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Tournament = require("./models/tournament");

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));

const seed = async () => {
  try {
    await User.deleteMany({});
    await Tournament.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // ═══════════════════════════════
    // ORGANISERS
    // ═══════════════════════════════
    const org1 = new User({
      username: "arena_admin",
      email: "admin@battlearena.com",
      role: "organiser",
      gameUsername: "ArenaAdmin",
      bio: "Official BattleArena head organiser. Running tournaments since 2022."
    });
    await User.register(org1, "admin123");

    const org2 = new User({
      username: "esports_hub",
      email: "hub@battlearena.com",
      role: "organiser",
      gameUsername: "EsportsHub",
      bio: "Community-driven esports organisation. We run weekly cups."
    });
    await User.register(org2, "admin123");

    console.log("✅ 2 Organisers created");

    // ═══════════════════════════════
    // PLAYERS
    // ═══════════════════════════════
    const players = [];

    const playerData = [
      { username: "pro_sniper",    email: "sniper@ba.com",   gameUsername: "ProSniper99",   bio: "Top ranked BGMI player. 3x champion. Squad captain." },
      { username: "shadow_ace",    email: "shadow@ba.com",   gameUsername: "Sh4dowAce",     bio: "Valorant main. Immortal rank. Entry fragger." },
      { username: "void_striker",  email: "void@ba.com",     gameUsername: "V01dStrik3r",   bio: "Free Fire squad captain. 2 years competitive." },
      { username: "neon_ghost",    email: "neon@ba.com",     gameUsername: "NeonGh0st",     bio: "BGMI solo specialist. Chicken dinner or nothing." },
      { username: "blaze_fury",    email: "blaze@ba.com",    gameUsername: "BlazeFury_X",   bio: "Aggressive rusher. BGMI and Free Fire both." },
      { username: "silent_scope",  email: "scope@ba.com",    gameUsername: "SilentSc0pe",   bio: "Sniper only. If I miss, you're lucky." },
      { username: "rapid_storm",   email: "rapid@ba.com",    gameUsername: "RapidSt0rm",    bio: "Valorant Radiant. Duelist main." },
      { username: "iron_veil",     email: "iron@ba.com",     gameUsername: "1r0nVeil",      bio: "Support player. Shot-caller for my squad." },
      { username: "apex_legend_x", email: "apex@ba.com",     gameUsername: "ApexLgndX",     bio: "Multi-game competitor. Top 100 in three titles." },
      { username: "dark_phantom",  email: "dark@ba.com",     gameUsername: "D4rkPhantom",   bio: "New to competitive but grinding hard." },
      { username: "turbo_rush",    email: "turbo@ba.com",    gameUsername: "TurboRush77",   bio: "BGMI duo main. Looking for consistent partners." },
      { username: "zero_recoil",   email: "zero@ba.com",     gameUsername: "Zer0Rec0il",    bio: "Spray control is my religion. Valorant top 500." },
    ];

    for (let p of playerData) {
      const user = new User({ ...p, role: "player" });
      const registered = await User.register(user, "player123");
      players.push(registered);
    }

    console.log("✅ 12 Players created — password: player123");

    // ═══════════════════════════════
    // TOURNAMENTS
    // ═══════════════════════════════

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const tournamentData = [
      // ── UPCOMING ──
      {
        title: "BGMI Season 4 Grand Finals",
        game: "BGMI",
        description: "The biggest BGMI tournament of the season. Top squads from across India battle for the S4 championship. Expect intense zone plays, fierce gunfights, and high-stakes moments every match.",
        mode: "Squad",
        prizePool: "₹15,000",
        entryFee: 150,
        maxPlayers: 64,
        startDate: new Date(now + 10 * day),
        registrationDeadline: new Date(now + 7 * day),
        rules: "1. No hacking or third-party tools\n2. Full squad of 4 required\n3. Be in lobby 15 mins before start\n4. Organisers decision is final\n5. Stream sniping leads to disqualification",
        status: "upcoming",
        organiser: org1._id,
        roomId: "BGMI_S4_GF",
        roomPassword: "season4@arena"
      },
      {
        title: "Valorant Ranked Invitational II",
        game: "Valorant",
        description: "Elite 5v5 Valorant tournament. Minimum Diamond rank required. Prove your tactical skill, team coordination, and clutch factor against the best players on the platform.",
        mode: "Squad",
        prizePool: "₹8,000",
        entryFee: 100,
        maxPlayers: 40,
        startDate: new Date(now + 5 * day),
        registrationDeadline: new Date(now + 3 * day),
        rules: "1. Minimum Diamond rank — ID verification required\n2. No smurfing\n3. Map pool: Haven, Bind, Ascent, Pearl\n4. Custom lobby hosted by organiser\n5. Coaching allowed between maps",
        status: "upcoming",
        organiser: org1._id,
        roomId: "VAL_INV_02",
        roomPassword: "valo_inv@2"
      },
      {
        title: "Free Fire Weekly Cup #12",
        game: "Free Fire",
        description: "Our weekly Free Fire squad cup. Open to all skill levels. Fast format — 3 matches, total points decide the winner. Great way to get into competitive gaming.",
        mode: "Squad",
        prizePool: "₹1,500",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(now + 2 * day),
        registrationDeadline: new Date(now + 1 * day),
        rules: "1. No emulators\n2. Squad of 4\n3. 3 matches played — points system\n4. Fair play enforced strictly",
        status: "upcoming",
        organiser: org2._id,
        roomId: "FF_WC_12",
        roomPassword: "weekly@12"
      },
      {
        title: "BGMI Solo Survival Cup III",
        game: "BGMI",
        description: "Solo mode only. No squads, no duos. Pure individual skill, positioning, and survival instinct. The last 3 standing split the prize pool.",
        mode: "Solo",
        prizePool: "₹5,000",
        entryFee: 50,
        maxPlayers: 100,
        startDate: new Date(now + 14 * day),
        registrationDeadline: new Date(now + 11 * day),
        rules: "1. Solo only — teaming results in permanent ban\n2. Report suspected teamers with clip\n3. Top 3 positions win: 50%, 30%, 20%\n4. Minimum 5 games played to qualify",
        status: "upcoming",
        organiser: org2._id,
        roomId: "SOLO_CUP_03",
        roomPassword: "solo3@arena"
      },
      {
        title: "Clash Royale 1v1 Open",
        game: "Clash Royale",
        description: "1v1 Clash Royale bracket tournament. Single elimination. Bring your best deck and outplay your opponent. Open to all trophy levels.",
        mode: "Solo",
        prizePool: "₹2,000",
        entryFee: 20,
        maxPlayers: 32,
        startDate: new Date(now + 8 * day),
        registrationDeadline: new Date(now + 6 * day),
        rules: "1. Single elimination bracket\n2. Best of 3 per round\n3. No deck restrictions\n4. Screenshots of results required",
        status: "upcoming",
        organiser: org1._id,
        roomId: "CR_OPEN_01",
        roomPassword: "clash@open1"
      },

      // ── ONGOING ──
      {
        title: "Free Fire Clash of Squads IV",
        game: "Free Fire",
        description: "Currently in progress. 16 squads entered, group stage complete. Quarter-finals begin tonight. High energy matches with live commentary.",
        mode: "Squad",
        prizePool: "₹3,000",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(now - 1 * day),
        registrationDeadline: new Date(now - 2 * day),
        rules: "1. No emulators\n2. Squad of 4\n3. Fair play enforced",
        status: "ongoing",
        organiser: org1._id,
        roomId: "FF_COS_04",
        roomPassword: "clash4@live"
      },
      {
        title: "BGMI Duo Cup — Season 2",
        game: "BGMI",
        description: "Duo format BGMI — currently in semifinals. 8 duos remain from original 32. Matches happening daily. Follow the bracket on our Discord.",
        mode: "Duo",
        prizePool: "₹4,000",
        entryFee: 60,
        maxPlayers: 32,
        startDate: new Date(now - 2 * day),
        registrationDeadline: new Date(now - 4 * day),
        rules: "1. Duo only — no fill\n2. Both players must register\n3. Reschedule allowed once per team\n4. Finals streamed live",
        status: "ongoing",
        organiser: org2._id,
        roomId: "DUO_S2_SF",
        roomPassword: "duo2@semi"
      },

      // ── COMPLETED ──
      {
        title: "BGMI Season 3 Grand Finals",
        game: "BGMI",
        description: "Season 3 concluded. Congratulations to team PHANTOM SQUAD for winning the championship. 64 squads competed across 3 weeks. Incredible performances from all participants.",
        mode: "Squad",
        prizePool: "₹10,000",
        entryFee: 100,
        maxPlayers: 64,
        startDate: new Date(now - 20 * day),
        registrationDeadline: new Date(now - 25 * day),
        rules: "Standard competitive rules applied.",
        status: "completed",
        organiser: org1._id,
        roomId: "BGMI_S3_GF",
        roomPassword: "s3finals"
      },
      {
        title: "Valorant Ranked Invitational I",
        game: "Valorant",
        description: "First edition concluded. Team ZERO RECOIL took the title in a 5-match thriller. 32 teams competed. Prize distributed to top 3 teams.",
        mode: "Squad",
        prizePool: "₹6,000",
        entryFee: 80,
        maxPlayers: 32,
        startDate: new Date(now - 15 * day),
        registrationDeadline: new Date(now - 18 * day),
        rules: "Standard Valorant competitive rules applied.",
        status: "completed",
        organiser: org1._id,
        roomId: "VAL_INV_01",
        roomPassword: "valo_inv_1"
      },
      {
        title: "Free Fire Weekly Cup #11",
        game: "Free Fire",
        description: "Week 11 completed. Squad BLAZE FURY dominated with 42 total points across 3 matches. Week 12 registrations now open.",
        mode: "Squad",
        prizePool: "₹1,500",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(now - 7 * day),
        registrationDeadline: new Date(now - 8 * day),
        rules: "Standard weekly cup rules applied.",
        status: "completed",
        organiser: org2._id,
        roomId: "FF_WC_11",
        roomPassword: "weekly11"
      },
      {
        title: "BGMI Solo Survival Cup II",
        game: "BGMI",
        description: "Cup II finished. SILENT SCOPE won with back-to-back chicken dinners in matches 4 and 5. 100 solo players competed. Next cup — Season III — now open.",
        mode: "Solo",
        prizePool: "₹4,000",
        entryFee: 40,
        maxPlayers: 100,
        startDate: new Date(now - 10 * day),
        registrationDeadline: new Date(now - 13 * day),
        rules: "Standard solo cup rules applied.",
        status: "completed",
        organiser: org2._id,
        roomId: "SOLO_CUP_02",
        roomPassword: "solo2done"
      },
      {
        title: "BGMI Duo Cup — Season 1",
        game: "BGMI",
        description: "Season 1 of the Duo Cup is complete. 16 duos competed. Winners — PRO_SNIPER & NEON_GHOST — took home the prize after a dominant finals performance.",
        mode: "Duo",
        prizePool: "₹3,000",
        entryFee: 50,
        maxPlayers: 32,
        startDate: new Date(now - 30 * day),
        registrationDeadline: new Date(now - 33 * day),
        rules: "Standard duo cup rules applied.",
        status: "completed",
        organiser: org2._id,
        roomId: "DUO_S1_FIN",
        roomPassword: "duo1done"
      }
    ];

    const tournaments = await Tournament.insertMany(tournamentData);

    // ═══════════════════════════════
    // LINK TOURNAMENTS TO ORGANISERS
    // ═══════════════════════════════
    const org1Tournaments = tournaments.filter(t => t.organiser.equals(org1._id)).map(t => t._id);
    const org2Tournaments = tournaments.filter(t => t.organiser.equals(org2._id)).map(t => t._id);
    org1.tournamentsOrganised = org1Tournaments;
    org2.tournamentsOrganised = org2Tournaments;
    await org1.save();
    await org2.save();

    // ═══════════════════════════════
    // APPLICATIONS — UPCOMING & ONGOING
    // ═══════════════════════════════

    // BGMI S4 Grand Finals — mix of pending/accepted/rejected
    const bgmiS4 = tournaments[0];
    bgmiS4.applicants = [
      { player: players[0]._id, status: "accepted" },  // pro_sniper
      { player: players[1]._id, status: "accepted" },  // shadow_ace
      { player: players[3]._id, status: "accepted" },  // neon_ghost
      { player: players[4]._id, status: "pending"  },  // blaze_fury
      { player: players[5]._id, status: "pending"  },  // silent_scope
      { player: players[6]._id, status: "rejected" },  // rapid_storm
      { player: players[9]._id, status: "pending"  },  // dark_phantom
    ];
    await bgmiS4.save();

    // Valorant Invitational II
    const valInv2 = tournaments[1];
    valInv2.applicants = [
      { player: players[1]._id, status: "accepted" },  // shadow_ace
      { player: players[6]._id, status: "accepted" },  // rapid_storm
      { player: players[11]._id, status: "accepted" }, // zero_recoil
      { player: players[7]._id, status: "pending"  },  // iron_veil
      { player: players[8]._id, status: "pending"  },  // apex_legend_x
    ];
    await valInv2.save();

    // Free Fire Weekly #12
    const ffWeekly12 = tournaments[2];
    ffWeekly12.applicants = [
      { player: players[2]._id, status: "accepted" },  // void_striker
      { player: players[4]._id, status: "accepted" },  // blaze_fury
      { player: players[9]._id, status: "pending"  },  // dark_phantom
    ];
    await ffWeekly12.save();

    // FF Clash of Squads IV (ongoing)
    const ffOngoing = tournaments[5];
    ffOngoing.applicants = [
      { player: players[2]._id, status: "accepted" },
      { player: players[4]._id, status: "accepted" },
      { player: players[0]._id, status: "accepted" },
      { player: players[9]._id, status: "accepted" },
    ];
    await ffOngoing.save();

    // BGMI Duo S2 (ongoing)
    const duoOngoing = tournaments[6];
    duoOngoing.applicants = [
      { player: players[0]._id, status: "accepted" },  // pro_sniper
      { player: players[3]._id, status: "accepted" },  // neon_ghost
      { player: players[10]._id, status: "accepted" }, // turbo_rush
      { player: players[5]._id, status: "accepted" },  // silent_scope
    ];
    await duoOngoing.save();

    // Completed tournaments — all accepted
    const bgmiS3 = tournaments[7];
    bgmiS3.applicants = [
      { player: players[0]._id, status: "accepted" },
      { player: players[3]._id, status: "accepted" },
      { player: players[4]._id, status: "accepted" },
      { player: players[5]._id, status: "accepted" },
      { player: players[8]._id, status: "accepted" },
    ];
    await bgmiS3.save();

    const valComp = tournaments[8];
    valComp.applicants = [
      { player: players[1]._id, status: "accepted" },
      { player: players[6]._id, status: "accepted" },
      { player: players[11]._id, status: "accepted" },
      { player: players[7]._id, status: "accepted" },
    ];
    await valComp.save();

    const ffComp = tournaments[9];
    ffComp.applicants = [
      { player: players[2]._id, status: "accepted" },
      { player: players[4]._id, status: "accepted" },
    ];
    await ffComp.save();

    const soloComp = tournaments[10];
    soloComp.applicants = [
      { player: players[5]._id, status: "accepted" }, // silent_scope won
      { player: players[0]._id, status: "accepted" },
      { player: players[3]._id, status: "accepted" },
      { player: players[8]._id, status: "accepted" },
    ];
    await soloComp.save();

    const duoComp = tournaments[11];
    duoComp.applicants = [
      { player: players[0]._id, status: "accepted" }, // pro_sniper won
      { player: players[3]._id, status: "accepted" }, // neon_ghost won
      { player: players[10]._id, status: "accepted" },
      { player: players[5]._id, status: "accepted" },
    ];
    await duoComp.save();

    // ═══════════════════════════════
    // UPDATE PLAYER HISTORIES
    // ═══════════════════════════════
    // pro_sniper — accepted in 5 tournaments
    players[0].tournamentsJoined = [bgmiS4._id, ffOngoing._id, duoOngoing._id, bgmiS3._id, duoComp._id];
    await players[0].save();

    // shadow_ace — accepted in 3
    players[1].tournamentsJoined = [bgmiS4._id, valInv2._id, valComp._id];
    await players[1].save();

    // void_striker — accepted in 2
    players[2].tournamentsJoined = [ffWeekly12._id, ffOngoing._id, ffComp._id];
    await players[2].save();

    // neon_ghost — accepted in 4
    players[3].tournamentsJoined = [bgmiS4._id, duoOngoing._id, bgmiS3._id, duoComp._id, soloComp._id];
    await players[3].save();

    // blaze_fury
    players[4].tournamentsJoined = [ffWeekly12._id, ffOngoing._id, bgmiS3._id, ffComp._id];
    await players[4].save();

    // silent_scope — won solo cup
    players[5].tournamentsJoined = [duoOngoing._id, bgmiS3._id, soloComp._id, duoComp._id];
    await players[5].save();

    // rapid_storm
    players[6].tournamentsJoined = [valInv2._id, valComp._id];
    await players[6].save();

    // iron_veil
    players[7].tournamentsJoined = [valComp._id];
    await players[7].save();

    // apex_legend_x
    players[8].tournamentsJoined = [bgmiS3._id, soloComp._id];
    await players[8].save();

    // zero_recoil
    players[11].tournamentsJoined = [valInv2._id, valComp._id];
    await players[11].save();

    // turbo_rush
    players[10].tournamentsJoined = [duoOngoing._id, duoComp._id];
    await players[10].save();

    console.log("✅ All applications and player histories linked");
    console.log("\n══════════════════════════════════════════════");
    console.log("  SEED COMPLETE");
    console.log("══════════════════════════════════════════════");
    console.log("  ORGANISERS");
    console.log("  arena_admin   / admin123");
    console.log("  esports_hub   / admin123");
    console.log("──────────────────────────────────────────────");
    console.log("  PLAYERS (all password: player123)");
    console.log("  pro_sniper    — 5 tournaments, duo cup winner");
    console.log("  shadow_ace    — Valorant specialist");
    console.log("  void_striker  — Free Fire main");
    console.log("  neon_ghost    — BGMI solo/duo");
    console.log("  blaze_fury    — Multi-game");
    console.log("  silent_scope  — Solo cup winner");
    console.log("  rapid_storm   — Valorant Radiant");
    console.log("  iron_veil     — Support player");
    console.log("  apex_legend_x — Multi-game");
    console.log("  dark_phantom  — New player");
    console.log("  turbo_rush    — Duo specialist");
    console.log("  zero_recoil   — Valorant top 500");
    console.log("──────────────────────────────────────────────");
    console.log("  TOURNAMENTS");
    console.log("  Upcoming  — 5");
    console.log("  Ongoing   — 2");
    console.log("  Completed — 5");
    console.log("══════════════════════════════════════════════\n");

    mongoose.connection.close();
  } catch (e) {
    console.error("❌ Seed error:", e.message);
    console.error(e);
    mongoose.connection.close();
  }
};

seed();