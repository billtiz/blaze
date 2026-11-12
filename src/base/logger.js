
// ═══════════════════════════════════════════════════
//  BLAZE BOT — Logger (Optimized)
// ═══════════════════════════════════════════════════

const esc = (code) => `\x1b[${code}m`;

const c = {
  reset:    esc(0),
  bold:     esc(1),
  dim:      esc(2),
  gray:     esc(90),
  white:    esc(37),
  red:      esc(31),
  green:    esc(32),
  yellow:   esc(33),
  blue:     esc(34),
  magenta:  esc(35),
  cyan:     esc(36),
  slate:    "\x1b[38;5;103m",
  steel:    "\x1b[38;5;110m",
  mint:     "\x1b[38;5;114m",
  peach:    "\x1b[38;5;216m",
  lavender: "\x1b[38;5;141m",
  ice:      "\x1b[38;5;153m",
  coral:    "\x1b[38;5;210m",
  gold:     "\x1b[38;5;179m",
  cloud:    "\x1b[38;5;252m",
  ash:      "\x1b[38;5;240m",
  smoke:    "\x1b[38;5;245m",
  bgDark:   "\x1b[48;5;234m",
};

// Pre-build badge strings (computed once, not on every call)
const badges = {
  log:      `${c.bgDark}${c.cloud}${c.bold} LOG ${c.reset}`,
  warn:     `${c.bgDark}${c.gold}${c.bold} WARN ${c.reset}`,
  error:    `${c.bgDark}${c.coral}${c.bold} ERROR ${c.reset}`,
  debug:    `${c.bgDark}${c.lavender}${c.bold} DEBUG ${c.reset}`,
  cmd:      `${c.bgDark}${c.ice}${c.bold} CMD ${c.reset}`,
  event:    `${c.bgDark}${c.steel}${c.bold} EVENT ${c.reset}`,
  ready:    `${c.bgDark}${c.mint}${c.bold} READY ${c.reset}`,
  music:    `${c.bgDark}${c.lavender}${c.bold} MUSIC ${c.reset}`,
  database: `${c.bgDark}${c.gold}${c.bold} DB ${c.reset}`,
  cluster:  `${c.bgDark}${c.ice}${c.bold} CLUSTER ${c.reset}`,
};

const textColors = {
  log: c.smoke, warn: c.gold, error: c.coral, debug: c.slate,
  cmd: c.steel, event: c.steel, ready: c.mint, music: c.lavender,
  database: c.gold, cluster: c.ice,
};

// Fast timestamp using native Date (no moment overhead)
function ts() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${c.ash}${h}:${m}:${s}${c.reset}`;
}

module.exports = class Logger {

  static log(content, type = "log") {
    const badge = badges[type] || badges.log;
    const color = textColors[type] || c.smoke;
    console.log(`  ${ts()}  ${badge}  ${color}${content}${c.reset}`);
  }

  static banner() {
    const r = c.reset;
    const g1 = "\x1b[38;5;60m";
    const g2 = "\x1b[38;5;61m";
    const g3 = "\x1b[38;5;62m";
    const g4 = "\x1b[38;5;97m";
    const g5 = "\x1b[38;5;133m";
    const g6 = "\x1b[38;5;139m";
    const pid = String(process.pid);
    const version = require("../../package.json").version || "2.1.0";
    const verStr = `v${version}`;
    const verPad = " ".repeat(Math.max(0, 30 - verStr.length));

    console.log([
      "",
      `  ${g1}╔══════════════════════════════════════════════════╗${r}`,
      `  ${g1}║${r}                                                  ${g1}║${r}`,
      `  ${g2}║${r}   ${g3}░▒▓${g4}█${r} ${c.cloud}${c.bold}N O T H I N G${r}  ${g5}█${g4}▓▒░${r}                  ${g2}║${r}`,
      `  ${g3}║${r}                                                  ${g3}║${r}`,
      `  ${g4}║${r}   ${c.smoke}┌─────────────────────────────────────────┐${r}   ${g4}║${r}`,
      `  ${g4}║${r}   ${c.smoke}│${r}  ${c.ash}Platform  ${c.cloud}Discord Music Bot${r}              ${c.smoke}│${r}   ${g4}║${r}`,
      `  ${g5}║${r}   ${c.smoke}│${r}  ${c.ash}Version   ${c.cloud}${verStr}${r}${verPad}${c.smoke}│${r}   ${g5}║${r}`,
      `  ${g5}║${r}   ${c.smoke}│${r}  ${c.ash}Runtime   ${c.cloud}Node.js ${process.version}${r}${" ".repeat(Math.max(0, 17 - process.version.length))}${c.smoke}│${r}   ${g5}║${r}`,
      `  ${g6}║${r}   ${c.smoke}│${r}  ${c.ash}PID       ${c.cloud}${pid}${r}${" ".repeat(Math.max(0, 27 - pid.length))}${c.smoke}│${r}   ${g6}║${r}`,
      `  ${g6}║${r}   ${c.smoke}└─────────────────────────────────────────┘${r}   ${g6}║${r}`,
      `  ${g6}║${r}                                                  ${g6}║${r}`,
      `  ${g6}╚══════════════════════════════════════════════════╝${r}`,
      "",
    ].join("\n"));
  }

  static section(title) {
    const bar = "─".repeat(Math.max(0, 42 - title.length));
    console.log(`\n  ${c.slate}╭─${c.reset} ${c.cloud}${c.bold}${title}${c.reset} ${c.slate}${bar}╮${c.reset}`);
  }

  static sectionEnd() {
    console.log(`  ${c.slate}╰──────────────────────────────────────────────╯${c.reset}`);
  }

  static success(content) {
    console.log(`  ${c.slate}│${c.reset}  ${c.mint}✔${c.reset}  ${c.smoke}${content}${c.reset}`);
  }

  static info(content) {
    console.log(`  ${c.slate}│${c.reset}  ${c.steel}→${c.reset}  ${c.smoke}${content}${c.reset}`);
  }

  static stats(data) {
    const entries = Object.entries(data);
    const maxKeyLen = Math.max(...entries.map(([k]) => k.length));
    const lineW = maxKeyLen + 20;

    console.log(`  ${c.slate}│${c.reset}`);
    console.log(`  ${c.slate}│${c.reset}  ${c.ash}┌${"─".repeat(lineW)}┐${c.reset}`);

    for (const [key, value] of entries) {
      console.log(`  ${c.slate}│${c.reset}  ${c.ash}│${c.reset}  ${c.smoke}${key.padEnd(maxKeyLen)}${c.reset}  ${c.ash}·${c.reset}  ${c.cloud}${c.bold}${value}${c.reset}`);
    }

    console.log(`  ${c.slate}│${c.reset}  ${c.ash}└${"─".repeat(lineW)}┘${c.reset}`);
    console.log(`  ${c.slate}│${c.reset}`);
  }

  static divider() {
    console.log(`  ${c.ash}${"·".repeat(48)}${c.reset}`);
  }
};