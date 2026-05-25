import './style.css'

const STORAGE_KEYS = {
  coins: 'coins',
  bestScore: 'best_score',
  skins: 'skins',
  currentSkin: 'current_skin',
  currentStreak: 'current_streak',
  lastLogin: 'last_login',
  runHistory: 'run_history',
  dailyStats: 'daily_stats',
}

const SKINS = [
  { id: 'neon-default', name: 'Neon Pulse', color: '#66f4ff', cost: 0 },
  { id: 'pink-flare', name: 'Pink Flare', color: '#ff7ad9', cost: 250 },
  { id: 'lime-bolt', name: 'Lime Bolt', color: '#b9ff66', cost: 500 },
  { id: 'gold-legend', name: 'Gold Legend', color: '#ffd36a', cost: 1000 },
]

const RANKS = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 300 },
  { name: 'Gold', min: 700 },
  { name: 'Diamond', min: 1200 },
  { name: 'Legend', min: 2000 },
]

const POWERUP_CONFIG = {
  shield: { label: 'Shield', duration: 0, color: '#70f5ff' },
  magnet: { label: 'Magnet', duration: 8, color: '#9eff76' },
  slowTime: { label: 'Slow Time', duration: 6, color: '#8fa3ff' },
  coinRush: { label: 'Coin Rush', duration: 8, color: '#ffd56b' },
  boost: { label: 'Boost', duration: 5, color: '#ff8cee' },
}

const appState = {
  coins: getNumber(STORAGE_KEYS.coins),
  bestScore: getNumber(STORAGE_KEYS.bestScore),
  skins: getArray(STORAGE_KEYS.skins, ['neon-default']),
  currentSkin: localStorage.getItem(STORAGE_KEYS.currentSkin) || 'neon-default',
  currentStreak: getNumber(STORAGE_KEYS.currentStreak),
  lastLogin: localStorage.getItem(STORAGE_KEYS.lastLogin),
  runHistory: getArray(STORAGE_KEYS.runHistory, []),
  dailyStats: getDailyStats(),
}

const ui = {
  activeScreen: 'home',
  dailyMessage: '',
}

const game = {
  running: false,
  width: 360,
  height: 640,
  score: 0,
  runCoins: 0,
  time: 0,
  speed: 230,
  spawnClock: 0,
  coinClock: 0,
  powerupClock: 0,
  flash: 0,
  player: { x: 180, y: 565, size: 26, speed: 340, shielded: false },
  entities: [],
  effects: { magnet: 0, slowTime: 0, coinRush: 0, boost: 0 },
  input: { left: false, right: false, pointerX: null },
  lastFrame: 0,
}

document.querySelector('#app').innerHTML = renderLayout()

const elements = {
  screens: [...document.querySelectorAll('.screen')],
  navButtons: [...document.querySelectorAll('[data-screen-target]')],
  startButtons: [...document.querySelectorAll('[data-action="start-run"]')],
  canvas: document.querySelector('#gameCanvas'),
  ctx: document.querySelector('#gameCanvas').getContext('2d'),
  homeStats: document.querySelector('#homeStats'),
  dailyMessage: document.querySelector('#dailyMessage'),
  activePowerups: document.querySelector('#activePowerups'),
  runScore: document.querySelector('#runScore'),
  runCoins: document.querySelector('#runCoins'),
  runTimer: document.querySelector('#runTimer'),
  ghostTarget: document.querySelector('#ghostTarget'),
  resultPanel: document.querySelector('#runResult'),
  missionList: document.querySelector('#missionList'),
  shopList: document.querySelector('#shopList'),
  leaderboardList: document.querySelector('#leaderboardList'),
  profileSummary: document.querySelector('#profileSummary'),
  shareButton: document.querySelector('#shareButton'),
}

ensureStateIntegrity()
applyDailyLoginReward()
bindEvents()
renderAll()
showScreen('home')

