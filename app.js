/* === GLOBAL STATE === */
const pages = document.querySelectorAll(".page");
const navRoutes = document.querySelectorAll(".nav-route");
const navLinks = document.querySelectorAll(".nav-link");
const mobileToggle = document.querySelector(".mobile-toggle");
const navMenu = document.querySelector(".nav-links");
const validPages = ["home", "concepts", "prices", "simulator"];

/* === STAR-FIELD CANVAS === */
const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");
let stars = [];

function resizeStars() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  stars = Array.from({ length: Math.min(180, Math.floor(window.innerWidth / 7)) }, createStar);
}

function createStar() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + .35,
    speed: Math.random() * .22 + .04,
    alpha: Math.random() * .65 + .2
  };
}

function animateStars() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  stars.forEach(drawStar);
  requestAnimationFrame(animateStars);
}

function drawStar(star) {
  star.y += star.speed;
  if (star.y > window.innerHeight + 4) {
    star.y = -4;
    star.x = Math.random() * window.innerWidth;
  }
  ctx.beginPath();
  ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(232,234,246,${star.alpha})`;
  ctx.fill();
}

/* === ROUTING === */
function showPage(pageName, shouldUpdateHash = true) {
  const target = validPages.includes(pageName) ? pageName : "home";
  pages.forEach(updatePageVisibility(target));
  navLinks.forEach(updateActiveNav(target));
  if (shouldUpdateHash) {
    window.location.hash = target;
  }
  navMenu.classList.remove("open");
  mobileToggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (target === "prices" && !priceState.hasLoaded) {
    fetchPrices();
  }
}

function updatePageVisibility(target) {
  return function togglePage(page) {
    page.classList.toggle("active-page", page.dataset.page === target);
  };
}

function updateActiveNav(target) {
  return function setActive(link) {
    link.classList.toggle("active", link.dataset.page === target);
  };
}

function handleRouteClick(event) {
  const page = event.currentTarget.dataset.page;
  showPage(page);
}

function handleHashChange() {
  showPage(window.location.hash.replace("#", "") || "home", false);
}

function toggleMobileMenu() {
  const isOpen = navMenu.classList.toggle("open");
  mobileToggle.setAttribute("aria-expanded", String(isOpen));
}

/* === PAGE 2: CONCEPTS === */
const conceptSearch = document.getElementById("concept-search");
const conceptCards = document.querySelectorAll(".concept-card");
const filterButtons = document.querySelectorAll(".tab-btn");
let activeConceptFilter = "all";

function filterConcepts() {
  const term = conceptSearch.value.trim().toLowerCase();
  conceptCards.forEach(function updateCard(card) {
    const matchesFilter = activeConceptFilter === "all" || card.dataset.tags.includes(activeConceptFilter);
    const matchesSearch = card.dataset.title.toLowerCase().includes(term) || card.textContent.toLowerCase().includes(term);
    card.classList.toggle("is-hidden", !(matchesFilter && matchesSearch));
  });
}

function handleFilterClick(event) {
  activeConceptFilter = event.currentTarget.dataset.filter;
  filterButtons.forEach(function updateButton(button) {
    button.classList.toggle("active", button === event.currentTarget);
  });
  filterConcepts();
}

function handleExpandClick(event) {
  event.currentTarget.closest(".concept-card").classList.toggle("expanded");
}

function handleShareClick(event) {
  const card = event.currentTarget.closest(".concept-card");
  card.classList.add("expanded");
  event.currentTarget.textContent = "✓";
  setTimeout(function restoreShareIcon() {
    event.currentTarget.textContent = "↗";
  }, 900);
}

/* === PAGE 3: LIVE PRICES === */
const coinMeta = {
  bitcoin: { symbol: "BTC", name: "Bitcoin", logo: "₿" },
  ethereum: { symbol: "ETH", name: "Ethereum", logo: "Ξ" },
  solana: { symbol: "SOL", name: "Solana", logo: "◎" },
  "matic-network": { symbol: "MATIC", name: "Polygon", logo: "Ⓜ" },
  arbitrum: { symbol: "ARB", name: "Arbitrum", logo: "⬡" }
};
const priceState = { hasLoaded: false, interval: null };
const priceGrid = document.getElementById("price-grid");
const priceStatus = document.getElementById("price-status");
const refreshButton = document.getElementById("refresh-prices");
const refreshIcon = document.getElementById("refresh-icon");
const autoRefresh = document.getElementById("auto-refresh");
const lastUpdated = document.getElementById("last-updated");
const marketSummary = document.getElementById("market-summary");
const lookupInput = document.getElementById("coin-lookup");
const lookupButton = document.getElementById("lookup-btn");
const lookupResult = document.getElementById("lookup-result");
const priceEndpoint = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,matic-network,arbitrum&vs_currencies=usd&include_24hr_change=true";

function renderSkeletons() {
  priceGrid.innerHTML = Array.from({ length: 5 }, function skeleton() {
    return '<div class="skeleton" aria-label="Loading price card"></div>';
  }).join("");
}

async function fetchPrices() {
  setLoadingPrices(true);
  renderSkeletons();
  try {
    const response = await fetch(priceEndpoint);
    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }
    const data = await response.json();
    priceState.hasLoaded = true;
    renderPrices(data);
    updateMarketSummary(data);
    lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    priceStatus.textContent = "Crypto prices updated.";
  } catch (error) {
    renderPriceError(error);
  } finally {
    setLoadingPrices(false);
  }
}

function setLoadingPrices(isLoading) {
  refreshButton.disabled = isLoading;
  refreshIcon.classList.toggle("spinning", isLoading);
  priceStatus.textContent = isLoading ? "Loading crypto prices." : "";
}

function renderPrices(data) {
  priceGrid.innerHTML = Object.keys(coinMeta).map(function mapCoin(id) {
    return createPriceCard(id, data[id], coinMeta[id]);
  }).join("");
  animatePriceNumbers();
}

function createPriceCard(id, coin, meta) {
  const change = Number(coin.usd_24h_change || 0);
  const direction = change >= 0 ? "up" : "down";
  const signIcon = change >= 0 ? "▲" : "▼";
  const trend = createTrendValues(change);
  const bars = createSparkBars(trend);
  const line = createLineChart(trend, direction);
  return `
    <article class="price-card ${direction}" data-price="${coin.usd}">
      <div class="coin-head">
        <div class="coin-name"><span class="coin-logo">${meta.logo}</span><div><strong>${meta.name}</strong><br><small>${meta.symbol}</small></div></div>
        <span class="change ${direction}">${signIcon} ${change.toFixed(2)}%</span>
      </div>
      <div class="price-value" data-target="${coin.usd}">$0</div>
      <div class="sparkline" aria-label="Mini trend chart">${bars}</div>
      ${line}
    </article>
  `;
}

function createTrendValues(change) {
  const positive = change >= 0;
  return Array.from({ length: 9 }, function makeTrend(_, index) {
    const drift = positive ? index * 6 : (8 - index) * 6;
    const wave = Math.sin(index * 1.35) * 10;
    const noise = Math.random() * 12;
    return Math.max(12, Math.min(94, 28 + drift + wave + noise));
  });
}

function createSparkBars(values) {
  return values.slice(1).map(function makeBar(value) {
    const height = Math.max(24, Math.min(82, value));
    return `<span style="height:${height}px"></span>`;
  }).join("");
}

function createLineChart(values, direction) {
  const points = values.map(function mapPoint(value, index) {
    const x = 10 + index * 10;
    const y = 92 - value * .78;
    return `${x},${y.toFixed(1)}`;
  }).join(" ");
  const circles = values.map(function mapCircle(value, index) {
    const x = 10 + index * 10;
    const y = 92 - value * .78;
    return `<circle cx="${x}" cy="${y.toFixed(1)}" r="1.8"></circle>`;
  }).join("");
  return `<svg class="line-chart ${direction}" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Line chart trend"><polyline points="${points}"></polyline>${circles}</svg>`;
}

