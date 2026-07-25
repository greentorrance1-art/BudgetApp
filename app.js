// Firebase will be loaded via CDN in index.html
// Firebase variables will be initialized after Firebase loads

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let incomeChart = null;
let expenseChart = null;
let yearChart = null;
let useFirebaseSync = false;
let isAppInitialized = false;

const STORAGE_KEY = 'homeBudgetData';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Firebase config and initialization
const firebaseConfig = {
    apiKey: "AIzaSyAwklkbyuiuHaMGpU8pJ5DsWi33i44Ljv4",
    authDomain: "production-mode-290db.firebaseapp.com",
    projectId: "production-mode-290db",
    storageBucket: "production-mode-290db.firebasestorage.app",
    messagingSenderId: "365690860963",
    appId: "1:365690860963:web:84ad0e1731fd3aa4ccd616",
    measurementId: "G-G5HK6VM4L0"
};

let auth, db;
let unsubscribe = null;
let isSyncing = false;
let lastSyncedDataJSON = null;

function initFirebase() {
    console.log('[Firebase] Initializing from:', location.origin);
    const app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
}

async function loadFromFirestore() {
    try {
        console.log('[Firestore] Loading from: households/my-household/data/main');
        const docRef = db.collection('households').doc('my-household').collection('data').doc('main');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            if (data && data.homeBudgetData) {
                console.log('[Firestore] Data loaded successfully');
                return data.homeBudgetData;
            }
        }
        console.log('[Firestore] No data found in Firestore');
        return null;
    } catch (error) {
        console.error('[Firestore] Error loading:', error.code, error.message);
        return null;
    }
}

async function saveToFirestore(data) {
    if (isSyncing) {
        console.log('[Firestore] Skipping save (sync in progress)');
        return;
    }

    try {
        console.log('[Firestore] Saving to: households/my-household/data/main');
        const docRef = db.collection('households').doc('my-household').collection('data').doc('main');
        lastSyncedDataJSON = JSON.stringify(data);
        await docRef.set({
            homeBudgetData: data
        }, { merge: true });
        console.log('[Firestore] Save complete');
    } catch (error) {
        console.error('[Firestore] Error saving:', error.code, error.message);
    }
}

function subscribeToFirestore(callback) {
    console.log('[Firestore] Starting real-time listener');
    const docRef = db.collection('households').doc('my-household').collection('data').doc('main');

    unsubscribe = docRef.onSnapshot((docSnap) => {
        // Skip the local (optimistic) echo of our own writes — Firestore fires the
        // listener immediately on save, before the server confirms, which was
        // triggering a full table re-render (and stealing input focus) on every keystroke pause.
        if (docSnap.metadata.hasPendingWrites) return;
        if (docSnap.exists) {
            const data = docSnap.data();
            if (data && data.homeBudgetData) {
                const incomingJSON = JSON.stringify(data.homeBudgetData);
                // Also skip the server's acknowledgement of our own write (same data we just sent).
                if (incomingJSON === lastSyncedDataJSON) return;
                console.log('[Firestore] Real-time update received');
                isSyncing = true;
                callback(data.homeBudgetData);
                setTimeout(() => {
                    isSyncing = false;
                }, 100);
            }
        }
    }, (error) => {
        console.error('[Firestore] Listener error:', error.code, error.message);
    });
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

function generateUniqueColors(count, existingColors = []) {
    const colors = [];
    const existingHues = existingColors.map(color => {
        const match = color.match(/hsl\((\d+)/);
        return match ? parseInt(match[1]) : null;
    }).filter(h => h !== null);

    for (let i = 0; i < count; i++) {
        let color;
        let attempts = 0;
        do {
            color = generateRandomColor();
            const hue = parseInt(color.match(/hsl\((\d+)/)[1]);
            const tooClose = existingHues.some(h => Math.abs(h - hue) < 30);
            if (!tooClose) {
                existingHues.push(hue);
                break;
            }
            attempts++;
        } while (attempts < 50);
        colors.push(color);
    }
    return colors;
}

async function loadData() {
    if (useFirebaseSync) {
        const firestoreData = await loadFromFirestore();

        if (firestoreData) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreData));
            return firestoreData;
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const localData = JSON.parse(stored);
                await saveToFirestore(localData);
                return localData;
            } catch (e) {
                console.error('[App] Error parsing stored data:', e);
                const defaultData = getDefaultData();
                await saveToFirestore(defaultData);
                return defaultData;
            }
        }

        const defaultData = getDefaultData();
        await saveToFirestore(defaultData);
        return defaultData;
    } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing stored data:', e);
                return getDefaultData();
            }
        }
        return getDefaultData();
    }
}

function getDefaultData() {
    const data = {
        theme: 'light',
        years: {},
        savingsGoals: [],
        autopilotLabels: {}
    };

    const sampleIncome = [
        { id: generateUniqueId(), description: 'Salary', estimated: 5000, actual: 5000, hisAmount: 5000, herAmount: 0 },
        { id: generateUniqueId(), description: 'Side Income', estimated: 800, actual: 750, hisAmount: 800, herAmount: 0 }
    ];

    const sampleExpenses = [
        { id: generateUniqueId(), description: 'Rent', estimated: 1500, actual: 1500, hisAmount: 750, herAmount: 750, fixed: true },
        { id: generateUniqueId(), description: 'Food', estimated: 600, actual: 650, hisAmount: 300, herAmount: 300, fixed: false },
        { id: generateUniqueId(), description: 'Utilities', estimated: 200, actual: 180, hisAmount: 100, herAmount: 100, fixed: true },
        { id: generateUniqueId(), description: 'Transportation', estimated: 300, actual: 320, hisAmount: 300, herAmount: 0, fixed: false },
        { id: generateUniqueId(), description: 'Subscriptions', estimated: 100, actual: 95, hisAmount: 50, herAmount: 50, fixed: true }
    ];

    const incomeColors = generateUniqueColors(sampleIncome.length);
    const expenseColors = generateUniqueColors(sampleExpenses.length);

    data.years[currentYear] = {};
    for (let m = 0; m < 12; m++) {
        data.years[currentYear][m] = {
            income: m === currentMonth ? JSON.parse(JSON.stringify(sampleIncome)) : [],
            expenses: m === currentMonth ? JSON.parse(JSON.stringify(sampleExpenses)) : [],
            incomeColors: m === currentMonth ? incomeColors : [],
            expenseColors: m === currentMonth ? expenseColors : []
        };
    }

    return data;
}

async function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (useFirebaseSync) {
        await saveToFirestore(data);
    }
}

function getCurrentMonthData(data) {
    if (!data || !data.years) {
        console.error('[App] Invalid data object:', data);
        return { income: [], expenses: [], incomeColors: [], expenseColors: [] };
    }
    if (!data.years[currentYear]) data.years[currentYear] = {};

    if (!data.years[currentYear][currentMonth]) {
        // New month — carry forward only expenses marked Fixed (F) from the most recent
        // previous month (not from anywhere in history), so a deletion in one month can't
        // cause the same expense to reappear in a later month.
        let carryExpenses = [];
        let carryColors = [];
        searchLoop:
        for (let searchYear = currentYear; searchYear >= currentYear - 5; searchYear--) {
            if (!data.years[searchYear]) continue;
            const startMonth = (searchYear === currentYear) ? currentMonth - 1 : 11;
            for (let m = startMonth; m >= 0; m--) {
                const md = data.years[searchYear][m];
                if (md && md.expenses && md.expenses.length > 0) {
                    const fixedExpenses = md.expenses
                        .map((e, i) => ({ e, i }))
                        .filter(pair => pair.e.fixed);
                    carryExpenses = fixedExpenses.map(pair => Object.assign({}, pair.e)); // copy, preserving id
                    const srcColors = md.expenseColors || [];
                    carryColors = fixedExpenses.map(pair => srcColors[pair.i]).filter(c => c);
                    break searchLoop;
                }
            }
        }

        data.years[currentYear][currentMonth] = {
            income: [], // user enters income fresh each month
            expenses: carryExpenses,
            incomeColors: [],
            expenseColors: carryColors.length === carryExpenses.length
                ? carryColors
                : generateUniqueColors(carryExpenses.length)
        };
    }
    return data.years[currentYear][currentMonth];
}