function bindEvents() {
  elements.navButtons.forEach((button) => {
    button.addEventListener('click', () => showScreen(button.dataset.screenTarget))
  })

  elements.startButtons.forEach((button) => {
    button.addEventListener('click', () => {
      showScreen('game')
      startRun()
    })
  })

  elements.shareButton.addEventListener('click', async () => {
    const text = `I reached ${Math.floor(appState.bestScore)} in Neon Sky Survivor! Beat my score.`
    try {
      await navigator.clipboard.writeText(text)
      elements.shareButton.textContent = 'Challenge copied!'
      setTimeout(() => {
        elements.shareButton.textContent = 'Copy Beat-My-Score Challenge'
      }, 1200)
    } catch {
      elements.shareButton.textContent = 'Clipboard blocked'
      setTimeout(() => {
        elements.shareButton.textContent = 'Copy Beat-My-Score Challenge'
      }, 1200)
    }
  })

  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') game.input.left = true
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') game.input.right = true
    if (event.key === 'r' && !game.running && ui.activeScreen === 'game') startRun()
  })

  window.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') game.input.left = false
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') game.input.right = false
  })

  elements.canvas.addEventListener('pointermove', (event) => {
    const rect = elements.canvas.getBoundingClientRect()
    game.input.pointerX = ((event.clientX - rect.left) / rect.width) * game.width
  })

  elements.canvas.addEventListener('pointerleave', () => {
    game.input.pointerX = null
  })
}

function showScreen(name) {
  ui.activeScreen = name
  elements.screens.forEach((screen) => {
    screen.classList.toggle('active', screen.dataset.screen === name)
  })
  elements.navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.screenTarget === name)
  })
  renderAll()
}

function startRun() {
  game.running = true
  game.score = 0
  game.runCoins = 0
  game.time = 0
  game.speed = 230
  game.spawnClock = 0
  game.coinClock = 0
  game.powerupClock = 0
  game.flash = 0
  game.entities = []
  game.effects = { magnet: 0, slowTime: 0, coinRush: 0, boost: 0 }
  game.player = { x: 180, y: 565, size: 26, speed: 340, shielded: false }
  game.lastFrame = performance.now()
  elements.resultPanel.hidden = true
  requestAnimationFrame(tick)
}

function tick(timestamp) {
  if (!game.running) {
    draw()
    return
  }

  const dt = Math.min((timestamp - game.lastFrame) / 1000, 0.033)
  game.lastFrame = timestamp

  updateEffects(dt)
  updatePlayer(dt)
  updateSpawns(dt)
  updateEntities(dt)
  updateScore(dt)

  draw()
  renderRunHud()

  requestAnimationFrame(tick)
}

function updateEffects(dt) {
  for (const key of Object.keys(game.effects)) {
    game.effects[key] = Math.max(0, game.effects[key] - dt)
  }

  if (game.flash > 0) game.flash = Math.max(0, game.flash - dt)
}

function updatePlayer(dt) {
  const speedBoost = game.effects.boost > 0 ? 1.2 : 1

  if (game.input.pointerX !== null) {
    const delta = game.input.pointerX - game.player.x
    game.player.x += delta * Math.min(1, dt * 10)
  } else {
    if (game.input.left) game.player.x -= game.player.speed * speedBoost * dt
    if (game.input.right) game.player.x += game.player.speed * speedBoost * dt
  }

  const half = game.player.size / 2
  game.player.x = clamp(game.player.x, half, game.width - half)
}

function updateSpawns(dt) {
  const slowFactor = game.effects.slowTime > 0 ? 0.6 : 1
  game.speed += dt * 3

  game.spawnClock -= dt
  game.coinClock -= dt
  game.powerupClock -= dt

  if (game.spawnClock <= 0) {
    spawnObstacle(slowFactor)
    game.spawnClock = Math.max(0.25, 0.9 - game.time / 60)
  }

  if (game.coinClock <= 0) {
    spawnCoin(slowFactor)
    game.coinClock = 0.4
  }

  if (game.powerupClock <= 0) {
    spawnPowerup(slowFactor)
    game.powerupClock = 7.5
  }
}

