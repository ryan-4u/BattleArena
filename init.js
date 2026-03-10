if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const User = require("./models/user");
const Tournament = require("./models/tournament");

const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/battlearena";

mongoose.connect(dbUrl)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));

const seed = async () => {
  try {
    await User.deleteMany({});
    await Tournament.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // ═══════════════════════════════
    // ADMIN
    // ═══════════════════════════════
    const admin = new User({
      username: "arena_admin",
      email: "admin@battlearena.com",
      role: "admin",
      gameUsername: "ArenaAdmin",
      bio: "Official BattleArena platform administrator."
    });
    await User.register(admin, "admin123");
    console.log("✅ Admin created — arena_admin / admin123");

    // ═══════════════════════════════
    // ORGANISERS
    // ═══════════════════════════════
    const org1 = new User({
      username: "esports_hub",
      email: "hub@battlearena.com",
      role: "organiser",
      gameUsername: "EsportsHub",
      bio: "Community-driven esports organisation. Running weekly cups since 2021."
    });
    await User.register(org1, "org123");

    const org2 = new User({
      username: "pro_league",
      email: "proleague@battlearena.com",
      role: "organiser",
      gameUsername: "ProLeagueGG",
      bio: "Professional tournament organiser. We run ranked invitationals and open cups."
    });
    await User.register(org2, "org123");

    const org3 = new User({
      username: "clutch_events",
      email: "clutch@battlearena.com",
      role: "organiser",
      gameUsername: "ClutchEventsGG",
      bio: "Specialising in high-stakes tournaments with big prize pools."
    });
    await User.register(org3, "org123");

    console.log("✅ 3 Organisers created — password: org123");

    // ═══════════════════════════════
    // PLAYERS
    // ═══════════════════════════════
    const players = [];

    const playerData = [
      // BGMI specialists
      { username: "pro_sniper",     email: "sniper@ba.com",    gameUsername: "ProSniper99",    bio: "Top ranked BGMI player. 3x champion. Squad captain." },
      { username: "neon_ghost",     email: "neon@ba.com",      gameUsername: "NeonGh0st",      bio: "BGMI solo specialist. Chicken dinner or nothing." },
      { username: "blaze_fury",     email: "blaze@ba.com",     gameUsername: "BlazeFury_X",    bio: "Aggressive rusher. BGMI and Free Fire both." },
      { username: "silent_scope",   email: "scope@ba.com",     gameUsername: "SilentSc0pe",    bio: "Sniper only. If I miss, you're lucky." },
      { username: "turbo_rush",     email: "turbo@ba.com",     gameUsername: "TurboRush77",    bio: "BGMI duo main. Looking for consistent partners." },
      { username: "iron_veil",      email: "iron@ba.com",      gameUsername: "1r0nVeil",       bio: "Support player. Shot-caller for my squad." },
      // Valorant specialists
      { username: "shadow_ace",     email: "shadow@ba.com",    gameUsername: "Sh4dowAce",      bio: "Valorant main. Immortal rank. Entry fragger." },
      { username: "rapid_storm",    email: "rapid@ba.com",     gameUsername: "RapidSt0rm",     bio: "Valorant Radiant. Duelist main." },
      { username: "zero_recoil",    email: "zero@ba.com",      gameUsername: "Zer0Rec0il",     bio: "Spray control is my religion. Valorant top 500." },
      { username: "phantom_six",    email: "phantom@ba.com",   gameUsername: "Ph4ntom6",       bio: "Valorant IGL. Diamond 3 and climbing." },
      // Free Fire specialists
      { username: "void_striker",   email: "void@ba.com",      gameUsername: "V01dStrik3r",    bio: "Free Fire squad captain. 2 years competitive." },
      { username: "flame_king",     email: "flame@ba.com",     gameUsername: "Fl4meKing",      bio: "Free Fire aggressor. Rush every fight." },
      // Multi-game
      { username: "apex_legend_x",  email: "apex@ba.com",      gameUsername: "ApexLgndX",      bio: "Multi-game competitor. Top 100 in three titles." },
      { username: "dark_phantom",   email: "dark@ba.com",      gameUsername: "D4rkPhantom",    bio: "New to competitive but grinding hard." },
      { username: "hex_blade",      email: "hex@ba.com",       gameUsername: "H3xBlade",       bio: "CS2 and Valorant. Entry fragger with 60% headshot rate." },
      { username: "nova_strike",    email: "nova@ba.com",      gameUsername: "N0vaStrike",     bio: "Rocket League Diamond. BGMI weekend warrior." },
      { username: "cyber_wolf",     email: "cyber@ba.com",     gameUsername: "CyberW0lf",      bio: "COD Mobile top 500. Aggressive playstyle." },
      { username: "glitch_mode",    email: "glitch@ba.com",    gameUsername: "GlitchM0de",     bio: "CS2 Global Elite. Lurker playstyle." },
      { username: "reaper_x",       email: "reaper@ba.com",    gameUsername: "Re4perX",        bio: "Multi-title grinder. Won 4 online cups this year." },
      { username: "storm_breaker",  email: "storm@ba.com",     gameUsername: "St0rmBreaker",   bio: "Rocket League Champion rank. BGMI casually." },
      { username: "pixel_hawk",     email: "pixel@ba.com",     gameUsername: "P1xelHawk",      bio: "COD Mobile and Free Fire. Sniper main." },
      { username: "lunar_edge",     email: "lunar@ba.com",     gameUsername: "LunarEdge99",    bio: "Valorant Ascendant. Looking for serious team." },
      { username: "binary_ghost",   email: "binary@ba.com",    gameUsername: "B1naryGh0st",    bio: "CS2 main. 2000+ hours. IGL in ranked matches." },
      { username: "volt_charge",    email: "volt@ba.com",      gameUsername: "V0ltCharge",     bio: "New player, fast learner. BGMI and Free Fire." },
    ];

    for (let p of playerData) {
      const user = new User({ ...p, role: "player" });
      const registered = await User.register(user, "player123");
      players.push(registered);
    }

    console.log("✅ 24 Players created — password: player123");

    // ═══════════════════════════════
    // TOURNAMENTS
    // ═══════════════════════════════
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const tournamentData = [

      // ══════════════════════════════
      // UPCOMING (10)
      // ══════════════════════════════
      {
        title: "BGMI Season 5 Grand Finals",
        game: "BGMI",
        description: "The biggest BGMI tournament of the season. Top squads from across India battle for the S5 championship. Expect intense zone plays, fierce gunfights, and high-stakes moments every match. All skill levels welcome — only the best survive.",
        mode: "Squad",
        prizePool: "₹20,000",
        entryFee: 200,
        maxPlayers: 64,
        startDate: new Date(now + 12 * day),
        registrationDeadline: new Date(now + 9 * day),
        rules: "1. No hacking or third-party tools\n2. Full squad of 4 required\n3. Be in lobby 15 mins before start\n4. Organiser's decision is final\n5. Stream sniping leads to disqualification",
        status: "upcoming",
        organiser: org1._id,
        roomId: "BGMI_S5_GF",
        roomPassword: "season5@arena",
        blocked: false
      },
      {
        title: "Valorant Ranked Invitational III",
        game: "Valorant",
        description: "Elite 5v5 Valorant tournament. Minimum Diamond rank required. Prove your tactical skill, team coordination, and clutch factor against the best players on the platform. Map pool confirmed by organisers 48 hours before.",
        mode: "Squad",
        prizePool: "₹10,000",
        entryFee: 150,
        maxPlayers: 40,
        startDate: new Date(now + 7 * day),
        registrationDeadline: new Date(now + 5 * day),
        rules: "1. Minimum Diamond rank — ID verification required\n2. No smurfing\n3. Map pool: Haven, Bind, Ascent, Pearl\n4. Custom lobby hosted by organiser\n5. Coaching allowed between maps",
        status: "upcoming",
        organiser: org2._id,
        roomId: "VAL_INV_03",
        roomPassword: "valo_inv@3",
        blocked: false
      },
      {
        title: "Free Fire Weekly Cup #14",
        game: "Free Fire",
        description: "Our weekly Free Fire squad cup. Open to all skill levels. Fast format — 3 matches, total points decide the winner. Great entry point into competitive gaming. No entry fee.",
        mode: "Squad",
        prizePool: "₹1,500",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(now + 3 * day),
        registrationDeadline: new Date(now + 2 * day),
        rules: "1. No emulators\n2. Squad of 4\n3. 3 matches played — points system\n4. Fair play enforced strictly",
        status: "upcoming",
        organiser: org1._id,
        roomId: "FF_WC_14",
        roomPassword: "weekly@14",
        blocked: false
      },
      {
        title: "CS2 Open Cup — Season 1",
        game: "CS2",
        description: "First ever CS2 tournament on BattleArena. 5v5 competitive format on official Valve servers. Bring your best strats and teamwork. Open to all ranks. Single elimination bracket.",
        mode: "Squad",
        prizePool: "₹8,000",
        entryFee: 100,
        maxPlayers: 32,
        startDate: new Date(now + 10 * day),
        registrationDeadline: new Date(now + 8 * day),
        rules: "1. Official Valve servers only\n2. No cheats or exploits\n3. Map pool: Mirage, Inferno, Dust2, Nuke\n4. Best of 1 until finals — Best of 3\n5. Screenshot results after each map",
        status: "upcoming",
        organiser: org3._id,
        roomId: "CS2_OC_01",
        roomPassword: "cs2open@1",
        blocked: false
      },
      {
        title: "COD Mobile Blitz Tournament",
        game: "COD Mobile",
        description: "High intensity COD Mobile 5v5 multiplayer tournament. Hardpoint and Search & Destroy modes. Fast paced, aggressive format. Prizes for top 3 teams. Squads of 5.",
        mode: "Squad",
        prizePool: "₹5,000",
        entryFee: 75,
        maxPlayers: 32,
        startDate: new Date(now + 6 * day),
        registrationDeadline: new Date(now + 4 * day),
        rules: "1. No hacking or modded accounts\n2. 5v5 multiplayer mode\n3. Hardpoint and S&D alternated\n4. Lag issues — rematch policy applied\n5. Organiser's decision is final",
        status: "upcoming",
        organiser: org2._id,
        roomId: "CODM_BLZ_01",
        roomPassword: "codblitz@1",
        blocked: false
      },
      {
        title: "Rocket League 1v1 Showdown",
        game: "Rocket League",
        description: "Solo Rocket League 1v1 tournament. Prove you don't need a team to be great. Diamond and above only. Best of 5 in all rounds. High mechanical skill expected.",
        mode: "Solo",
        prizePool: "₹3,000",
        entryFee: 50,
        maxPlayers: 32,
        startDate: new Date(now + 9 * day),
        registrationDeadline: new Date(now + 7 * day),
        rules: "1. Diamond rank or above\n2. Best of 5 per round\n3. No lag-outs — if disconnected match may be replayed\n4. Custom training packs allowed\n5. Finals streamed live",
        status: "upcoming",
        organiser: org3._id,
        roomId: "RL_1V1_01",
        roomPassword: "rocket@1v1",
        blocked: false
      },
      {
        title: "BGMI Solo Survival Cup IV",
        game: "BGMI",
        description: "Solo only. No squads, no duos. Pure individual skill, positioning, and survival instinct. The last 3 standing split the prize pool. This is the hardest format in BGMI esports.",
        mode: "Solo",
        prizePool: "₹6,000",
        entryFee: 60,
        maxPlayers: 100,
        startDate: new Date(now + 15 * day),
        registrationDeadline: new Date(now + 12 * day),
        rules: "1. Solo only — teaming results in permanent ban\n2. Report suspected teamers with clip\n3. Top 3 positions win: 50%, 30%, 20%\n4. Minimum 5 games played to qualify",
        status: "upcoming",
        organiser: org1._id,
        roomId: "SOLO_CUP_04",
        roomPassword: "solo4@arena",
        blocked: false
      },
      {
        title: "Valorant Duos Showdown",
        game: "Valorant",
        description: "2v2 Valorant — pure mechanical skill, no team hiding. Minimum Platinum rank. 16 duos max. First to 13 rounds wins. Overtime goes until a 2-round lead.",
        mode: "Duo",
        prizePool: "₹4,000",
        entryFee: 80,
        maxPlayers: 32,
        startDate: new Date(now + 11 * day),
        registrationDeadline: new Date(now + 9 * day),
        rules: "1. Duo registration only\n2. Minimum Platinum rank\n3. First to 13 rounds\n4. Overtime: MR3 format\n5. Agent restrictions may apply",
        status: "upcoming",
        organiser: org2._id,
        roomId: "VAL_DUO_01",
        roomPassword: "valo_duo@1",
        blocked: false
      },
      {
        title: "Free Fire Solo Ranked Cup",
        game: "Free Fire",
        description: "Solo Free Fire ranked cup. 5 matches, highest aggregate points wins. Open to all players. No entry fee — purely for glory and prize money.",
        mode: "Solo",
        prizePool: "₹2,000",
        entryFee: 0,
        maxPlayers: 50,
        startDate: new Date(now + 4 * day),
        registrationDeadline: new Date(now + 2 * day),
        rules: "1. Solo mode only\n2. 5 matches — aggregate points\n3. No emulators\n4. Kill points + placement points\n5. Disputes resolved by organiser",
        status: "upcoming",
        organiser: org3._id,
        roomId: "FF_SOLO_01",
        roomPassword: "ffsolo@1",
        blocked: false
      },
      {
        title: "CS2 AWP Only Challenge",
        game: "CS2",
        description: "Special format — AWP and pistol only. No rifles. Tests pure aim, positioning, and economy management. 5v5 on Dust2. Chaos guaranteed.",
        mode: "Squad",
        prizePool: "₹3,500",
        entryFee: 50,
        maxPlayers: 20,
        startDate: new Date(now + 8 * day),
        registrationDeadline: new Date(now + 6 * day),
        rules: "1. AWP and pistols only — rifles banned\n2. Violation = round forfeit\n3. Dust2 only\n4. Best of 3\n5. Economy rules apply normally",
        status: "upcoming",
        organiser: org3._id,
        roomId: "CS2_AWP_01",
        roomPassword: "awponly@1",
        blocked: false
      },

      // ══════════════════════════════
      // ONGOING (10)
      // ══════════════════════════════
      {
        title: "BGMI Season 4 Grand Finals",
        game: "BGMI",
        description: "Currently in progress. 64 squads entered, group stage complete. Quarter-finals begin tonight. High energy matches with live commentary on Discord.",
        mode: "Squad",
        prizePool: "₹15,000",
        entryFee: 150,
        maxPlayers: 64,
        startDate: new Date(now - 2 * day),
        registrationDeadline: new Date(now - 4 * day),
        rules: "1. No hacking or third-party tools\n2. Full squad of 4 required\n3. Organiser's decision is final",
        status: "ongoing",
        organiser: org1._id,
        roomId: "BGMI_S4_GF",
        roomPassword: "season4@live",
        blocked: false
      },
      {
        title: "Valorant Ranked Invitational II",
        game: "Valorant",
        description: "In progress — semifinals underway. 4 teams remain from original 32. Matches happening daily at 8PM IST. Follow the bracket on our Discord.",
        mode: "Squad",
        prizePool: "₹8,000",
        entryFee: 100,
        maxPlayers: 40,
        startDate: new Date(now - 1 * day),
        registrationDeadline: new Date(now - 3 * day),
        rules: "1. Minimum Diamond rank\n2. No smurfing\n3. Organiser's decision is final",
        status: "ongoing",
        organiser: org2._id,
        roomId: "VAL_INV_02_LIVE",
        roomPassword: "valo2@live",
        blocked: false
      },
      {
        title: "Free Fire Clash of Squads V",
        game: "Free Fire",
        description: "Currently ongoing. Group stage complete, knockout rounds in progress. 8 squads remain. Action packed matches every evening. Join Discord for live updates.",
        mode: "Squad",
        prizePool: "₹3,000",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(now - 1 * day),
        registrationDeadline: new Date(now - 2 * day),
        rules: "1. No emulators\n2. Squad of 4\n3. Fair play enforced",
        status: "ongoing",
        organiser: org1._id,
        roomId: "FF_COS_05_LIVE",
        roomPassword: "clash5@live",
        blocked: false
      },
      {
        title: "COD Mobile Squad War",
        game: "COD Mobile",
        description: "COD Mobile 5v5 squad war currently in progress. 16 teams entered, round robin group stage done. Knockout phase begins today. High energy fights every match.",
        mode: "Squad",
        prizePool: "₹4,000",
        entryFee: 60,
        maxPlayers: 20,
        startDate: new Date(now - 3 * day),
        registrationDeadline: new Date(now - 5 * day),
        rules: "1. No hacked accounts\n2. 5v5 multiplayer\n3. Fair play enforced",
        status: "ongoing",
        organiser: org3._id,
        roomId: "CODM_WAR_01",
        roomPassword: "codwar@live",
        blocked: false
      },
      {
        title: "CS2 Pro League Season 1",
        game: "CS2",
        description: "CS2 Pro League is live. 8 teams in a round robin format. Top 4 advance to playoffs. This is the most competitive CS2 event on BattleArena so far.",
        mode: "Squad",
        prizePool: "₹12,000",
        entryFee: 200,
        maxPlayers: 40,
        startDate: new Date(now - 4 * day),
        registrationDeadline: new Date(now - 6 * day),
        rules: "1. Official Valve servers\n2. No cheats\n3. Map pool: Mirage, Inferno, Nuke\n4. Round robin then playoffs",
        status: "ongoing",
        organiser: org2._id,
        roomId: "CS2_PL_01",
        roomPassword: "cs2pro@live",
        blocked: false
      },
      {
        title: "BGMI Duo Cup — Season 3",
        game: "BGMI",
        description: "Duo format BGMI — currently in semifinals. 8 duos remain from original 32. Matches happening daily. Follow the bracket on Discord.",
        mode: "Duo",
        prizePool: "₹5,000",
        entryFee: 80,
        maxPlayers: 32,
        startDate: new Date(now - 2 * day),
        registrationDeadline: new Date(now - 4 * day),
        rules: "1. Duo only — no fill\n2. Both players must register\n3. Reschedule allowed once per team",
        status: "ongoing",
        organiser: org2._id,
        roomId: "DUO_S3_LIVE",
        roomPassword: "duo3@live",
        blocked: false
      },
      {
        title: "Rocket League 3v3 Open",
        game: "Rocket League",
        description: "Standard 3v3 Rocket League tournament currently in progress. All ranks welcome. Round robin group stage complete. Knockout stage live now.",
        mode: "Squad",
        prizePool: "₹4,500",
        entryFee: 70,
        maxPlayers: 24,
        startDate: new Date(now - 1 * day),
        registrationDeadline: new Date(now - 3 * day),
        rules: "1. Standard 3v3 format\n2. All ranks welcome\n3. No intentional bumping to forfeit\n4. Overtime: sudden death golden goal",
        status: "ongoing",
        organiser: org3._id,
        roomId: "RL_3V3_LIVE",
        roomPassword: "rocket3v3@live",
        blocked: false
      },
      {
        title: "Free Fire Weekly Cup #13",
        game: "Free Fire",
        description: "Week 13 cup is live. 3 matches scheduled tonight. Points are close — any squad can still win. Watch live on Discord.",
        mode: "Squad",
        prizePool: "₹1,500",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(now - 1 * day),
        registrationDeadline: new Date(now - 2 * day),
        rules: "1. No emulators\n2. Squad of 4\n3. Points system — 3 matches",
        status: "ongoing",
        organiser: org1._id,
        roomId: "FF_WC_13_LIVE",
        roomPassword: "weekly13@live",
        blocked: false
      },
      {
        title: "Valorant 1v1 Aim Duel",
        game: "Valorant",
        description: "Pure aim — 1v1 pistol duels in Valorant. Range map format. No abilities, just raw mechanics. Currently in quarterfinals. Surprising upsets already.",
        mode: "Solo",
        prizePool: "₹2,500",
        entryFee: 40,
        maxPlayers: 32,
        startDate: new Date(now - 2 * day),
        registrationDeadline: new Date(now - 3 * day),
        rules: "1. Pistol only — no abilities\n2. Range map\n3. First to 10 kills wins\n4. Single elimination\n5. No smurfing",
        status: "ongoing",
        organiser: org3._id,
        roomId: "VAL_1V1_LIVE",
        roomPassword: "valo1v1@live",
        blocked: false
      },
      {
        title: "BGMI Season 4 Solo Survival",
        game: "BGMI",
        description: "Solo Survival Cup Season 4 is live. 100 players registered. Matches 1-3 complete. Top 20 survival points leaders advancing to final 2 matches.",
        mode: "Solo",
        prizePool: "₹5,000",
        entryFee: 50,
        maxPlayers: 100,
        startDate: new Date(now - 3 * day),
        registrationDeadline: new Date(now - 5 * day),
        rules: "1. Solo only\n2. 5 matches total\n3. Aggregate placement + kill points\n4. Teaming = instant disqualification",
        status: "ongoing",
        organiser: org2._id,
        roomId: "SOLO_S4_LIVE",
        roomPassword: "solo4@live",
        blocked: false
      },

      // ══════════════════════════════
      // COMPLETED (12)
      // ══════════════════════════════
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
        roomPassword: "s3finals",
        blocked: false
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
        organiser: org2._id,
        roomId: "VAL_INV_01",
        roomPassword: "valo_inv_1",
        blocked: false
      },
      {
        title: "Free Fire Weekly Cup #12",
        game: "Free Fire",
        description: "Week 12 completed. Squad BLAZE FURY dominated with 42 total points across 3 matches. Week 13 registrations now open.",
        mode: "Squad",
        prizePool: "₹1,500",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(now - 7 * day),
        registrationDeadline: new Date(now - 9 * day),
        rules: "Standard weekly cup rules applied.",
        status: "completed",
        organiser: org1._id,
        roomId: "FF_WC_12",
        roomPassword: "weekly12done",
        blocked: false
      },
      {
        title: "BGMI Solo Survival Cup III",
        game: "BGMI",
        description: "Cup III finished. SILENT SCOPE won with back-to-back chicken dinners in matches 4 and 5. 100 solo players competed.",
        mode: "Solo",
        prizePool: "₹5,000",
        entryFee: 50,
        maxPlayers: 100,
        startDate: new Date(now - 10 * day),
        registrationDeadline: new Date(now - 13 * day),
        rules: "Standard solo cup rules applied.",
        status: "completed",
        organiser: org2._id,
        roomId: "SOLO_CUP_03",
        roomPassword: "solo3done",
        blocked: false
      },
      {
        title: "BGMI Duo Cup — Season 2",
        game: "BGMI",
        description: "Season 2 complete. PRO_SNIPER & NEON_GHOST took home the prize after a dominant finals performance. 32 duos competed.",
        mode: "Duo",
        prizePool: "₹4,000",
        entryFee: 60,
        maxPlayers: 32,
        startDate: new Date(now - 12 * day),
        registrationDeadline: new Date(now - 15 * day),
        rules: "Standard duo rules applied.",
        status: "completed",
        organiser: org2._id,
        roomId: "DUO_S2_FIN",
        roomPassword: "duo2done",
        blocked: false
      },
      {
        title: "CS2 Community Cup — Beta",
        game: "CS2",
        description: "First CS2 beta event complete. 16 teams participated. Winner: BINARY GHOST led squad with flawless AWP play in the finals.",
        mode: "Squad",
        prizePool: "₹5,000",
        entryFee: 75,
        maxPlayers: 20,
        startDate: new Date(now - 8 * day),
        registrationDeadline: new Date(now - 10 * day),
        rules: "Standard CS2 competitive rules applied.",
        status: "completed",
        organiser: org3._id,
        roomId: "CS2_BETA_FIN",
        roomPassword: "cs2beta_done",
        blocked: false
      },
      {
        title: "COD Mobile Season Opener",
        game: "COD Mobile",
        description: "Season opener complete. CYBER WOLF's squad dominated the tournament losing only 1 match across all rounds. 24 teams competed.",
        mode: "Squad",
        prizePool: "₹3,500",
        entryFee: 50,
        maxPlayers: 24,
        startDate: new Date(now - 18 * day),
        registrationDeadline: new Date(now - 20 * day),
        rules: "Standard COD Mobile competitive rules applied.",
        status: "completed",
        organiser: org3._id,
        roomId: "CODM_S1_FIN",
        roomPassword: "codm_s1_done",
        blocked: false
      },
      {
        title: "Rocket League Season 1 Finals",
        game: "Rocket League",
        description: "First Rocket League tournament on BattleArena concluded. NOVA STRIKE won the 1v1 final in overtime. Incredible mechanical plays throughout.",
        mode: "Solo",
        prizePool: "₹2,500",
        entryFee: 40,
        maxPlayers: 32,
        startDate: new Date(now - 14 * day),
        registrationDeadline: new Date(now - 16 * day),
        rules: "Standard Rocket League competitive rules applied.",
        status: "completed",
        organiser: org3._id,
        roomId: "RL_S1_FIN",
        roomPassword: "rl_s1_done",
        blocked: false
      },
      {
        title: "Free Fire Clash of Squads IV",
        game: "Free Fire",
        description: "Clash IV complete. VOID STRIKER's squad won with consistent zone play and aggressive rotations. 16 squads participated.",
        mode: "Squad",
        prizePool: "₹2,500",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(now - 5 * day),
        registrationDeadline: new Date(now - 7 * day),
        rules: "Standard Free Fire competitive rules applied.",
        status: "completed",
        organiser: org1._id,
        roomId: "FF_COS_04_FIN",
        roomPassword: "clash4done",
        blocked: false
      },
      {
        title: "Valorant Community Cup I",
        game: "Valorant",
        description: "Community cup complete. Open to all ranks. 20 teams participated. SHADOW ACE's team won without dropping a single map.",
        mode: "Squad",
        prizePool: "₹3,000",
        entryFee: 40,
        maxPlayers: 20,
        startDate: new Date(now - 22 * day),
        registrationDeadline: new Date(now - 24 * day),
        rules: "Standard Valorant competitive rules applied.",
        status: "completed",
        organiser: org2._id,
        roomId: "VAL_CC_01_FIN",
        roomPassword: "valcc1done",
        blocked: false
      },
      {
        title: "BGMI Season 2 Grand Finals",
        game: "BGMI",
        description: "Season 2 concluded with an epic finals match. 48 squads competed. PRO_SNIPER's squad secured 3 chicken dinners in the final lobby.",
        mode: "Squad",
        prizePool: "₹8,000",
        entryFee: 80,
        maxPlayers: 48,
        startDate: new Date(now - 35 * day),
        registrationDeadline: new Date(now - 38 * day),
        rules: "Standard BGMI competitive rules applied.",
        status: "completed",
        organiser: org1._id,
        roomId: "BGMI_S2_FIN",
        roomPassword: "s2finals_done",
        blocked: false
      },
      {
        title: "CS2 Aim Cup — Episode 1",
        game: "CS2",
        description: "1v1 aim duel format — pistols only. 32 players. HEX_BLADE won in dominant fashion with 94% headshot rate across all matches.",
        mode: "Solo",
        prizePool: "₹2,000",
        entryFee: 30,
        maxPlayers: 32,
        startDate: new Date(now - 9 * day),
        registrationDeadline: new Date(now - 11 * day),
        rules: "Standard aim duel rules applied.",
        status: "completed",
        organiser: org3._id,
        roomId: "CS2_AIM_01_FIN",
        roomPassword: "aimcup1done",
        blocked: false
      },
    ];

    const tournaments = await Tournament.insertMany(tournamentData);
    console.log(`✅ ${tournaments.length} Tournaments created`);

    // ═══════════════════════════════
    // LINK TOURNAMENTS TO ORGANISERS
    // ═══════════════════════════════
    const allOrgs = [org1, org2, org3];
    for (let org of allOrgs) {
      org.tournamentsOrganised = tournaments
        .filter(t => t.organiser.equals(org._id))
        .map(t => t._id);
      await org.save();
    }

    // ═══════════════════════════════
    // APPLICATIONS — UPCOMING
    // ═══════════════════════════════

    // BGMI S5 Grand Finals
    tournaments[0].applicants = [
      { player: players[0]._id, status: "accepted" },  // pro_sniper
      { player: players[1]._id, status: "accepted" },  // neon_ghost
      { player: players[2]._id, status: "accepted" },  // blaze_fury
      { player: players[4]._id, status: "pending"  },  // turbo_rush
      { player: players[5]._id, status: "pending"  },  // iron_veil
      { player: players[12]._id, status: "pending" },  // apex_legend_x
      { player: players[13]._id, status: "rejected" }, // dark_phantom
      { player: players[18]._id, status: "pending" },  // reaper_x
    ];
    await tournaments[0].save();

    // Valorant Inv III
    tournaments[1].applicants = [
      { player: players[6]._id,  status: "accepted" }, // shadow_ace
      { player: players[7]._id,  status: "accepted" }, // rapid_storm
      { player: players[8]._id,  status: "accepted" }, // zero_recoil
      { player: players[9]._id,  status: "pending"  }, // phantom_six
      { player: players[21]._id, status: "pending"  }, // lunar_edge
      { player: players[14]._id, status: "rejected" }, // hex_blade
    ];
    await tournaments[1].save();

    // FF Weekly #14
    tournaments[2].applicants = [
      { player: players[10]._id, status: "accepted" }, // void_striker
      { player: players[11]._id, status: "accepted" }, // flame_king
      { player: players[13]._id, status: "pending"  }, // dark_phantom
      { player: players[23]._id, status: "pending"  }, // volt_charge
    ];
    await tournaments[2].save();

    // CS2 Open Cup
    tournaments[3].applicants = [
      { player: players[14]._id, status: "accepted" }, // hex_blade
      { player: players[17]._id, status: "accepted" }, // glitch_mode
      { player: players[21]._id, status: "pending"  }, // binary_ghost
      { player: players[12]._id, status: "pending"  }, // apex_legend_x
    ];
    await tournaments[3].save();

    // COD Mobile Blitz
    tournaments[4].applicants = [
      { player: players[16]._id, status: "accepted" }, // cyber_wolf
      { player: players[18]._id, status: "accepted" }, // reaper_x
      { player: players[20]._id, status: "pending"  }, // pixel_hawk
      { player: players[13]._id, status: "pending"  }, // dark_phantom
    ];
    await tournaments[4].save();

    // BGMI Solo S4
    tournaments[6].applicants = [
      { player: players[0]._id,  status: "accepted" }, // pro_sniper
      { player: players[3]._id,  status: "accepted" }, // silent_scope
      { player: players[1]._id,  status: "pending"  }, // neon_ghost
      { player: players[4]._id,  status: "pending"  }, // turbo_rush
      { player: players[18]._id, status: "pending"  }, // reaper_x
    ];
    await tournaments[6].save();

    // ═══════════════════════════════
    // APPLICATIONS — ONGOING
    // ═══════════════════════════════

    // BGMI S4 Grand Finals (ongoing)
    tournaments[10].applicants = [
      { player: players[0]._id,  status: "accepted" },
      { player: players[1]._id,  status: "accepted" },
      { player: players[2]._id,  status: "accepted" },
      { player: players[4]._id,  status: "accepted" },
      { player: players[5]._id,  status: "accepted" },
      { player: players[12]._id, status: "accepted" },
    ];
    await tournaments[10].save();

    // Valorant Inv II (ongoing)
    tournaments[11].applicants = [
      { player: players[6]._id,  status: "accepted" },
      { player: players[7]._id,  status: "accepted" },
      { player: players[8]._id,  status: "accepted" },
      { player: players[9]._id,  status: "accepted" },
      { player: players[21]._id, status: "accepted" },
    ];
    await tournaments[11].save();

    // FF Clash V (ongoing)
    tournaments[12].applicants = [
      { player: players[10]._id, status: "accepted" },
      { player: players[11]._id, status: "accepted" },
      { player: players[2]._id,  status: "accepted" },
      { player: players[20]._id, status: "accepted" },
    ];
    await tournaments[12].save();

    // COD Mobile Squad War (ongoing)
    tournaments[13].applicants = [
      { player: players[16]._id, status: "accepted" },
      { player: players[18]._id, status: "accepted" },
      { player: players[20]._id, status: "accepted" },
    ];
    await tournaments[13].save();

    // CS2 Pro League (ongoing)
    tournaments[14].applicants = [
      { player: players[14]._id, status: "accepted" },
      { player: players[17]._id, status: "accepted" },
      { player: players[21]._id, status: "accepted" },
      { player: players[22]._id, status: "accepted" },
    ];
    await tournaments[14].save();

    // BGMI Duo S3 (ongoing)
    tournaments[15].applicants = [
      { player: players[0]._id,  status: "accepted" },
      { player: players[1]._id,  status: "accepted" },
      { player: players[4]._id,  status: "accepted" },
      { player: players[3]._id,  status: "accepted" },
    ];
    await tournaments[15].save();

    // Rocket League 3v3 (ongoing)
    tournaments[16].applicants = [
      { player: players[15]._id, status: "accepted" },
      { player: players[19]._id, status: "accepted" },
      { player: players[12]._id, status: "accepted" },
    ];
    await tournaments[16].save();

    // FF Weekly #13 (ongoing)
    tournaments[17].applicants = [
      { player: players[10]._id, status: "accepted" },
      { player: players[11]._id, status: "accepted" },
      { player: players[2]._id,  status: "accepted" },
    ];
    await tournaments[17].save();

    // Valorant 1v1 (ongoing)
    tournaments[18].applicants = [
      { player: players[6]._id,  status: "accepted" },
      { player: players[7]._id,  status: "accepted" },
      { player: players[8]._id,  status: "accepted" },
      { player: players[9]._id,  status: "accepted" },
    ];
    await tournaments[18].save();

    // BGMI S4 Solo Survival (ongoing)
    tournaments[19].applicants = [
      { player: players[0]._id,  status: "accepted" },
      { player: players[3]._id,  status: "accepted" },
      { player: players[1]._id,  status: "accepted" },
      { player: players[4]._id,  status: "accepted" },
      { player: players[18]._id, status: "accepted" },
    ];
    await tournaments[19].save();

    // ═══════════════════════════════
    // COMPLETED — all accepted
    // ═══════════════════════════════
    const completedApplicants = [
      [[0,1,2,3,4,5,12,18]],     // BGMI S3
      [[6,7,8,9,21,22]],         // Valorant Inv I
      [[10,11,2,20]],             // FF Weekly #12
      [[3,0,1,18,4]],             // BGMI Solo III
      [[0,1,4,3]],                // BGMI Duo S2
      [[14,17,22,21]],            // CS2 Beta
      [[16,18,20,13]],            // COD S1
      [[15,19,12]],               // RL S1
      [[10,11,2,20]],             // FF COS IV
      [[6,7,8,9]],                // Valorant CC I
      [[0,1,2,3,4,5]],            // BGMI S2
      [[14,17,22]],               // CS2 Aim Cup
    ];

    for (let i = 0; i < 12; i++) {
      const t = tournaments[20 + i];
      t.applicants = completedApplicants[i][0].map(pi => ({
        player: players[pi]._id,
        status: "accepted"
      }));
      await t.save();
    }

    // ═══════════════════════════════
    // UPDATE PLAYER HISTORIES
    // ═══════════════════════════════
    const playerJoined = {
      0:  [0,6,10,15,19,20,25,30,31],   // pro_sniper
      1:  [0,6,11,15,19,20,25,31],       // neon_ghost
      2:  [0,2,12,17,21,24,30],          // blaze_fury
      3:  [6,15,19,23,25,31],            // silent_scope
      4:  [0,6,15,19,25],                // turbo_rush
      5:  [0,10,15],                     // iron_veil
      6:  [1,11,18,29],                  // shadow_ace
      7:  [1,11,18],                     // rapid_storm
      8:  [1,11,18,21],                  // zero_recoil
      9:  [11,18],                       // phantom_six
      10: [2,12,17,24,28],               // void_striker
      11: [2,12,17],                     // flame_king
      12: [0,10,16,30],                  // apex_legend_x
      14: [3,14,23,31],                  // hex_blade
      15: [5,16],                        // nova_strike
      16: [4,13,26],                     // cyber_wolf
      17: [14,31],                       // glitch_mode
      18: [4,6,13,19],                   // reaper_x
      19: [16],                          // storm_breaker
      20: [4,12,16,28],                  // pixel_hawk
      21: [1,11,14,29],                  // lunar_edge
      22: [14,29],                       // binary_ghost
    };

    for (let [pi, tIndices] of Object.entries(playerJoined)) {
      const validIndices = tIndices.filter(i => i < tournaments.length);
      if (validIndices.length > 0) {
        players[pi].tournamentsJoined = validIndices.map(i => tournaments[i]._id);
        await players[pi].save();
      }
    }

    console.log("✅ All applications and player histories linked");
    console.log("\n══════════════════════════════════════════════════════");
    console.log("  SEED COMPLETE");
    console.log("══════════════════════════════════════════════════════");
    console.log("  ADMIN");
    console.log("  arena_admin     / admin123   (role: admin)");
    console.log("──────────────────────────────────────────────────────");
    console.log("  ORGANISERS (password: org123)");
    console.log("  esports_hub     / org123");
    console.log("  pro_league      / org123");
    console.log("  clutch_events   / org123");
    console.log("──────────────────────────────────────────────────────");
    console.log("  PLAYERS (password: player123) — 24 total");
    console.log("  BGMI:      pro_sniper, neon_ghost, blaze_fury,");
    console.log("             silent_scope, turbo_rush, iron_veil");
    console.log("  Valorant:  shadow_ace, rapid_storm, zero_recoil, phantom_six");
    console.log("  Free Fire: void_striker, flame_king");
    console.log("  Multi:     apex_legend_x, dark_phantom, hex_blade,");
    console.log("             nova_strike, cyber_wolf, glitch_mode,");
    console.log("             reaper_x, storm_breaker, pixel_hawk,");
    console.log("             lunar_edge, binary_ghost, volt_charge");
    console.log("──────────────────────────────────────────────────────");
    console.log("  TOURNAMENTS — 32 total");
    console.log("  Upcoming  — 10");
    console.log("  Ongoing   — 10");
    console.log("  Completed — 12");
    console.log("  Games: BGMI, Valorant, Free Fire, CS2, COD Mobile,");
    console.log("         Rocket League");
    console.log("══════════════════════════════════════════════════════\n");

    mongoose.connection.close();
  } catch (e) {
    console.error("❌ Seed error:", e.message);
    console.error(e);
    mongoose.connection.close();
  }
};

seed();