# Neon Sky Survivor — Viral Mobile Game Design

## 🎮 Core Concept

**Neon Sky Survivor** is a fast, colorful arcade survival game built around short runs, instant restarts, and persistent progression:

> Every run is different. Every loss makes you stronger. Every day has a new challenge.

---

## 🔥 1) Viral Core Loop

Each 30–90 second run follows this loop:

1. Start a run
2. Collect coins and survive as long as possible
3. Unlock upgrades and skins
4. Fail and instantly restart
5. Gain rewards and visible progress
6. Share score or challenge friends
7. Return daily for streak rewards and missions

Design goal: short sessions, instant replay, and high engagement feedback.

---

## ⚡ 2) Retention Hooks

### Daily Login
- 7-day reward streak
- Rewards increase each day
- Day 7 grants a rare skin or premium power-up

### Daily Missions
- Collect 200 coins
- Survive 3 runs
- Use 2 power-ups
- Beat your previous score

### Streak Multiplier
- Consecutive days grant bonus coins
- Missing a day resets streak

---

## 👻 3) Ghost Racing

Players race against:
- Their own best run
- Friends’ runs (when connected)
- Global top runs

Purpose: social competition without live multiplayer lag, with strong replay motivation.

---

## 🏆 4) Competition Systems

### Leaderboards
- Daily reset leaderboard
- Weekly rewards
- Seasonal rewards (rare skins)

### Ranked Progression
Bronze → Silver → Gold → Diamond → Legend

UI should always show “distance to next rank” to reinforce progression.

---

## ⚡ 5) Power-Up Design

Power-ups provide high-intensity moments:
- 🛡 Shield: prevent one crash
- 🧲 Magnet: pull nearby coins
- ❄ Slow Time: lower game speed temporarily
- 💰 Coin Rush: double coin gains
- 🚀 Boost: speed burst + score multiplier

Power-ups should be uncommon but frequently visible to build anticipation.

---

## 🎨 6) Visual Viral Strategy

- Neon cyber-sky visual style
- Environment transitions every 20–30 seconds
- Dynamic lighting and particle trails
- Portal transitions and near-death effects
- Slow-motion crash moments
- Rare glowing skins

Design intent: produce shareable “wow moments” suitable for short-form social media clips.

---

## 📢 7) Viral Growth Mechanics

### Referral
- Invite friend → both receive rewards
- Exclusive invite-based skins

### Share Score
- Auto-generated social image includes:
  - Score
  - Rank
  - Equipped skin
- One-tap sharing targets: WhatsApp, TikTok, Instagram

### Beat-My-Score Link
- Generate challenge links tied to a run/score target

---

## 💰 8) Monetization (Retention-Safe)

- Rewarded ads for revive, coin doubling, and optional boosts
- Interstitial ads only after 2–4 runs (never during gameplay)
- Banner ads only in menus

Principle: optional ads first, engagement and retention first.

---

## 🧠 9) Psychological Retention Design

- **Variable rewards:** random power-ups, skins, and surprise events
- **Near-miss tension:** almost-crash moments drive retries
- **Visible progression:** always show next unlock/rank/mission progress
- **Fast restart:** one-tap restart in under 1 second

---

## 🌍 10) Live Events

- Weekly events (double coins, limited maps, special drops)
- Seasonal themes (winter neon world, Halloween mode, summer sky festival)

---

## 🧩 11) Thunkable-Friendly Structure

### Screens
- Home
- Game
- Shop
- Leaderboard
- Profile

### Local Storage Keys
- `coins` (integer)
- `best_score` (integer)
- `skins` (array/list of unlocked skin IDs)
- `current_streak` (integer for current daily login streak)

### Timers
- obstacle spawn
- speed increase
- animation cycles

---

## 📊 12) Retention Targets

- Day 1 retention: **35–45%**
- Day 7 retention: **15–25%**
- Average session length: **3–7 minutes**
- Sessions per day: **3–6**

---

## 🚀 Final Core Formula

Short sessions + instant restart + daily rewards + social competition = high viral retention loop.