function spawnObstacle(slowFactor) {
  game.entities.push({
    type: 'obstacle',
    x: random(15, game.width - 15),
    y: -30,
    size: random(22, 36),
    vy: (game.speed + random(50, 130)) * slowFactor,
  })
}

function spawnCoin(slowFactor) {
  game.entities.push({
    type: 'coin',
    x: random(12, game.width - 12),
    y: -20,
    size: 14,
    vy: (game.speed + 120) * slowFactor,
  })
}

function spawnPowerup(slowFactor) {
  const keys = Object.keys(POWERUP_CONFIG)
  const pick = keys[Math.floor(Math.random() * keys.length)]
  game.entities.push({
    type: 'powerup',
    powerup: pick,
    x: random(15, game.width - 15),
    y: -24,
    size: 18,
    vy: (game.speed + 70) * slowFactor,
  })
}

function updateEntities(dt) {
  const player = game.player
  const magnetOn = game.effects.magnet > 0

  game.entities = game.entities.filter((entity) => {
    if (entity.type === 'coin' && magnetOn) {
      const dx = player.x - entity.x
      const dy = player.y - entity.y
      const d = Math.hypot(dx, dy)
      if (d < 120 && d > 1) {
        entity.x += (dx / d) * 220 * dt
        entity.y += (dy / d) * 220 * dt
      }
    }

    entity.y += entity.vy * dt

    if (intersects(entity, player)) {
      if (entity.type === 'obstacle') {
        if (game.player.shielded) {
          game.player.shielded = false
          game.flash = 0.25
          return false
        }
        finishRun()
        return false
      }

      if (entity.type === 'coin') {
        const multiplier = game.effects.coinRush > 0 ? 2 : 1
        const gained = 5 * multiplier
        game.runCoins += gained
        appState.dailyStats.coinsCollected += gained
        return false
      }

      if (entity.type === 'powerup') {
        applyPowerup(entity.powerup)
        appState.dailyStats.powerupsUsed += 1
        return false
      }
    }

    return entity.y < game.height + 40
  })
}

function applyPowerup(name) {
  const config = POWERUP_CONFIG[name]
  if (!config) return

  if (name === 'shield') {
    game.player.shielded = true
  } else {
    game.effects[name] = Math.max(game.effects[name], config.duration)
  }
}

function updateScore(dt) {
  game.time += dt
  const boostMultiplier = game.effects.boost > 0 ? 1.8 : 1
  game.score += dt * 100 * boostMultiplier
}

function finishRun() {
  if (!game.running) return

  game.running = false
  appState.coins += Math.floor(game.runCoins)
  appState.bestScore = Math.max(appState.bestScore, Math.floor(game.score))
  appState.dailyStats.runs += 1

  const scoreNow = Math.floor(game.score)
  if (scoreNow >= appState.bestScore) {
    appState.dailyStats.beatBest = true
  }

  appState.runHistory.unshift({
    date: new Date().toISOString(),
    score: scoreNow,
    coins: Math.floor(game.runCoins),
    duration: Math.floor(game.time),
  })
  appState.runHistory = appState.runHistory.slice(0, 30)

  saveAll()
  renderAll()

  elements.resultPanel.hidden = false
  elements.resultPanel.innerHTML = `
    <h3>Run Ended</h3>
    <p>Score: <strong>${scoreNow}</strong></p>
    <p>Coins Collected: <strong>${Math.floor(game.runCoins)}</strong></p>
    <button class="button primary" data-action="start-run">Restart</button>
  `

  elements.resultPanel.querySelector('[data-action="start-run"]').addEventListener('click', startRun)
}

function renderAll() {
  renderHome()
  renderShop()
  renderLeaderboard()
  renderProfile()
  renderMissions()
  renderRunHud()
}