function formatCurrency(value) {
    return '$' + parseFloat(value || 0).toFixed(2);
}

function parseNumber(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

function renderIncomeTable(data) {
    try {
        const monthData = getCurrentMonthData(data);
        const tbody = document.getElementById('incomeTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        monthData.income.forEach((item, index) => {
            const row = document.createElement('tr');
            // hisAmount/herAmount are the split fields; estimated = his, actual = her for display
            // Combined total shown as Difference column
            const his = parseNumber(item.hisAmount !== undefined ? item.hisAmount : item.estimated);
            const her = parseNumber(item.herAmount !== undefined ? item.herAmount : item.actual);
            const combined = his + her;
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" value="${item.description}" data-id="${item.id}" data-field="description" data-type="income"></td>
                <td><input type="number" step="0.01" value="${his}" data-id="${item.id}" data-field="hisAmount" data-type="income" placeholder="His"></td>
                <td><input type="number" step="0.01" value="${her}" data-id="${item.id}" data-field="herAmount" data-type="income" placeholder="Her"></td>
                <td class="positive">${formatCurrency(combined)}</td>
                <td><button class="delete-btn" data-id="${item.id}" data-type="income">🗑️</button></td>
            `;
            tbody.appendChild(row);
        });
        updateTotals(data);
    } catch(e) { console.warn('[renderIncomeTable] error:', e.message); }
}

function renderExpenseTable(data) {
    try {
        const monthData = getCurrentMonthData(data);
        const tbody = document.getElementById('expenseTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        monthData.expenses.forEach((item, index) => {
            const row = document.createElement('tr');
            const his = parseNumber(item.hisAmount !== undefined ? item.hisAmount : item.estimated);
            const her = parseNumber(item.herAmount !== undefined ? item.herAmount : 0);
            const combined = his + her;
            row.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" value="${item.description}" data-id="${item.id}" data-field="description" data-type="expense"></td>
                <td><input type="number" step="0.01" value="${his}" data-id="${item.id}" data-field="hisAmount" data-type="expense" placeholder="His"></td>
                <td><input type="number" step="0.01" value="${her}" data-id="${item.id}" data-field="herAmount" data-type="expense" placeholder="Her"></td>
                <td class="positive">${formatCurrency(combined)}</td>
                <td style="text-align:center;"><input type="checkbox" class="fixed-checkbox" data-id="${item.id}" title="Fixed — auto-carries to next month" ${item.fixed ? 'checked' : ''}></td>
                <td><button class="delete-btn" data-id="${item.id}" data-type="expense">🗑️</button></td>
            `;
            tbody.appendChild(row);
        });
        updateTotals(data);
        updateFixedBillsTotal(data);
    } catch(e) { console.warn('[renderExpenseTable] error:', e.message); }
}

function calcHis(item) { return parseNumber(item.hisAmount !== undefined ? item.hisAmount : item.estimated); }
function calcHer(item) { return parseNumber(item.herAmount !== undefined ? item.herAmount : 0); }

// ─── FIXED (F) EXPENSES ────────────────────────────────────────────────────────
function computeFixedBillsTotal(data) {
    const monthData = getCurrentMonthData(data);
    return monthData.expenses.filter(e => e.fixed).reduce((s, e) => s + calcHis(e) + calcHer(e), 0);
}

function updateFixedBillsTotal(data) {
    try {
        const total = computeFixedBillsTotal(data);
        const el = document.getElementById('ap-fixed-bills');
        if (el) el.value = total.toFixed(2);
        renderAutopilot();
    } catch(e) { console.warn('[FixedBills] error:', e.message); }
}

// ─── SAVINGS GOALS ──────────────────────────────────────────────────────────────
function renderSavingsGoals(data) {
    try {
        if (!data.savingsGoals) data.savingsGoals = [];
        const container = document.getElementById('savingsGoalsList');
        if (!container) return;
        container.innerHTML = '';
        data.savingsGoals.forEach(goal => {
            const row = document.createElement('div');
            row.className = 'goal-item';
            row.innerHTML = `
                <input type="text" class="field-input goal-name-input" value="${goal.name || ''}" placeholder="Goal name" data-id="${goal.id}" data-field="name" data-type="goal">
                <div class="goal-amount-wrap">
                    <span class="sav-dollar">$</span>
                    <input type="number" class="field-input goal-amount-input" value="${parseNumber(goal.amount)}" step="0.01" data-id="${goal.id}" data-field="amount" data-type="goal">
                </div>
                <button class="delete-btn" data-id="${goal.id}" data-type="goal">🗑️</button>
            `;
            container.appendChild(row);
        });
        updateSavingsGoalsTotal(data);
    } catch(e) { console.warn('[renderSavingsGoals] error:', e.message); }
}

function updateSavingsGoalsTotal(data) {
    try {
        const total = (data.savingsGoals || []).reduce((s, g) => s + parseNumber(g.amount), 0);
        const el = document.getElementById('goalsGrandTotal');
        if (el) el.textContent = formatCurrency(total);
        updateOverview(data);
    } catch(e) { console.warn('[SavingsGoalsTotal] error:', e.message); }
}

// ─── PAYCHECK AUTOPILOT — EDITABLE CATEGORY LABELS ─────────────────────────────
function renderAutopilotLabels(data) {
    try {
        const labels = data.autopilotLabels || {};
        document.querySelectorAll('.ac-label-input').forEach(inp => {
            const key = inp.dataset.key;
            if (key && labels[key] !== undefined) inp.value = labels[key];
        });
    } catch(e) { console.warn('[AutopilotLabels] error:', e.message); }
}

