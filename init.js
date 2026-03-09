require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Tournament = require("./models/tournament");

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));

const seed = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Tournament.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create organiser
    const organiser = new User({
      username: "arena_admin",
      email: "admin@battlearena.com",
      role: "organiser",
      gameUsername: "ArenaAdmin",
      bio: "Official BattleArena tournament organiser."
    });
    await User.register(organiser, "admin123");
    console.log("✅ Organiser created — username: arena_admin / password: admin123");

    // Create players
    const player1 = new User({
      username: "pro_sniper",
      email: "sniper@battlearena.com",
      role: "player",
      gameUsername: "ProSniper99",
      bio: "Top ranked BGMI player. 3x champion."
    });
    await User.register(player1, "player123");

    const player2 = new User({
      username: "shadow_ace",
      email: "shadow@battlearena.com",
      role: "player",
      gameUsername: "Sh4dowAce",
      bio: "Valorant main. Immortal rank."
    });
    await User.register(player2, "player123");

    const player3 = new User({
      username: "void_striker",
      email: "void@battlearena.com",
      role: "player",
      gameUsername: "V01dStrik3r",
      bio: "Free Fire squad captain."
    });
    await User.register(player3, "player123");

    console.log("✅ 3 Players created — password: player123");

    // Create tournaments
    const tournaments = [
      {
        title: "BGMI Season 3 Grand Finals",
        game: "BGMI",
        description: "The biggest BGMI tournament of the season. Top squads battle for the championship title and massive prize pool. Expect intense gameplay and high competition.",
        mode: "Squad",
        prizePool: "₹10,000",
        entryFee: 100,
        maxPlayers: 64,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        rules: "1. No hacking or cheating\n2. Squad of 4 required\n3. Be in lobby 10 mins before start\n4. Organisers decision is final",
        status: "upcoming",
        organiser: organiser._id,
        roomId: "BGMI2024S3",
        roomPassword: "arena@123"
      },
      {
        title: "Valorant Ranked Invitational",
        game: "Valorant",
        description: "An elite 5v5 Valorant tournament for ranked players only. Minimum Platinum rank required. Show your aim and team coordination.",
        mode: "Squad",
        prizePool: "₹5,000",
        entryFee: 50,
        maxPlayers: 32,
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        rules: "1. Minimum Platinum rank\n2. No smurfing\n3. Custom lobby — organiser hosts\n4. Map pool: Haven, Bind, Ascent",
        status: "upcoming",
        organiser: organiser._id,
        roomId: "VAL_INV_01",
        roomPassword: "valo@456"
      },
      {
        title: "Free Fire Clash of Squads",
        game: "Free Fire",
        description: "Fast-paced Free Fire squad battle. 16 squads enter, one leaves as champion. Open to all skill levels.",
        mode: "Squad",
        prizePool: "₹2,000",
        entryFee: 0,
        maxPlayers: 16,
        startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
        rules: "1. No emulators\n2. Squad of 4\n3. Fair play enforced",
        status: "ongoing",
        organiser: organiser._id,
        roomId: "FF_CLASH_01",
        roomPassword: "clash@789"
      },
      {
        title: "BGMI Solo Survival Cup",
        game: "BGMI",
        description: "Solo mode only. No squads, no duos. Pure individual skill. Last man standing wins.",
        mode: "Solo",
        prizePool: "₹3,000",
        entryFee: 30,
        maxPlayers: 100,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        rules: "1. Solo only — no teaming\n2. Report teamers immediately\n3. Top 3 positions win prizes",
        status: "upcoming",
        organiser: organiser._id,
        roomId: "SOLO_CUP_01",
        roomPassword: "solo@321"
      }
    ];

    const createdTournaments = await Tournament.insertMany(tournaments);

    // Link tournaments to organiser
    organiser.tournamentsOrganised = createdTournaments.map(t => t._id);
    await organiser.save();

    // Add some applications to first tournament
    createdTournaments[0].applicants.push(
      { player: player1._id, status: "accepted" },
      { player: player2._id, status: "pending" },
      { player: player3._id, status: "rejected" }
    );
    await createdTournaments[0].save();

    // Update player1's joined list
    player1.tournamentsJoined.push(createdTournaments[0]._id);
    await player1.save();

    console.log("✅ 4 Tournaments created with sample applications");
    console.log("\n══════════════════════════════════════");
    console.log("  SEED COMPLETE — Login Credentials");
    console.log("══════════════════════════════════════");
    console.log("  Organiser → arena_admin / admin123");
    console.log("  Player 1  → pro_sniper  / player123");
    console.log("  Player 2  → shadow_ace  / player123");
    console.log("  Player 3  → void_striker / player123");
    console.log("══════════════════════════════════════\n");

    mongoose.connection.close();
  } catch (e) {
    console.error("❌ Seed error:", e.message);
    mongoose.connection.close();
  }
};

seed();