function renderHome() {
  const { currentRank, nextRank, progress } = getRankInfo(appState.bestScore)
  elements.homeStats.innerHTML = `
    <div class="stat-card"><span>Coins</span><strong>${appState.coins}</strong></div>
    <div class="stat-card"><span>Best Score</span><strong>${appState.bestScore}</strong></div>
    <div class="stat-card"><span>Current Rank</span><strong>${currentRank.name}</strong></div>
    <div class="stat-card"><span>Rank Progress</span><strong>${progress}${nextRank ? `% to ${nextRank.name}` : '%'}</strong></div>
  `
  elements.dailyMessage.textContent = ui.dailyMessage || 'Return daily to keep your streak rewards growing.'
}

function renderShop() {
  elements.shopList.innerHTML = SKINS.map((skin) => {
    const owned = appState.skins.includes(skin.id)
    const equipped = appState.currentSkin === skin.id

    const buttonLabel = equipped ? 'Equipped' : owned ? 'Equip' : `Unlock (${skin.cost} coins)`
    const disabled = equipped || (!owned && appState.coins < skin.cost)

    return `
      <article class="skin-card">
        <div class="skin-preview" style="background:${skin.color}"></div>
        <div>
          <h4>${skin.name}</h4>
          <p>${owned ? 'Owned' : 'Locked skin'}</p>
        </div>
        <button class="button" data-skin="${skin.id}" ${disabled ? 'disabled' : ''}>${buttonLabel}</button>
      </article>
    `
  }).join('')

  elements.shopList.querySelectorAll('[data-skin]').forEach((button) => {
    button.addEventListener('click', () => {
      const skin = SKINS.find((entry) => entry.id === button.dataset.skin)
      if (!skin) return

      if (!appState.skins.includes(skin.id)) {
        appState.coins -= skin.cost
        appState.skins.push(skin.id)
      }

      appState.currentSkin = skin.id
      saveAll()
      renderAll()
    })
  })
}

function renderLeaderboard() {
  const today = dateKey(new Date())
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const dailyTop = appState.runHistory
    .filter((run) => dateKey(new Date(run.date)) === today)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const weeklyTop = appState.runHistory
    .filter((run) => new Date(run.date) >= weekAgo)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  elements.leaderboardList.innerHTML = `
    <section>
      <h4>Daily Top 5</h4>
      ${renderRunRows(dailyTop)}
    </section>
    <section>
      <h4>Weekly Top 5</h4>
      ${renderRunRows(weeklyTop)}
    </section>
  `
}

function renderProfile() {
  const { currentRank, nextRank, pointsToNext } = getRankInfo(appState.bestScore)
  elements.profileSummary.innerHTML = `
    <div class="profile-item"><span>Login Streak</span><strong>${appState.currentStreak} days</strong></div>
    <div class="profile-item"><span>Rank</span><strong>${currentRank.name}</strong></div>
    <div class="profile-item"><span>Next Rank Distance</span><strong>${pointsToNext}</strong></div>
    <div class="profile-item"><span>Skins Unlocked</span><strong>${appState.skins.length}/${SKINS.length}</strong></div>
  `
}

function renderMissions() {
  const bestTarget = Math.max(100, appState.bestScore)
  const missions = [
    { label: 'Collect 200 coins', progress: appState.dailyStats.coinsCollected, target: 200 },
    { label: 'Survive 3 runs', progress: appState.dailyStats.runs, target: 3 },
    { label: 'Use 2 power-ups', progress: appState.dailyStats.powerupsUsed, target: 2 },
    { label: 'Beat your previous best', progress: appState.dailyStats.beatBest ? bestTarget : 0, target: bestTarget },
  ]

  elements.missionList.innerHTML = missions.map((mission) => {
    const percent = Math.min(100, Math.floor((mission.progress / mission.target) * 100))
    return `
      <li>
        <div class="mission-row">
          <span>${mission.label}</span>
          <strong>${Math.min(mission.progress, mission.target)}/${mission.target}</strong>
        </div>
        <div class="bar"><div style="width:${percent}%"></div></div>
      </li>
    `
  }).join('')
}