// ─── CREDIT CARD TRACKER ────────────────────────────────────────────────────────
function renderCreditCard() {
    try {
        const g = id => document.getElementById(id);
        const limit      = parseFloat(g('ccLimit')          && g('ccLimit').value)          || 0;
        const balance     = Math.max(0, parseFloat(g('ccBalance') && g('ccBalance').value)   || 0);
        const minPmt      = parseFloat(g('ccMinPayment')     && g('ccMinPayment').value)     || 0;
        const targetPmt   = parseFloat(g('ccTargetPayment')  && g('ccTargetPayment').value)  || 0;
        const extraPmt    = parseFloat(g('ccExtraPayment')   && g('ccExtraPayment').value)   || 0;

        const set = (id, val) => { const el = g(id); if (el) el.textContent = val; };

        set('cc-remaining', formatCurrency(balance));

        // Simple straight-line payoff estimate (no APR modeled for the credit card tracker)
        const totalMonthlyPmt = targetPmt + extraPmt;
        const monthsMin   = (balance > 0 && minPmt > 0)          ? Math.ceil(balance / minPmt)         : 0;
        const monthsExtra = (balance > 0 && totalMonthlyPmt > 0) ? Math.ceil(balance / totalMonthlyPmt) : 0;

        set('cc-monthsMin',   balance <= 0 ? '0 mo' : (monthsMin   > 0 ? monthsMin   + ' mo' : '—'));
        set('cc-monthsExtra', balance <= 0 ? '0 mo' : (monthsExtra > 0 ? monthsExtra + ' mo' : '—'));

        if (balance <= 0) {
            set('cc-payoffDate', 'Paid off 🎉');
        } else if (monthsExtra > 0) {
            const payoffDate = new Date();
            payoffDate.setMonth(payoffDate.getMonth() + monthsExtra);
            set('cc-payoffDate', payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        } else {
            set('cc-payoffDate', '—');
        }

        // Progress = share of the credit limit currently free (rises as balance is paid down)
        const progressPct = limit > 0 ? Math.max(0, Math.min(100, ((limit - balance) / limit) * 100)) : 0;
        const fill = g('cc-progress-fill');
        if (fill) fill.style.width = progressPct.toFixed(1) + '%';

        // Utilization
        const utilPct = limit > 0 ? (balance / limit) * 100 : 0;
        set('cc-utilPercent', utilPct.toFixed(1) + '%');
        const badge = g('cc-utilBadge');
        if (badge) {
            if (utilPct < 10)      { badge.textContent = '🟢 Excellent'; badge.className = 'cc-util-badge cc-util-good'; }
            else if (utilPct < 30) { badge.textContent = '🟡 Good';      badge.className = 'cc-util-badge cc-util-watch'; }
            else                   { badge.textContent = '🔴 High';      badge.className = 'cc-util-badge cc-util-high'; }
        }

        set('cc-target10', formatCurrency(limit * 0.10));
        set('cc-target5',  formatCurrency(limit * 0.05));
        set('cc-target2',  formatCurrency(limit * 0.02));
    } catch(e) { console.warn('[CreditCard] render error:', e.message); }
}
function calcCombined(item) { return calcHis(item) + calcHer(item); }

function updateTotals(data) {
    try {
        const monthData = getCurrentMonthData(data);
        // Combined totals (His + Her) used for all summary displays
        const incomeHisTotal  = monthData.income.reduce((s, i) => s + calcHis(i), 0);
        const incomeHerTotal  = monthData.income.reduce((s, i) => s + calcHer(i), 0);
        const incomeTotalComb = incomeHisTotal + incomeHerTotal;

        const expenseHisTotal  = monthData.expenses.reduce((s, i) => s + calcHis(i), 0);
        const expenseHerTotal  = monthData.expenses.reduce((s, i) => s + calcHer(i), 0);
        const expenseTotalComb = expenseHisTotal + expenseHerTotal;

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        const cls = (id, c) => { const el = document.getElementById(id); if (el) el.className = c; };

        // Income table footer: Est=His, Act=Her, Diff=Combined
        set('totalIncomeEst',   formatCurrency(incomeHisTotal));
        set('totalIncomeAct',   formatCurrency(incomeHerTotal));
        set('totalIncomeDiff',  formatCurrency(incomeTotalComb));
        cls('totalIncomeDiff',  'positive');

        // Expense table footer: Est=His, Act=Her, Diff=Combined
        set('totalExpenseEst',  formatCurrency(expenseHisTotal));
        set('totalExpenseAct',  formatCurrency(expenseHerTotal));
        set('totalExpenseDiff', formatCurrency(expenseTotalComb));
        cls('totalExpenseDiff', 'positive');

        updateOverview(data);
    } catch(e) { console.warn('[updateTotals] error:', e.message); }
}

function updateOverview(data) {
    try {
        const monthData = getCurrentMonthData(data);

        // Use combined His+Her for all overview metrics
        const incomeEstTotal  = monthData.income.reduce((s, i) => s + calcHis(i), 0);
        const incomeActTotal  = monthData.income.reduce((s, i) => s + calcHer(i), 0);
        const incomeTotalComb = incomeEstTotal + incomeActTotal;
        const incomeDiffTotal = incomeTotalComb;

        const expenseEstTotal  = monthData.expenses.reduce((s, i) => s + calcHis(i), 0);
        const expenseActTotal  = monthData.expenses.reduce((s, i) => s + calcHer(i), 0);
        const expenseTotalComb = expenseEstTotal + expenseActTotal;
        const expenseDiffTotal = expenseTotalComb;

        const savingsEst = incomeTotalComb - expenseTotalComb;

        // Total Savings (Actual) is the sum of all Savings Goals — not leftover income minus
        // expenses. Savings is tracked manually per goal, independent of the monthly budget.
        const realSavingsAct = (data.savingsGoals || []).reduce((s, g) => s + parseNumber(g.amount), 0);

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        const cls = (id, c)   => { const el = document.getElementById(id); if (el) el.className = c; };

        set('overviewIncomeEst',    formatCurrency(incomeEstTotal));
        set('overviewIncomeAct',    formatCurrency(incomeActTotal));
        set('overviewIncomeDiff',   formatCurrency(incomeDiffTotal));
        cls('overviewIncomeDiff',   'metric-value ' + (incomeDiffTotal >= 0 ? 'positive' : 'negative'));

        set('overviewExpensesEst',  formatCurrency(expenseEstTotal));
        set('overviewExpensesAct',  formatCurrency(expenseActTotal));
        set('overviewExpensesDiff', formatCurrency(expenseDiffTotal));
        cls('overviewExpensesDiff', 'metric-value ' + (expenseDiffTotal <= 0 ? 'positive' : 'negative'));

        set('overviewSavingsEst',   formatCurrency(savingsEst));
        set('overviewSavingsAct',   formatCurrency(realSavingsAct));
        set('overviewSavingsDiff',  formatCurrency(realSavingsAct - savingsEst));
        cls('overviewSavingsDiff',  'metric-value ' + ((realSavingsAct - savingsEst) >= 0 ? 'positive' : 'negative'));

        const savingsRateEst = incomeEstTotal > 0 ? (savingsEst / incomeEstTotal * 100) : 0;
        const savingsRateAct = incomeActTotal > 0 ? (realSavingsAct / incomeActTotal * 100) : 0;

        set('savingsRateEst', savingsRateEst.toFixed(1) + '%');
        set('savingsRateAct', savingsRateAct.toFixed(1) + '%');

        const badge = document.getElementById('savingsHealthBadge');
        if (badge) {
            badge.className = 'badge';
            if (savingsRateAct >= 20)     { badge.textContent = 'Good';  badge.classList.add('good'); }
            else if (savingsRateAct >= 10){ badge.textContent = 'Watch'; badge.classList.add('watch'); }
            else                          { badge.textContent = 'Risk';  badge.classList.add('risk'); }
        }
    } catch(e) { console.warn('[updateOverview] error:', e.message); }
}

function renderIncomeChart(data, type = 'actual') {
    try {
        const monthData = getCurrentMonthData(data);
        const canvas = document.getElementById('incomeChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (incomeChart) incomeChart.destroy();
        const labels = monthData.income.map(item => item.description || 'Unnamed');
        const values = monthData.income.map(item => parseNumber(item[type]));
        const colors = monthData.incomeColors;
        const total  = values.reduce((s, v) => s + v, 0);
        incomeChart = new Chart(ctx, {
            type: 'pie',
            data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary') }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: {
                legend: { position: 'bottom', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'), padding: 10, font: { size: 11 } } },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.parsed)} (${total > 0 ? (ctx.parsed/total*100).toFixed(1) : 0}%)` } }
            }}
        });
    } catch(e) { console.warn('[renderIncomeChart] error:', e.message); }
}

function renderExpenseChart(data, type = 'actual') {
    try {
        const monthData = getCurrentMonthData(data);
        const canvas = document.getElementById('expenseChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (expenseChart) expenseChart.destroy();
        const labels = monthData.expenses.map(item => item.description || 'Unnamed');
        const values = monthData.expenses.map(item => parseNumber(item[type]));
        const colors = monthData.expenseColors;
        const total  = values.reduce((s, v) => s + v, 0);
        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary') }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: {
                legend: { position: 'bottom', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'), padding: 10, font: { size: 11 } } },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.parsed)} (${total > 0 ? (ctx.parsed/total*100).toFixed(1) : 0}%)` } }
            }}
        });
    } catch(e) { console.warn('[renderExpenseChart] error:', e.message); }
}