function animatePriceNumbers() {
  document.querySelectorAll(".price-value").forEach(function animatePrice(element) {
    const target = Number(element.dataset.target);
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / 800, 1);
      element.textContent = formatUsd(target * progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  });
}

function formatUsd(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 100 ? 0 : 4
  });
}

function updateMarketSummary(data) {
  const rows = Object.keys(coinMeta).map(function mapSummary(id) {
    return { id, ...coinMeta[id], price: data[id].usd, change: Number(data[id].usd_24h_change || 0) };
  });
  const leader = rows.reduce(function findLeader(best, row) { return row.price > best.price ? row : best; }, rows[0]);
  const gained = rows.reduce(function findGain(best, row) { return row.change > best.change ? row : best; }, rows[0]);
  const lost = rows.reduce(function findLoss(best, row) { return row.change < best.change ? row : best; }, rows[0]);
  marketSummary.innerHTML = `<span>Market Leader: ${leader.symbol}</span><span>Most Gained: ${gained.symbol} ${gained.change.toFixed(2)}%</span><span>Most Lost: ${lost.symbol} ${lost.change.toFixed(2)}%</span>`;
}

function renderPriceError(error) {
  priceGrid.innerHTML = `<div class="error-card"><h2>Price feed paused</h2><p>${error.message}. CoinGecko may be rate-limiting this browser. Try again in a moment.</p><button class="btn primary" id="retry-prices" type="button">Retry</button></div>`;
  document.getElementById("retry-prices").addEventListener("click", fetchPrices);
}