function renderRunHud() {
  elements.runScore.textContent = Math.floor(game.score)
  elements.runCoins.textContent = Math.floor(game.runCoins)
  elements.runTimer.textContent = `${Math.floor(game.time)}s`
  elements.ghostTarget.textContent = appState.bestScore

  const active = []
  if (game.player.shielded) active.push('Shield')
  for (const key of Object.keys(game.effects)) {
    if (game.effects[key] > 0) {
      active.push(`${POWERUP_CONFIG[key].label} ${Math.ceil(game.effects[key])}s`)
    }
  }

  elements.activePowerups.textContent = active.length ? active.join(' • ') : 'No active power-ups'
}

function draw() {
  const ctx = elements.ctx
  const gradient = ctx.createLinearGradient(0, 0, 0, game.height)
  gradient.addColorStop(0, '#080b24')
  gradient.addColorStop(1, '#141236')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, game.width, game.height)

  ctx.strokeStyle = 'rgba(108,131,255,0.18)'
  for (let y = 0; y < game.height; y += 44) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(game.width, y)
    ctx.stroke()
  }

  for (const entity of game.entities) {
    if (entity.type === 'obstacle') {
      drawCircle(entity.x, entity.y, entity.size / 2, '#f85c8d')
    } else if (entity.type === 'coin') {
      drawCircle(entity.x, entity.y, entity.size / 2, '#ffe06d')
    } else {
      drawCircle(entity.x, entity.y, entity.size / 2, POWERUP_CONFIG[entity.powerup].color)
    }
  }

  const skin = SKINS.find((entry) => entry.id === appState.currentSkin) || SKINS[0]
  drawCircle(game.player.x, game.player.y, game.player.size / 2, skin.color)

  if (game.player.shielded) {
    ctx.strokeStyle = '#70f5ff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(game.player.x, game.player.y, game.player.size / 2 + 7, 0, Math.PI * 2)
    ctx.stroke()
  }

  if (game.flash > 0) {
    ctx.fillStyle = `rgba(112,245,255,${game.flash * 0.4})`
    ctx.fillRect(0, 0, game.width, game.height)
  }
}

function drawCircle(x, y, r, color) {
  const ctx = elements.ctx
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function applyDailyLoginReward() {
  const today = dateKey(new Date())

  if (appState.lastLogin === today) {
    ui.dailyMessage = `Welcome back! Streak day ${appState.currentStreak}.`
    return
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = dateKey(yesterday)

  if (appState.lastLogin === yesterdayKey) {
    appState.currentStreak += 1
  } else {
    appState.currentStreak = 1
  }

  const reward = Math.min(700, appState.currentStreak * 50)
  appState.coins += reward
  appState.lastLogin = today

  saveAll()
  ui.dailyMessage = `Daily login bonus +${reward} coins. Streak day ${appState.currentStreak}!`
}

function saveAll() {
  localStorage.setItem(STORAGE_KEYS.coins, String(appState.coins))
  localStorage.setItem(STORAGE_KEYS.bestScore, String(appState.bestScore))
  localStorage.setItem(STORAGE_KEYS.skins, JSON.stringify(appState.skins))
  localStorage.setItem(STORAGE_KEYS.currentSkin, appState.currentSkin)
  localStorage.setItem(STORAGE_KEYS.currentStreak, String(appState.currentStreak))
  localStorage.setItem(STORAGE_KEYS.lastLogin, appState.lastLogin || '')
  localStorage.setItem(STORAGE_KEYS.runHistory, JSON.stringify(appState.runHistory))
  localStorage.setItem(STORAGE_KEYS.dailyStats, JSON.stringify(appState.dailyStats))
}

function ensureStateIntegrity() {
  if (!appState.skins.includes('neon-default')) appState.skins.unshift('neon-default')
  if (!SKINS.some((skin) => skin.id === appState.currentSkin)) appState.currentSkin = 'neon-default'

  const key = dateKey(new Date())
  if (appState.dailyStats.date !== key) {
    appState.dailyStats = { date: key, runs: 0, coinsCollected: 0, powerupsUsed: 0, beatBest: false }
  }

  saveAll()
}

function getRankInfo(score) {
  const currentRank = [...RANKS].reverse().find((rank) => score >= rank.min) || RANKS[0]
  const currentIndex = RANKS.findIndex((rank) => rank.name === currentRank.name)
  const nextRank = RANKS[currentIndex + 1]

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      pointsToNext: 0,
      progress: 100,
    }
  }

  const range = nextRank.min - currentRank.min
  const currentValue = score - currentRank.min
  const progress = Math.floor((currentValue / range) * 100)

  return {
    currentRank,
    nextRank,
    pointsToNext: Math.max(0, nextRank.min - score),
    progress,
  }
}