function renderYearSummary(data) {
    try {
        const tbody = document.getElementById('summaryTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!data.years[currentYear]) data.years[currentYear] = {};
        for (let m = 0; m < 12; m++) {
            const monthData = data.years[currentYear][m] || { income: [], expenses: [] };
            const incomeEst  = monthData.income.reduce((s, i) => s + parseNumber(i.estimated), 0);
            const incomeAct  = monthData.income.reduce((s, i) => s + parseNumber(i.actual), 0);
            const incomeDiff = incomeAct - incomeEst;
            const expenseEst  = monthData.expenses.reduce((s, i) => s + parseNumber(i.estimated), 0);
            const expenseAct  = monthData.expenses.reduce((s, i) => s + parseNumber(i.actual), 0);
            const expenseDiff = expenseAct - expenseEst;
            const savingsEst  = incomeEst - expenseEst;
            const savingsAct  = incomeAct - expenseAct;
            const savingsDiff = savingsAct - savingsEst;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${MONTHS[m]}</strong></td>
                <td>${formatCurrency(incomeEst)}</td><td>${formatCurrency(incomeAct)}</td>
                <td class="${incomeDiff >= 0 ? 'positive' : 'negative'}">${formatCurrency(incomeDiff)}</td>
                <td>${formatCurrency(expenseEst)}</td><td>${formatCurrency(expenseAct)}</td>
                <td class="${expenseDiff <= 0 ? 'positive' : 'negative'}">${formatCurrency(expenseDiff)}</td>
                <td>${formatCurrency(savingsEst)}</td><td>${formatCurrency(savingsAct)}</td>
                <td class="${savingsDiff >= 0 ? 'positive' : 'negative'}">${formatCurrency(savingsDiff)}</td>
            `;
            tbody.appendChild(row);
        }
        renderYearChart(data);
    } catch(e) { console.warn('[renderYearSummary] error:', e.message); }
}

function renderYearChart(data) {
    try {
        const canvas = document.getElementById('yearChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (yearChart) yearChart.destroy();
        if (!data.years[currentYear]) data.years[currentYear] = {};
        const estimatedSavings = [], actualSavings = [];
        for (let m = 0; m < 12; m++) {
            const md = data.years[currentYear][m] || { income: [], expenses: [] };
            const iE = md.income.reduce((s,i)=>s+parseNumber(i.estimated),0);
            const iA = md.income.reduce((s,i)=>s+parseNumber(i.actual),0);
            const eE = md.expenses.reduce((s,i)=>s+parseNumber(i.estimated),0);
            const eA = md.expenses.reduce((s,i)=>s+parseNumber(i.actual),0);
            estimatedSavings.push(iE - eE);
            actualSavings.push(iA - eA);
        }
        yearChart = new Chart(ctx, {
            type: 'line',
            data: { labels: MONTHS, datasets: [
                { label: 'Estimated Savings', data: estimatedSavings, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 2, tension: 0.3, fill: true },
                { label: 'Actual Savings',    data: actualSavings,    borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)',  borderWidth: 2, tension: 0.3, fill: true }
            ]},
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'), padding: 15, font: { size: 12 } } },
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}` } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'), callback: v => formatCurrency(v) }, grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-color') } },
                    x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') }, grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-color') } }
                }
            }
        });
    } catch(e) { console.warn('[renderYearChart] error:', e.message); }
}

function initializeYearSelector() {
    const yearSelector = document.getElementById('yearSelector');
    const startYear = 2020;
    const endYear = currentYear + 5;

    for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearSelector.appendChild(option);
    }
}

function renderColorSettings(data) {
    const monthData = getCurrentMonthData(data);

    const incomeList = document.getElementById('incomeColorsList');
    incomeList.innerHTML = '<h4>Income Colors</h4>';
    monthData.income.forEach((item, index) => {
        const colorItem = document.createElement('div');
        colorItem.className = 'color-item';
        colorItem.innerHTML = `
            <span>${item.description || 'Unnamed'}</span>
            <input type="color" value="${monthData.incomeColors[index]}" data-type="income" data-index="${index}">
        `;
        incomeList.appendChild(colorItem);
    });

    const expenseList = document.getElementById('expenseColorsList');
    expenseList.innerHTML = '<h4>Expense Colors</h4>';
    monthData.expenses.forEach((item, index) => {
        const colorItem = document.createElement('div');
        colorItem.className = 'color-item';
        colorItem.innerHTML = `
            <span>${item.description || 'Unnamed'}</span>
            <input type="color" value="${monthData.expenseColors[index]}" data-type="expense" data-index="${index}">
        `;
        expenseList.appendChild(colorItem);
    });
}

