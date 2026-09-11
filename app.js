// ========== STATE ==========
let balance = 1.14;
let transactions = [
  {
    id: 1,
    name: "Google *temporary Hold",
    date: "5 September, 12:27 AM",
    amount: 0,
    icon: "google"
  },
  {
    id: 2,
    name: "Google *temporary Hold",
    date: "5 September, 12:26 AM",
    amount: 0,
    icon: "google"
  }
];

// ========== DOM ==========
const loadingScreen = document.getElementById("loading-screen");
const app = document.getElementById("app");
const balanceDisplay = document.getElementById("balance-display");
const transactionsList = document.getElementById("transactions-list");

const balanceModal = document.getElementById("balance-modal");
const expenseModal = document.getElementById("expense-modal");
const customisePanel = document.getElementById("customise-panel");

// ========== LOADING ==========
window.addEventListener("load", () => {
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
      app.classList.remove("hidden");
    }, 500);
  }, 1800);
});

// ========== RENDER ==========
function formatMoney(amount) {
  return amount.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " €";
}

function renderBalance() {
  balanceDisplay.textContent = formatMoney(balance);
}

function getGoogleIcon() {
  return `<svg viewBox="0 0 24 24" width="26" height="26">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>`;
}

function getGenericIcon(name) {
  const colors = ["#7b2ff7", "#00d4ff", "#ff2d95", "#f7c948", "#34A853"];
  const color = colors[name.length % colors.length];
  const letter = name.charAt(0).toUpperCase();
  return `<div style="width:100%;height:100%;background:${color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:18px;">${letter}</div>`;
}

function renderTransactions() {
  transactionsList.innerHTML = transactions.map(tx => `
    <div class="transaction">
      <div class="tx-icon ${tx.icon === 'google' ? 'google' : ''}">
        ${tx.icon === 'google' ? getGoogleIcon() : getGenericIcon(tx.name)}
      </div>
      <div class="tx-details">
        <div class="tx-name">${tx.name}</div>
        <div class="tx-date">${tx.date}</div>
      </div>
      <div class="tx-amount">${formatMoney(tx.amount)}</div>
    </div>
  `).join("");
}

function init() {
  // Load from localStorage if available
  const saved = localStorage.getItem("revolut-clone-data");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      balance = data.balance ?? 1.14;
      transactions = data.transactions ?? transactions;
    } catch (e) {}
  }
  renderBalance();
  renderTransactions();
}

function save() {
  localStorage.setItem("revolut-clone-data", JSON.stringify({ balance, transactions }));
}

// ========== EVENTS ==========
document.getElementById("edit-balance-btn").addEventListener("click", () => {
  document.getElementById("balance-input").value = balance;
  balanceModal.classList.remove("hidden");
});

document.getElementById("cancel-balance").addEventListener("click", () => {
  balanceModal.classList.add("hidden");
});

document.getElementById("save-balance").addEventListener("click", () => {
  const val = parseFloat(document.getElementById("balance-input").value);
  if (!isNaN(val)) {
    balance = val;
    renderBalance();
    save();
  }
  balanceModal.classList.add("hidden");
});

document.getElementById("customise-btn").addEventListener("click", () => {
  customisePanel.classList.remove("hidden");
});

document.getElementById("close-customise").addEventListener("click", () => {
  customisePanel.classList.add("hidden");
});

document.getElementById("edit-balance-from-panel").addEventListener("click", () => {
  customisePanel.classList.add("hidden");
  document.getElementById("balance-input").value = balance;
  balanceModal.classList.remove("hidden");
});

document.getElementById("add-expense-btn").addEventListener("click", () => {
  customisePanel.classList.add("hidden");
  document.getElementById("expense-name").value = "";
  document.getElementById("expense-amount").value = "";
  expenseModal.classList.remove("hidden");
});

document.getElementById("cancel-expense").addEventListener("click", () => {
  expenseModal.classList.add("hidden");
});

document.getElementById("save-expense").addEventListener("click", () => {
  const name = document.getElementById("expense-name").value.trim();
  const amount = parseFloat(document.getElementById("expense-amount").value);
  if (name && !isNaN(amount)) {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "long" }) +
      ", " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    transactions.unshift({
      id: Date.now(),
      name: name,
      date: dateStr,
      amount: -Math.abs(amount), // expenses are negative
      icon: "custom"
    });

    // Optionally subtract from balance
    balance -= Math.abs(amount);
    renderBalance();
    renderTransactions();
    save();
  }
  expenseModal.classList.add("hidden");
});

// Close modals on backdrop click
[balanceModal, expenseModal, customisePanel].forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
  });
});

// Prevent zoom on double tap etc.
document.addEventListener("gesturestart", e => e.preventDefault());

init();

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