function renderRunRows(rows) {
  if (!rows.length) return '<p class="muted">No runs yet.</p>'

  return `<ol>${rows
    .map((row) => `<li><span>${row.score} pts</span><small>${new Date(row.date).toLocaleDateString()}</small></li>`)
    .join('')}</ol>`
}

function getDailyStats() {
  const parsed = getArray(STORAGE_KEYS.dailyStats, null)
  const key = dateKey(new Date())

  if (!parsed || parsed.date !== key) {
    return { date: key, runs: 0, coinsCollected: 0, powerupsUsed: 0, beatBest: false }
  }

  return parsed
}

function getNumber(key) {
  const value = Number(localStorage.getItem(key))
  return Number.isFinite(value) ? value : 0
}

function getArray(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function renderLayout() {
  return `
    <div class="app-shell">
      <header class="topbar">
        <h1>Neon Sky Survivor</h1>
        <p>Fast survival runs, daily streak rewards, and shareable score challenges.</p>
      </header>

      <nav class="tabs">
        <button class="tab active" data-screen-target="home">Home</button>
        <button class="tab" data-screen-target="game">Game</button>
        <button class="tab" data-screen-target="shop">Shop</button>
        <button class="tab" data-screen-target="leaderboard">Leaderboard</button>
        <button class="tab" data-screen-target="profile">Profile</button>
      </nav>

      <main>
        <section class="screen active" data-screen="home">
          <div id="dailyMessage" class="highlight"></div>
          <div id="homeStats" class="stats-grid"></div>

          <div class="panel">
            <h2>Daily Missions</h2>
            <ul id="missionList" class="missions"></ul>
          </div>

          <div class="actions-row">
            <button class="button primary" data-action="start-run">Start Run</button>
            <button class="button" id="shareButton">Copy Beat-My-Score Challenge</button>
          </div>
        </section>

        <section class="screen" data-screen="game">
          <div class="hud">
            <span>Score: <strong id="runScore">0</strong></span>
            <span>Coins: <strong id="runCoins">0</strong></span>
            <span>Time: <strong id="runTimer">0s</strong></span>
            <span>Ghost: <strong id="ghostTarget">0</strong></span>
          </div>

          <canvas id="gameCanvas" width="360" height="640"></canvas>
          <p class="hint">Move with A/D, ←/→, or drag on the canvas.</p>
          <p id="activePowerups" class="highlight mini">No active power-ups</p>
          <div id="runResult" class="panel" hidden></div>
        </section>

        <section class="screen" data-screen="shop">
          <div class="panel">
            <h2>Skin Shop</h2>
            <div id="shopList" class="shop-grid"></div>
          </div>
        </section>

        <section class="screen" data-screen="leaderboard">
          <div class="panel">
            <h2>Ranked Boards</h2>
            <div id="leaderboardList" class="leaderboard-grid"></div>
          </div>
        </section>

        <section class="screen" data-screen="profile">
          <div class="panel">
            <h2>Player Profile</h2>
            <div id="profileSummary" class="profile-grid"></div>
          </div>
        </section>
      </main>
    </div>
  `
}

function intersects(a, b) {
  return Math.abs(a.x - b.x) < (a.size + b.size) / 2 && Math.abs(a.y - b.y) < (a.size + b.size) / 2
}

function random(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