function setupEventListeners() {
    const on = (id, event, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, fn);
        else console.warn('[Setup] Missing element:', id);
    };

    on('monthSelector', 'change', async (e) => {
        const data = await loadData();
        saveSavingsData(data);
        await saveData(data);
        currentMonth = parseInt(e.target.value);
        renderAll(data);
    });

    on('yearSelector', 'change', async (e) => {
        const data = await loadData();
        saveSavingsData(data);
        await saveData(data);
        currentYear = parseInt(e.target.value);
        renderAll(data);
    });

    on('themeToggle', 'click', async () => {
        const data = await loadData();
        data.theme = data.theme === 'light' ? 'dark' : 'light';
        applyTheme(data.theme);
        await saveData(data);
    });

    on('settingsBtn', 'click', async () => {
        const data = await loadData();
        renderColorSettings(data);
        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'block';
    });

    on('closeSettings', 'click', () => {
        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('settingsModal');
        if (modal && e.target === modal) modal.style.display = 'none';
    });

    on('addIncomeBtn', 'click', async () => {
        const data = await loadData();
        const monthData = getCurrentMonthData(data);
        monthData.income.push({ id: generateUniqueId(), description: '', estimated: 0, actual: 0, hisAmount: 0, herAmount: 0 });
        monthData.incomeColors.push(generateUniqueColors(1, monthData.incomeColors)[0]);
        await saveData(data);
        renderIncomeTable(data);
        renderIncomeChart(data, getCurrentChartType('income'));
    });

    on('addExpenseBtn', 'click', async () => {
        const data = await loadData();
        const monthData = getCurrentMonthData(data);
        const newExpense = { id: generateUniqueId(), description: '', estimated: 0, actual: 0, hisAmount: 0, herAmount: 0, fixed: false };
        monthData.expenses.push(newExpense);
        monthData.expenseColors.push(generateUniqueColors(1, monthData.expenseColors)[0]);
        await saveData(data);
        renderExpenseTable(data);
        renderExpenseChart(data, getCurrentChartType('expense'));
    });

    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            const type = e.target.dataset.type;
            const data = await loadData();

            if (type === 'goal') {
                if (!data.savingsGoals) data.savingsGoals = [];
                const index = data.savingsGoals.findIndex(g => g.id === id);
                if (index !== -1) data.savingsGoals.splice(index, 1);
                await saveData(data);
                renderSavingsGoals(data);
                return;
            }

            const monthData = getCurrentMonthData(data);
            if (type === 'income') {
                const index = monthData.income.findIndex(item => item.id === id);
                if (index !== -1) { monthData.income.splice(index, 1); monthData.incomeColors.splice(index, 1); }
                await saveData(data);
                renderIncomeTable(data);
                renderIncomeChart(data, getCurrentChartType('income'));
            } else {
                // For expenses: only remove from THIS month. Fixed expenses stay in other months.
                const index = monthData.expenses.findIndex(item => item.id === id);
                if (index !== -1) {
                    monthData.expenses.splice(index, 1);
                    monthData.expenseColors.splice(index, 1);
                    // Each month has its own copy, so deleting here doesn't touch other months.
                }
                await saveData(data);
                renderExpenseTable(data);
                renderExpenseChart(data, getCurrentChartType('expense'));
                updateFixedBillsTotal(data);
            }
            renderYearSummary(data);
        }
    });

    // Input handler with debounce to fix focus/re-render bug
    let _inputDebounceTimer = null;
    let _goalDebounceTimer = null;
    document.addEventListener('input', (e) => {
        // Color pickers handle immediately
        if (e.target.type === 'color') {
            (async () => {
                const type = e.target.dataset.type;
                const index = parseInt(e.target.dataset.index);
                const color = e.target.value;
                const data = await loadData();
                const monthData = getCurrentMonthData(data);
                if (type === 'income') { monthData.incomeColors[index] = color; renderIncomeChart(data, getCurrentChartType('income')); }
                else { monthData.expenseColors[index] = color; renderExpenseChart(data, getCurrentChartType('expense')); }
                await saveData(data);
            })();
            return;
        }

        // Savings goal name/amount fields — update the live total without rebuilding the list
        // (rebuilding on every keystroke is what causes inputs to lose focus while typing).
        if (e.target.tagName === 'INPUT' && e.target.dataset.type === 'goal') {
            const el = e.target;
            const id = el.dataset.id;
            const field = el.dataset.field;
            const value = el.value;
            (async () => {
                const data = await loadData();
                if (!data.savingsGoals) data.savingsGoals = [];
                const item = data.savingsGoals.find(g => g.id === id);
                if (!item) return;
                item[field] = field === 'name' ? value : parseNumber(value);
                updateSavingsGoalsTotal(data);
                clearTimeout(_goalDebounceTimer);
                _goalDebounceTimer = setTimeout(async () => {
                    await saveData(data);
                }, 400);
            })();
            return;
        }

        // Fixed (F) expense checkbox — must be checked before the generic dataset.id
        // handler below, since the checkbox also carries data-id but no data-field.
        if (e.target.type === 'checkbox' && e.target.classList.contains('fixed-checkbox')) {
            (async () => {
                const id = e.target.dataset.id;
                const checked = e.target.checked;
                const data = await loadData();
                const monthData = getCurrentMonthData(data);
                const item = monthData.expenses.find(x => x.id === id);
                if (!item) return;
                item.fixed = checked;
                await saveData(data);
                updateFixedBillsTotal(data);
            })();
            return;
        }

        if (e.target.tagName === 'INPUT' && e.target.dataset.id) {
            const el = e.target;
            const id = el.dataset.id;
            const field = el.dataset.field;
            const type = el.dataset.type;
            const value = el.value;

            // Update in-memory immediately so totals stay live
            (async () => {
                const data = await loadData();
                const monthData = getCurrentMonthData(data);
                const array = type === 'income' ? monthData.income : monthData.expenses;
                const item = array.find(item => item.id === id);
                if (!item) return;

                // Write value to memory
                if (field === 'hisAmount' || field === 'herAmount') {
                    item[field] = parseNumber(value);
                    // Keep estimated/actual in sync as combined total
                    item.estimated = parseNumber(item.hisAmount || 0) + parseNumber(item.herAmount || 0);
                    item.actual    = item.estimated;
                } else {
                    item[field] = field === 'description' ? value : parseNumber(value);
                }

                // Update totals display immediately (no re-render = no focus loss)
                updateTotals(data);
                renderCombinedSummary(data);
                if (type === 'expense' && item.fixed) updateFixedBillsTotal(data);

                // Debounce the heavy operations (chart + save) by 400ms
                clearTimeout(_inputDebounceTimer);
                _inputDebounceTimer = setTimeout(async () => {
                    await saveData(data);
                    if (type === 'income') renderIncomeChart(data, getCurrentChartType('income'));
                    else renderExpenseChart(data, getCurrentChartType('expense'));
                    renderYearSummary(data);
                    await saveData(data);
                }, 400);
            })();
        }
    });

    document.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.dataset.id) {
            const type = e.target.dataset.type;
            const id = e.target.dataset.id;
            const data = await loadData();
            const monthData = getCurrentMonthData(data);
            const array = type === 'income' ? monthData.income : monthData.expenses;
            const index = array.findIndex(item => item.id === id);
            if (index === array.length - 1) {
                const btn = document.getElementById(type === 'income' ? 'addIncomeBtn' : 'addExpenseBtn');
                if (btn) btn.click();
            }
        }
    });

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const chartType = e.target.dataset.chart;
            const dataType = e.target.dataset.type;
            document.querySelectorAll(`.toggle-btn[data-chart="${chartType}"]`).forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const data = await loadData();
            if (chartType === 'income') renderIncomeChart(data, dataType);
            else renderExpenseChart(data, dataType);
        });
    });

    on('randomizeIncomeColors', 'click', async () => {
        const data = await loadData();
        const monthData = getCurrentMonthData(data);
        monthData.incomeColors = generateUniqueColors(monthData.income.length);
        await saveData(data);
        renderColorSettings(data);
        renderIncomeChart(data, getCurrentChartType('income'));
    });

    on('randomizeExpenseColors', 'click', async () => {
        const data = await loadData();
        const monthData = getCurrentMonthData(data);
        monthData.expenseColors = generateUniqueColors(monthData.expenses.length);
        await saveData(data);
        renderColorSettings(data);
        renderExpenseChart(data, getCurrentChartType('expense'));
    });

    on('paycheckInput',  'input', renderAutopilot);
    on('ap-fixed-bills', 'input', renderAutopilot);

    on('calcLoanBtn', 'click', renderLoanCalc);
    ['loanBalance','loanAPR','loanPayment','loanExtra','loanMonths'].forEach(id => on(id, 'input', renderLoanCalc));

    on('calcCCBtn', 'click', renderCreditCard);
    ['ccLimit','ccBalance','ccMinPayment','ccTargetPayment','ccExtraPayment'].forEach(id => on(id, 'input', renderCreditCard));

    // Editable Paycheck Autopilot category titles (amounts stay auto-calculated)
    document.querySelectorAll('.ac-label-input').forEach(inp => {
        inp.addEventListener('input', async (e) => {
            const key = e.target.dataset.key;
            if (!key) return;
            const data = await loadData();
            if (!data.autopilotLabels) data.autopilotLabels = {};
            data.autopilotLabels[key] = e.target.value;
            await saveData(data);
        });
    });

    on('addGoalBtn', 'click', async () => {
        const data = await loadData();
        if (!data.savingsGoals) data.savingsGoals = [];
        data.savingsGoals.push({ id: generateUniqueId(), name: '', amount: 0 });
        await saveData(data);
        renderSavingsGoals(data);
    });

    ['sav-total','sav-travel-amt','sav-biz-amt','sav-overflow-amt',
     'trip-bnb','trip-flight','trip-food','trip-buffer',
     'trip2-bnb','trip2-flight','trip2-food','trip2-buffer',
     'proj-monthly-add'].forEach(id => on(id, 'input', renderSavings));

    on('proj-start-month', 'change', renderSavings);

    on('sav-total', 'input', async () => {
        const data = await loadData();
        updateOverview(data);
    });

    on('saveSavingsBtn', 'click', async () => {
        const data = await loadData();
        saveSavingsData(data);
        await saveData(data);
        renderSavings();
        const btn = document.getElementById('saveSavingsBtn');
        if (btn) { btn.textContent = '✅ Saved!'; setTimeout(() => { btn.textContent = '💾 Save Balances'; }, 1500); }
    });

    on('exportDataBtn', 'click', async () => {
        const data = await loadData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-data-${currentYear}-${currentMonth + 1}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    on('importDataBtn', 'click', () => { const el = document.getElementById('importFileInput'); if (el) el.click(); });

    on('importFileInput', 'change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    await saveData(importedData);
                    renderAll(importedData);
                    const modal = document.getElementById('settingsModal');
                    if (modal) modal.style.display = 'none';
                    alert('Data imported successfully!');
                } catch (error) { alert('Error importing data. Please check the file format.'); }
            };
            reader.readAsText(file);
        }
        e.target.value = '';
    });

    on('resetDataBtn', 'click', async () => {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            const defaultData = getDefaultData();
            await saveData(defaultData);
            renderAll(defaultData);
            const modal = document.getElementById('settingsModal');
            if (modal) modal.style.display = 'none';
            alert('All data has been reset.');
        }
    });

    on('signOutBtn', 'click', async () => {
        if (confirm('Are you sure you want to sign out?')) {
            try {
                if (unsubscribe) { unsubscribe(); unsubscribe = null; }
                useFirebaseSync = false;
                isAppInitialized = false;
                await auth.signOut();
                const modal = document.getElementById('settingsModal');
                if (modal) modal.style.display = 'none';
            } catch (error) { alert('Sign out failed: ' + error.message); }
        }
    });
}
function getCurrentChartType(chart) {
    const activeBtn = document.querySelector(`.toggle-btn[data-chart="${chart}"].active`);
    return activeBtn ? activeBtn.dataset.type : 'actual';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (theme === 'dark') {
        btn.textContent = '☀️ Light Mode';
    } else {
        btn.textContent = '🌙 Dark Mode';
    }
}