function handleAutoRefreshChange() {
  if (priceState.interval) {
    clearInterval(priceState.interval);
    priceState.interval = null;
  }
  if (autoRefresh.checked) {
    priceState.interval = setInterval(fetchPrices, 60000);
  }
}

async function lookupCoin() {
  const id = lookupInput.value.trim().toLowerCase();
  if (!id) {
    return;
  }
  lookupResult.innerHTML = '<div class="skeleton" aria-label="Loading lookup result"></div>';
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd&include_24hr_change=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }
    const data = await response.json();
    if (!data[id]) {
      throw new Error("Coin ID not found");
    }
    const meta = { name: id.replaceAll("-", " "), symbol: id.slice(0, 5).toUpperCase(), logo: "◆" };
    lookupResult.innerHTML = `<div class="price-grid">${createPriceCard(id, data[id], meta)}</div>`;
    animatePriceNumbers();
  } catch (error) {
    lookupResult.innerHTML = `<div class="error-card"><strong>Lookup failed.</strong><p>${error.message}. Use the exact CoinGecko coin ID.</p></div>`;
  }
}

/* === PAGE 4: BLOCK SIMULATOR === */
const blocks = {
  1: {
    data: document.getElementById("block1-data"),
    prev: document.getElementById("block1-prev"),
    nonce: document.getElementById("block1-nonce"),
    hash: document.getElementById("block1-hash"),
    preview: document.getElementById("block1-preview"),
    status: document.getElementById("block1-status"),
    progress: document.getElementById("block1-progress"),
    count: document.getElementById("block1-count"),
    card: document.getElementById("block1-card")
  },
  2: {
    data: document.getElementById("block2-data"),
    prev: document.getElementById("block2-prev"),
    nonce: document.getElementById("block2-nonce"),
    hash: document.getElementById("block2-hash"),
    preview: document.getElementById("block2-preview"),
    status: document.getElementById("block2-status"),
    progress: document.getElementById("block2-progress"),
    count: document.getElementById("block2-count"),
    card: document.getElementById("block2-card")
  }
};
const chainWarning = document.getElementById("chain-warning");
const chainArrowPanel = document.getElementById("chain-arrow-panel");
const tipGrid = document.getElementById("tip-grid");
let blockHashes = { 1: "", 2: "" };
let chainBroken = false;
let isMining = false;

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(function toHex(byte) {
    return byte.toString(16).padStart(2, "0");
  }).join("");
}

function blockMessage(block) {
  return `${block.data.value}|${block.prev.value}|${block.nonce.value}`;
}

