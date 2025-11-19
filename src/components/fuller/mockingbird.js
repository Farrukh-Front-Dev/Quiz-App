import fs from "fs";
import player from "play-sound";

const lyrics = JSON.parse(fs.readFileSync("./lyrics.json", "utf8"));
const play = player({});

// kursorga o'xshash belgi navbati
const cursors = [":)", ":("];

async function typeLine(line, cursorSymbol) {
  process.stdout.write(cursorSymbol + " "); // satr boshida cursor
  for (const char of line.text) {
    process.stdout.write(char);
    await new Promise(r => setTimeout(r, 40)); // harflar orasi
  }
  process.stdout.write("\n");
}

async function playLyrics() {
  const startTime = Date.now();
  for (let i = 0; i < lyrics.length; i++) {
    const line = lyrics[i];
    const cursorSymbol = cursors[i % cursors.length]; // navbatma-navbat :) va :(
    const now = (Date.now() - startTime) / 1000;
    const wait = Math.max(0, line.time - now);
    await new Promise(r => setTimeout(r, wait * 1000));
    await typeLine(line, cursorSymbol);
  }
  console.log("\n🎵 Eminem - Mockingbird finished 🎵");
}

console.clear();
console.log("🎤 Eminem - Mockingbird\n");

// 🔊 Audio ijro etish
play.play("mockingbird.mp3", function(err){
  if (err) console.error("Audio error:", err);
});

playLyrics();