// ─── PAYCHECK AUTOPILOT ───────────────────────────────────────────────────────
function calcAutopilot(amount) {
    const el = document.getElementById('ap-fixed-bills');
    const FIXED_MONTHLY = el ? (parseFloat(el.value) || 1581) : 1581;
    const halfFixed = FIXED_MONTHLY / 2;
    let carExtra, savings, travel, life, business;

    if (amount < 1300) {
        carExtra = 50; savings = 0; travel = 0; life = 200; business = 0;
    } else if (amount < 1650) {
        carExtra = 150; savings = 75; travel = 100; life = 300; business = 100;
    } else {
        carExtra = 300; savings = 150; travel = 200; life = 400; business = 200;
    }

    const allocated = halfFixed + carExtra + savings + travel + life + business;
    const overflow = Math.max(0, amount - allocated);

    return { halfFixed, carExtra, savings, travel, life, business, overflow, total: allocated + overflow };
}

function renderAutopilot() {
    try {
        const input = parseFloat(document.getElementById('paycheckInput').value) || 0;
        const alloc = calcAutopilot(input);

        const badge = document.getElementById('scenarioBadge');
        if (badge) {
            if (input < 1300) { badge.textContent = '🔴 LOW — Protect Cash'; badge.className = 'scenario-badge low'; }
            else if (input < 1650) { badge.textContent = '🟡 NORMAL — Balanced'; badge.className = 'scenario-badge normal'; }
            else { badge.textContent = '🟢 HIGH — Attack Debt'; badge.className = 'scenario-badge high'; }
        }

        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('ap-bills',    formatCurrency(alloc.halfFixed));
        set('ap-carextra', formatCurrency(alloc.carExtra));
        set('ap-savings',  formatCurrency(alloc.savings));
        set('ap-travel',   formatCurrency(alloc.travel));
        set('ap-life',     formatCurrency(alloc.life));
        set('ap-business', formatCurrency(alloc.business));
        set('ap-overflow', formatCurrency(alloc.overflow));
    } catch(e) { console.warn('[Autopilot] render error:', e.message); }
}

function renderAutopilotStats(data) {
    try {
        let allChecks = [];
        if (data && data.years) {
            Object.values(data.years).forEach(yr => {
                Object.values(yr).forEach(mo => {
                    if (mo.income) {
                        mo.income.forEach(item => {
                            if (item.actual > 0) allChecks.push(item.actual);
                        });
                    }
                });
            });
        }
        const avg = allChecks.length ? allChecks.reduce((a,b)=>a+b,0)/allChecks.length : 1413.38;
        const elAvg = document.getElementById('apAvgCheck');
        const elMo  = document.getElementById('apAvgMonthly');
        if (elAvg) elAvg.textContent = formatCurrency(avg);
        if (elMo)  elMo.textContent  = formatCurrency(avg * 2);
    } catch(e) { console.warn('[AutopilotStats] render error:', e.message); }
}

// ─── CAR LOAN ─────────────────────────────────────────────────────────────────
function nper(rate, pmt, pv) {
    if (rate === 0) return pv / pmt;
    return -Math.log(1 - (rate * pv) / pmt) / Math.log(1 + rate);
}

function pmt(rate, nPer, pv) {
    if (rate === 0) return pv / nPer;
    return (rate * pv) / (1 - Math.pow(1 + rate, -nPer));
}