async function updateBlockHash(blockNumber, options = {}) {
  const block = blocks[blockNumber];
  const hash = await sha256(blockMessage(block));
  blockHashes[blockNumber] = hash;
  block.hash.innerHTML = revealHash(hash);
  block.hash.classList.toggle("valid-hash", hash.startsWith("00"));
  block.preview.textContent = hash.slice(0, 8);
  if (!options.skipStatus) {
    setBlockStatus(blockNumber, hash.startsWith("00"));
  }
  if (blockNumber === 1 && !options.skipChain) {
    markChainBroken();
  }
}

function revealHash(hash) {
  return hash.split("").map(function wrapChar(char, index) {
    return `<span style="animation-delay:${index * 8}ms">${char}</span>`;
  }).join("");
}

function setBlockStatus(blockNumber, valid) {
  const block = blocks[blockNumber];
  block.status.className = `status-pill ${valid ? "valid" : "invalid"}`;
  block.status.textContent = valid ? "✓ Valid" : "✗ Invalid";
}

function setBlockBrokenStatus() {
  blocks[2].status.className = "status-pill broken";
  blocks[2].status.textContent = "✗ Chain Broken";
}

function markChainBroken() {
  chainBroken = true;
  chainWarning.hidden = false;
  chainArrowPanel.classList.add("broken");
  blocks[2].card.classList.add("chain-broken");
  blocks[2].prev.classList.add("chain-broken");
  setBlockBrokenStatus();
  setTimeout(function clearShake() {
    blocks[2].card.classList.remove("chain-broken");
  }, 500);
}

async function repairChainFromBlock1() {
  chainBroken = false;
  blocks[2].prev.value = blockHashes[1];
  blocks[2].nonce.value = "0";
  chainWarning.hidden = true;
  chainArrowPanel.classList.remove("broken");
  blocks[2].prev.classList.remove("chain-broken");
  await updateBlockHash(2);
}

async function mineBlock(blockNumber) {
  if (isMining) {
    return;
  }
  isMining = true;
  const block = blocks[blockNumber];
  let nonce = 0;
  const cap = 99999;
  block.progress.style.width = "0%";
  block.count.textContent = "Mining... nonce: 0";
  setBlockStatus(blockNumber, false);
  while (nonce <= cap) {
    block.nonce.value = String(nonce);
    const hash = await sha256(blockMessage(block));
    if (nonce % 25 === 0) {
      block.hash.textContent = hash;
      block.preview.textContent = hash.slice(0, 8);
      block.count.textContent = `Mining... nonce: ${nonce}`;
      block.progress.style.width = `${Math.min(100, (nonce / cap) * 100)}%`;
      await nextFrame();
    }
    if (hash.startsWith("00")) {
      blockHashes[blockNumber] = hash;
      block.hash.textContent = hash;
      block.hash.classList.add("valid-hash");
      block.preview.textContent = hash.slice(0, 8);
      block.progress.style.width = "100%";
      block.count.textContent = `tried ${nonce + 1} hashes`;
      setBlockStatus(blockNumber, true);
      burstConfetti(block.card);
      tipGrid.hidden = false;
      if (blockNumber === 1) {
        await repairChainFromBlock1();
      }
      isMining = false;
      return;
    }
    nonce += 1;
  }
  block.count.textContent = "No valid nonce found under 99999. Try different data.";
  isMining = false;
}

function nextFrame() {
  return new Promise(function resolveFrame(resolve) {
    requestAnimationFrame(resolve);
  });
}

function resetBlock1() {
  blocks[1].data.value = "Genesis Block";
  blocks[1].prev.value = "0000000000000000";
  blocks[1].nonce.value = "0";
  blocks[1].progress.style.width = "0%";
  blocks[1].count.textContent = "tried 0 hashes";
  initializeSimulator();
}

function resetBlock2() {
  blocks[2].data.value = "Transaction: Alice → Bob: 5 ETH";
  blocks[2].nonce.value = "0";
  blocks[2].progress.style.width = "0%";
  blocks[2].count.textContent = "tried 0 hashes";
  updateBlockHash(2);
}

