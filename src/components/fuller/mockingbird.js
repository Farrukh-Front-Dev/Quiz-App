import fs from "fs";
import chalk from "chalk";
import player from "play-sound";

const lyrics = JSON.parse(fs.readFileSync("./lyrics.json", "utf8"));
const play = player({});

async function typeLine(line) {
  for (const char of line.text) {
    process.stdout.write(chalk.cyan(char));
    await new Promise(r => setTimeout(r, 40)); // harf orasi
  }
  process.stdout.write("\n");
}

async function playLyrics() {
  const startTime = Date.now();
  for (const line of lyrics) {
    const now = (Date.now() - startTime) / 1000;
    const wait = Math.max(0, line.time - now);
    await new Promise(r => setTimeout(r, wait * 1000));
    await typeLine(line);
  }
  console.log(chalk.green("\n🎵 Eminem - Mockingbird finished 🎵"));
}

console.clear();
console.log(chalk.yellowBright("🎤 Eminem - Mockingbird\n"));

// 🔊 Musiqani ijro etish
play.play("mockingbird.mp3", function(err){
  if (err) console.error("Audio error:", err);
});

playLyrics();