function renderLoanCalc() {
    try {
        const g = id => document.getElementById(id);
        const balance = parseFloat(g('loanBalance') && g('loanBalance').value) || 21800;
        const apr     = parseFloat(g('loanAPR')     && g('loanAPR').value)     || 18.35;
        const base    = parseFloat(g('loanPayment') && g('loanPayment').value) || 513.46;
        const extra   = parseFloat(g('loanExtra')   && g('loanExtra').value)   || 200;

        const rate = apr / 100 / 12;
        const totalPayment = base + extra;

        const payoffMin   = nper(rate, base, balance);
        const payoffExtra = nper(rate, totalPayment, balance);
        const payoffYrs   = payoffExtra / 12;
        const interestMin   = Math.max(0, base * payoffMin - balance);
        const interestExtra = Math.max(0, totalPayment * payoffExtra - balance);
        const interestSaved = interestMin - interestExtra;

        const set = (id, val) => { const el = g(id); if (el) el.textContent = val; };
        set('lr-totalPayment',  formatCurrency(totalPayment));
        set('lr-payoffMin',     payoffMin.toFixed(1) + ' mo');
        set('lr-payoffExtra',   payoffExtra.toFixed(1) + ' mo');
        set('lr-payoffYears',   payoffYrs.toFixed(1) + ' yrs');
        set('lr-interestMin',   formatCurrency(interestMin));
        set('lr-interestExtra', formatCurrency(interestExtra));
        set('lr-interestSaved', formatCurrency(interestSaved));

        // Refinance sim
        const curPmt  = pmt(rate, 60, balance);
        const newPmt  = pmt(0.08 / 12, 60, balance);
        const curInt  = curPmt * 60 - balance;
        const newInt  = newPmt * 60 - balance;
        set('refi-curPayment',    formatCurrency(curPmt));
        set('refi-newPayment',    formatCurrency(newPmt));
        set('refi-curInterest',   formatCurrency(curInt));
        set('refi-newInterest',   formatCurrency(newInt));
        set('refi-monthlySavings', formatCurrency(curPmt - newPmt));
        set('refi-totalSavings',   formatCurrency(curInt - newInt));

        // Amortization
        const tbody = g('amortBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        let bal = balance;
        for (let mo = 1; mo <= 12; mo++) {
            const interest  = bal * rate;
            const principal = Math.min(bal, totalPayment - interest);
            bal = Math.max(0, bal - principal);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Month ${mo}</td>
                <td>${formatCurrency(base)}</td>
                <td class="positive">${formatCurrency(extra)}</td>
                <td class="negative">${formatCurrency(interest)}</td>
                <td class="positive">${formatCurrency(principal)}</td>
                <td><strong>${formatCurrency(bal)}</strong></td>
            `;
            tbody.appendChild(row);
        }
    } catch(e) { console.warn('[LoanCalc] render error:', e.message); }
}

// ─── SAVINGS & GOALS ──────────────────────────────────────────────────────────
function renderSavings() {
    try {
        const g   = id => document.getElementById(id);
        const gv  = (id, def) => { const el = g(id); return el ? (parseFloat(el.value) || def) : def; };
        const set = (id, val) => { const el = g(id); if (el) el.textContent = val; };
        const FLOOR = 1000;

        const total     = gv('sav-total', 2100);
        const travelAmt = gv('sav-travel-amt', 300);
        const bizAmt    = gv('sav-biz-amt', 0);

        set('sav-total-status',  total >= FLOOR  ? '✅ Above Floor' : '🚨 DANGER — Below Floor!');
        set('sav-travel-status', travelAmt >= 700 ? '✅ Funded'     : '⚠️ Building...');
        set('sav-biz-status',    bizAmt >= 500    ? '✅ Ready'      : '📈 Building');

        const bnb1 = gv('trip-bnb', 0); const flight1 = gv('trip-flight', 350);
        const food1 = gv('trip-food', 350); const buf1 = gv('trip-buffer', 100);
        const trip1Total = bnb1 + flight1 + food1 + buf1;
        const afterTrip1 = total - trip1Total;
        set('trip1-total', formatCurrency(trip1Total));
        set('trip1-after', formatCurrency(afterTrip1));
        const fb1 = g('trip1-floor');
        if (fb1) {
            fb1.textContent = afterTrip1 >= FLOOR ? '✅ Still above $1,000 floor' : '🚨 Below floor after trip!';
            fb1.className   = 'trip-floor-badge ' + (afterTrip1 >= FLOOR ? 'floor-safe' : 'floor-danger');
        }

        const bnb2 = gv('trip2-bnb', 0); const flight2 = gv('trip2-flight', 0);
        const food2 = gv('trip2-food', 0); const buf2 = gv('trip2-buffer', 0);
        const trip2Total = bnb2 + flight2 + food2 + buf2;
        const afterBoth  = total - trip1Total - trip2Total;
        set('trip2-total', formatCurrency(trip2Total));
        set('trip2-after', formatCurrency(afterBoth));
        const fb2 = g('trip2-floor');
        if (fb2) {
            if (trip2Total === 0) { fb2.textContent = '—'; fb2.className = 'trip-floor-badge'; }
            else {
                fb2.textContent = afterBoth >= FLOOR ? '✅ Still above $1,000 after both trips' : '🚨 Below floor after both trips!';
                fb2.className   = 'trip-floor-badge ' + (afterBoth >= FLOOR ? 'floor-safe' : 'floor-danger');
            }
        }

        const monthlyAdd = gv('proj-monthly-add', 150);
        const projBody   = g('projBody');
        if (projBody) {
            projBody.innerHTML = '';
            let projBal = total;
            const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const startMonthEl = g('proj-start-month');
            const startMonth = startMonthEl ? parseInt(startMonthEl.value) : new Date().getMonth();
            for (let i = 0; i < 12; i++) {
                projBal += monthlyAdd;
                const row = document.createElement('tr');
                row.innerHTML = `<td>${mn[(startMonth + i) % 12]}</td><td class="positive">+${formatCurrency(monthlyAdd)}</td><td><strong>${formatCurrency(projBal)}</strong></td><td>${projBal>=FLOOR?'✅':'🚨'}</td>`;
                projBody.appendChild(row);
            }
        }
    } catch(e) { console.warn('[Savings] render error:', e.message); }
}

function saveSavingsData(data) {
    try {
        const gv  = (id, def) => { const el = document.getElementById(id); return el ? (parseFloat(el.value) || def) : def; };
        const gvs = (id, def) => { const el = document.getElementById(id); return el ? (el.value || def) : def; };
        data.savingsData = {
            total: gv('sav-total', 2100), travel: gv('sav-travel-amt', 300),
            biz: gv('sav-biz-amt', 0), overflow: gv('sav-overflow-amt', 800),
            trip1Location: gvs('trip1-location', 'Puerto Rico 🇵🇷'),
            tripBnb: gv('trip-bnb', 0), tripBnbNote: gvs('trip-bnb-note', ''),
            tripFlight: gv('trip-flight', 350), tripFood: gv('trip-food', 350),
            tripBuffer: gv('trip-buffer', 100),
            trip2Location: gvs('trip2-location', 'TBD 🌍'),
            trip2Bnb: gv('trip2-bnb', 0), trip2BnbNote: gvs('trip2-bnb-note', ''),
            trip2Flight: gv('trip2-flight', 0), trip2Food: gv('trip2-food', 0),
            trip2Buffer: gv('trip2-buffer', 0), projMonthly: gv('proj-monthly-add', 150),
            projStartMonth: gv('proj-start-month', new Date().getMonth()),
            apFixedBills: gv('ap-fixed-bills', 1581),
        };
        data.loanData = {
            balance: gv('loanBalance', 21800), apr: gv('loanAPR', 18.35),
            payment: gv('loanPayment', 513.46), extra: gv('loanExtra', 200),
            months: gv('loanMonths', 72),
        };
        data.creditCardData = {
            limit: gv('ccLimit', 0), balance: gv('ccBalance', 0),
            minPayment: gv('ccMinPayment', 0), targetPayment: gv('ccTargetPayment', 0),
            extraPayment: gv('ccExtraPayment', 0),
        };
        data.paycheckData = { amount: gv('paycheckInput', 1413.38) };
    } catch(e) { console.warn('[saveSavingsData] error:', e.message); }
}

function loadPersistedExtras(data) {
    try {
        const sv = (id, val) => { const el = document.getElementById(id); if (el && val != null) el.value = val; };
        if (data.savingsData) {
            const s = data.savingsData;
            sv('sav-total', s.total); sv('sav-travel-amt', s.travel);
            sv('sav-biz-amt', s.biz); sv('sav-overflow-amt', s.overflow);
            sv('trip1-location', s.trip1Location); sv('trip-bnb', s.tripBnb);
            sv('trip-bnb-note', s.tripBnbNote); sv('trip-flight', s.tripFlight);
            sv('trip-food', s.tripFood); sv('trip-buffer', s.tripBuffer);
            sv('trip2-location', s.trip2Location); sv('trip2-bnb', s.trip2Bnb);
            sv('trip2-bnb-note', s.trip2BnbNote); sv('trip2-flight', s.trip2Flight);
            sv('trip2-food', s.trip2Food); sv('trip2-buffer', s.trip2Buffer);
            sv('proj-monthly-add', s.projMonthly);
            if (s.projStartMonth != null) sv('proj-start-month', s.projStartMonth);
            if (s.apFixedBills   != null) sv('ap-fixed-bills',   s.apFixedBills);
        }
        if (data.loanData) {
            const l = data.loanData;
            sv('loanBalance', l.balance); sv('loanAPR', l.apr);
            sv('loanPayment', l.payment); sv('loanExtra', l.extra);
            sv('loanMonths', l.months);
        }
        if (data.creditCardData) {
            const c = data.creditCardData;
            sv('ccLimit', c.limit); sv('ccBalance', c.balance);
            sv('ccMinPayment', c.minPayment); sv('ccTargetPayment', c.targetPayment);
            sv('ccExtraPayment', c.extraPayment);
        }
        if (data.paycheckData) sv('paycheckInput', data.paycheckData.amount);
    } catch(e) { console.warn('[loadPersistedExtras] error:', e.message); }
}


// ─── COMBINED MONTHLY SUMMARY ─────────────────────────────────────────────────
function renderCombinedSummary(data) {
    try {
        const monthData = getCurrentMonthData(data);
        const el = document.getElementById('combinedSummaryBody');
        if (!el) return;

        const hisIncome  = monthData.income.reduce((s, i) => s + calcHis(i), 0);
        const herIncome  = monthData.income.reduce((s, i) => s + calcHer(i), 0);
        const combIncome = hisIncome + herIncome;

        const hisExpense  = monthData.expenses.reduce((s, i) => s + calcHis(i), 0);
        const herExpense  = monthData.expenses.reduce((s, i) => s + calcHer(i), 0);
        const combExpense = hisExpense + herExpense;

        const hisLeft  = hisIncome - hisExpense;
        const herLeft  = herIncome - herExpense;
        const combLeft = combIncome - combExpense;

        const hisSR  = hisIncome  > 0 ? ((hisLeft  / hisIncome)  * 100).toFixed(1) + '%' : '0%';
        const herSR  = herIncome  > 0 ? ((herLeft  / herIncome)  * 100).toFixed(1) + '%' : '0%';
        const combSR = combIncome > 0 ? ((combLeft / combIncome) * 100).toFixed(1) + '%' : '0%';

        el.innerHTML = `
            <tr>
                <td><strong>Monthly Take-Home</strong></td>
                <td class="positive">${formatCurrency(hisIncome)}</td>
                <td class="positive">${formatCurrency(herIncome)}</td>
                <td class="positive"><strong>${formatCurrency(combIncome)}</strong></td>
            </tr>
            <tr>
                <td><strong>Total Fixed Costs</strong></td>
                <td class="negative">${formatCurrency(hisExpense)}</td>
                <td class="negative">${formatCurrency(herExpense)}</td>
                <td class="negative"><strong>${formatCurrency(combExpense)}</strong></td>
            </tr>
            <tr>
                <td><strong>Monthly Leftover</strong></td>
                <td class="${hisLeft >= 0 ? 'positive' : 'negative'}">${formatCurrency(hisLeft)}</td>
                <td class="${herLeft >= 0 ? 'positive' : 'negative'}">${formatCurrency(herLeft)}</td>
                <td class="${combLeft >= 0 ? 'positive' : 'negative'}"><strong>${formatCurrency(combLeft)}</strong></td>
            </tr>
            <tr>
                <td><strong>Savings Rate</strong></td>
                <td>${hisSR}</td>
                <td>${herSR}</td>
                <td><strong>${combSR}</strong></td>
            </tr>
        `;
    } catch(e) { console.warn('[renderCombinedSummary] error:', e.message); }
}

function renderAll(data) {
    renderIncomeTable(data);
    renderExpenseTable(data);
    renderIncomeChart(data, getCurrentChartType('income'));
    renderExpenseChart(data, getCurrentChartType('expense'));
    renderYearSummary(data);
    renderSavingsGoals(data);
    updateOverview(data);
    renderCombinedSummary(data);
    loadPersistedExtras(data);
    renderAutopilot();
    renderAutopilotLabels(data);
    renderAutopilotStats(data);
    renderLoanCalc();
    renderCreditCard();
    renderSavings();
}

async function initApp() {
    if (isAppInitialized) {
        console.log('[App] Already initialized');
        return;
    }
    isAppInitialized = true;

    console.log('[App] Loading data...');
    const data = await loadData();

    if (!data || !data.years) {
        console.error('[App] Failed to load valid data, using defaults');
        const defaultData = getDefaultData();
        await saveData(defaultData);
        renderAll(defaultData);
    } else {
        console.log('[App] Data loaded successfully');
        renderAll(data);
    }

    initializeYearSelector();

    const monthSelector = document.getElementById('monthSelector');
    monthSelector.value = currentMonth;

    applyTheme(data.theme || 'light');

    setupEventListeners();

    if (useFirebaseSync) {
        subscribeToFirestore((updatedData) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
            renderAll(updatedData);
        });
    }
}

function showLoginForm() {
    const existingLogin = document.getElementById('loginModal');
    if (existingLogin) return;

    const loginModal = document.createElement('div');
    loginModal.id = 'loginModal';
    loginModal.className = 'modal';
    loginModal.style.display = 'block';
    loginModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Login to Budget App</h2>
            </div>
            <div class="modal-body">
                <div class="settings-group">
                    <p style="margin-bottom: 16px; color: var(--text-secondary); font-size: 14px;">Login to sync your budget with your household members, or continue without an account to use local storage only.</p>
                    <input type="email" id="loginEmail" placeholder="Email" style="width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-secondary); color: var(--text-primary); font-size: 14px;">
                    <input type="password" id="loginPassword" placeholder="Password" style="width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-secondary); color: var(--text-primary); font-size: 14px;">
                    <button id="loginBtn" class="btn btn-primary" style="width: 100%; margin-bottom: 12px;">Login with Account</button>
                    <button id="continueLocalBtn" class="btn btn-secondary" style="width: 100%;">Continue without account</button>
                    <p id="loginError" style="color: var(--danger-color); margin-top: 12px; display: none;"></p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(loginModal);

    document.getElementById('loginBtn').addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');

        if (!email || !password) {
            errorEl.textContent = 'Please enter email and password';
            errorEl.style.display = 'block';
            return;
        }

        try {
            console.log('[Auth] Attempting login for:', email);
            await auth.signInWithEmailAndPassword(email, password);
            console.log('[Auth] Login successful');
            loginModal.remove();
            // onAuthStateChanged will handle calling initApp
        } catch (error) {
            console.error('[Auth] Login failed:', error.code, error.message);
            errorEl.textContent = 'Login failed: ' + error.message;
            errorEl.style.display = 'block';
        }
    });

    document.getElementById('continueLocalBtn').addEventListener('click', () => {
        console.log('[App] User chose local-only mode');
        useFirebaseSync = false;
        loginModal.remove();
        initApp();
    });

    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('loginBtn').click();
        }
    });
}

function startApp() {
    console.log('[App] Starting app initialization');

    // Initialize Firebase
    initFirebase();

    // Check auth state
    auth.onAuthStateChanged((user) => {
        console.log('[Auth] Auth state changed, user:', user ? user.email : 'null');
        if (user) {
            console.log('[Auth] User authenticated, enabling Firebase sync');
            useFirebaseSync = true;
            initApp();
        } else {
            showLoginForm();
        }
    });
}

document.addEventListener('DOMContentLoaded', startApp);