function burstConfetti(originElement) {
  const rect = originElement.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + 80;
  Array.from({ length: 30 }).forEach(function createParticle(_, index) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${startX}px`;
    piece.style.top = `${startY}px`;
    piece.style.background = index % 3 === 0 ? "#00e5c8" : index % 3 === 1 ? "#7b6bff" : "#ff6b6b";
    piece.style.setProperty("--x", `${(Math.random() - .5) * 360}px`);
    piece.style.setProperty("--y", `${Math.random() * -260 - 60}px`);
    document.body.appendChild(piece);
    setTimeout(function removeParticle() {
      piece.remove();
    }, 950);
  });
}

async function initializeSimulator() {
  blocks[2].prev.value = "pending block 1 hash";
  await updateBlockHash(1, { skipChain: true });
  blocks[2].prev.value = blockHashes[1];
  await updateBlockHash(2);
  chainWarning.hidden = true;
  chainArrowPanel.classList.remove("broken");
  chainBroken = false;
}

const hashInput = document.getElementById("hash-input");
const hashOutput = document.getElementById("hash-output");
const charCount = document.getElementById("char-count");
const hashLength = document.getElementById("hash-length");

async function updateHashVisualizer() {
  const value = hashInput.value;
  charCount.textContent = `${value.length} characters`;
  if (!value) {
    hashOutput.textContent = "Hash appears here";
    hashLength.textContent = "64 chars when hashed";
    return;
  }
  const hash = await sha256(value);
  hashOutput.innerHTML = `<mark>${hash.slice(0, 2)}</mark>${hash.slice(2)}`;
  hashLength.textContent = `${hash.length} chars`;
}

function toggleExplainer() {
  const explainer = document.querySelector(".explainer");
  const button = document.getElementById("explainer-toggle");
  const isOpen = explainer.classList.toggle("open");
  button.setAttribute("aria-expanded", String(isOpen));
}

/* === EVENT BINDINGS === */
function bindEvents() {
  navRoutes.forEach(function bindRoute(button) {
    button.addEventListener("click", handleRouteClick);
  });
  mobileToggle.addEventListener("click", toggleMobileMenu);
  window.addEventListener("hashchange", handleHashChange);
  window.addEventListener("resize", resizeStars);

  conceptSearch.addEventListener("input", filterConcepts);
  filterButtons.forEach(function bindFilter(button) {
    button.addEventListener("click", handleFilterClick);
  });
  document.querySelectorAll(".expand-btn").forEach(function bindExpand(button) {
    button.addEventListener("click", handleExpandClick);
  });
  document.querySelectorAll(".share-btn").forEach(function bindShare(button) {
    button.addEventListener("click", handleShareClick);
  });

  refreshButton.addEventListener("click", fetchPrices);
  autoRefresh.addEventListener("change", handleAutoRefreshChange);
  lookupButton.addEventListener("click", lookupCoin);
  lookupInput.addEventListener("keydown", function handleLookupKey(event) {
    if (event.key === "Enter") {
      lookupCoin();
    }
  });

  document.getElementById("explainer-toggle").addEventListener("click", toggleExplainer);
  document.getElementById("mine-block1").addEventListener("click", function mineFirstBlock() { mineBlock(1); });
  document.getElementById("mine-block2").addEventListener("click", function mineSecondBlock() { mineBlock(2); });
  document.getElementById("reset-block1").addEventListener("click", resetBlock1);
  document.getElementById("reset-block2").addEventListener("click", resetBlock2);
  blocks[1].data.addEventListener("input", function handleBlock1Input() { updateBlockHash(1); });
  blocks[2].data.addEventListener("input", function handleBlock2Input() { updateBlockHash(2); });
  hashInput.addEventListener("input", updateHashVisualizer);
}

/* === APP BOOT === */
function boot() {
  bindEvents();
  resizeStars();
  animateStars();
  handleAutoRefreshChange();
  initializeSimulator();
  showPage(window.location.hash.replace("#", "") || "home", false);
}

boot();
