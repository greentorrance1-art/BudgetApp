let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let incomeChart = null;
let expenseChart = null;
let yearChart = null;

const STORAGE_KEY = 'homeBudgetData';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

function loadData() {
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

function getDefaultData() {
    const data = {
        theme: 'light',
        years: {}
    };

    const sampleIncome = [
        { id: generateUniqueId(), description: 'Salary', estimated: 5000, actual: 5000 },
        { id: generateUniqueId(), description: 'Side Income', estimated: 800, actual: 750 }
    ];

    const sampleExpenses = [
        { id: generateUniqueId(), description: 'Rent', estimated: 1500, actual: 1500 },
        { id: generateUniqueId(), description: 'Food', estimated: 600, actual: 650 },
        { id: generateUniqueId(), description: 'Utilities', estimated: 200, actual: 180 },
        { id: generateUniqueId(), description: 'Transportation', estimated: 300, actual: 320 },
        { id: generateUniqueId(), description: 'Subscriptions', estimated: 100, actual: 95 }
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

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCurrentMonthData(data) {
    if (!data.years[currentYear]) {
        data.years[currentYear] = {};
    }
    if (!data.years[currentYear][currentMonth]) {
        data.years[currentYear][currentMonth] = {
            income: [],
            expenses: [],
            incomeColors: [],
            expenseColors: []
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
    const monthData = getCurrentMonthData(data);
    const tbody = document.getElementById('incomeTableBody');
    tbody.innerHTML = '';

    monthData.income.forEach((item, index) => {
        const row = document.createElement('tr');
        const estimated = parseNumber(item.estimated);
        const actual = parseNumber(item.actual);
        const diff = actual - estimated;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" value="${item.description}" data-id="${item.id}" data-field="description" data-type="income"></td>
            <td><input type="number" step="0.01" value="${estimated}" data-id="${item.id}" data-field="estimated" data-type="income"></td>
            <td><input type="number" step="0.01" value="${actual}" data-id="${item.id}" data-field="actual" data-type="income"></td>
            <td class="${diff >= 0 ? 'positive' : 'negative'}">${formatCurrency(diff)}</td>
            <td><button class="delete-btn" data-id="${item.id}" data-type="income">🗑️</button></td>
        `;
        tbody.appendChild(row);
    });

    updateTotals(data);
}

function renderExpenseTable(data) {
    const monthData = getCurrentMonthData(data);
    const tbody = document.getElementById('expenseTableBody');
    tbody.innerHTML = '';

    monthData.expenses.forEach((item, index) => {
        const row = document.createElement('tr');
        const estimated = parseNumber(item.estimated);
        const actual = parseNumber(item.actual);
        const diff = actual - estimated;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><input type="text" value="${item.description}" data-id="${item.id}" data-field="description" data-type="expense"></td>
            <td><input type="number" step="0.01" value="${estimated}" data-id="${item.id}" data-field="estimated" data-type="expense"></td>
            <td><input type="number" step="0.01" value="${actual}" data-id="${item.id}" data-field="actual" data-type="expense"></td>
            <td class="${diff <= 0 ? 'positive' : 'negative'}">${formatCurrency(diff)}</td>
            <td><button class="delete-btn" data-id="${item.id}" data-type="expense">🗑️</button></td>
        `;
        tbody.appendChild(row);
    });

    updateTotals(data);
}

function updateTotals(data) {
    const monthData = getCurrentMonthData(data);

    const incomeEstTotal = monthData.income.reduce((sum, item) => sum + parseNumber(item.estimated), 0);
    const incomeActTotal = monthData.income.reduce((sum, item) => sum + parseNumber(item.actual), 0);
    const incomeDiffTotal = incomeActTotal - incomeEstTotal;

    const expenseEstTotal = monthData.expenses.reduce((sum, item) => sum + parseNumber(item.estimated), 0);
    const expenseActTotal = monthData.expenses.reduce((sum, item) => sum + parseNumber(item.actual), 0);
    const expenseDiffTotal = expenseActTotal - expenseEstTotal;

    document.getElementById('totalIncomeEst').textContent = formatCurrency(incomeEstTotal);
    document.getElementById('totalIncomeAct').textContent = formatCurrency(incomeActTotal);
    document.getElementById('totalIncomeDiff').textContent = formatCurrency(incomeDiffTotal);
    document.getElementById('totalIncomeDiff').className = incomeDiffTotal >= 0 ? 'positive' : 'negative';

    document.getElementById('totalExpenseEst').textContent = formatCurrency(expenseEstTotal);
    document.getElementById('totalExpenseAct').textContent = formatCurrency(expenseActTotal);
    document.getElementById('totalExpenseDiff').textContent = formatCurrency(expenseDiffTotal);
    document.getElementById('totalExpenseDiff').className = expenseDiffTotal <= 0 ? 'positive' : 'negative';

    updateOverview(data);
}

function updateOverview(data) {
    const monthData = getCurrentMonthData(data);

    const incomeEstTotal = monthData.income.reduce((sum, item) => sum + parseNumber(item.estimated), 0);
    const incomeActTotal = monthData.income.reduce((sum, item) => sum + parseNumber(item.actual), 0);
    const incomeDiffTotal = incomeActTotal - incomeEstTotal;

    const expenseEstTotal = monthData.expenses.reduce((sum, item) => sum + parseNumber(item.estimated), 0);
    const expenseActTotal = monthData.expenses.reduce((sum, item) => sum + parseNumber(item.actual), 0);
    const expenseDiffTotal = expenseActTotal - expenseEstTotal;

    const savingsEst = incomeEstTotal - expenseEstTotal;
    const savingsAct = incomeActTotal - expenseActTotal;
    const savingsDiff = savingsAct - savingsEst;

    document.getElementById('overviewIncomeEst').textContent = formatCurrency(incomeEstTotal);
    document.getElementById('overviewIncomeAct').textContent = formatCurrency(incomeActTotal);
    document.getElementById('overviewIncomeDiff').textContent = formatCurrency(incomeDiffTotal);
    document.getElementById('overviewIncomeDiff').className = 'metric-value ' + (incomeDiffTotal >= 0 ? 'positive' : 'negative');

    document.getElementById('overviewExpensesEst').textContent = formatCurrency(expenseEstTotal);
    document.getElementById('overviewExpensesAct').textContent = formatCurrency(expenseActTotal);
    document.getElementById('overviewExpensesDiff').textContent = formatCurrency(expenseDiffTotal);
    document.getElementById('overviewExpensesDiff').className = 'metric-value ' + (expenseDiffTotal <= 0 ? 'positive' : 'negative');

    document.getElementById('overviewSavingsEst').textContent = formatCurrency(savingsEst);
    document.getElementById('overviewSavingsAct').textContent = formatCurrency(savingsAct);
    document.getElementById('overviewSavingsDiff').textContent = formatCurrency(savingsDiff);
    document.getElementById('overviewSavingsDiff').className = 'metric-value ' + (savingsDiff >= 0 ? 'positive' : 'negative');

    const savingsRateEst = incomeEstTotal > 0 ? (savingsEst / incomeEstTotal * 100) : 0;
    const savingsRateAct = incomeActTotal > 0 ? (savingsAct / incomeActTotal * 100) : 0;

    document.getElementById('savingsRateEst').textContent = savingsRateEst.toFixed(1) + '%';
    document.getElementById('savingsRateAct').textContent = savingsRateAct.toFixed(1) + '%';

    const badge = document.getElementById('savingsHealthBadge');
    badge.className = 'badge';
    if (savingsRateAct >= 20) {
        badge.textContent = 'Good';
        badge.classList.add('good');
    } else if (savingsRateAct >= 10) {
        badge.textContent = 'Watch';
        badge.classList.add('watch');
    } else {
        badge.textContent = 'Risk';
        badge.classList.add('risk');
    }
}

function renderIncomeChart(data, type = 'actual') {
    const monthData = getCurrentMonthData(data);
    const canvas = document.getElementById('incomeChart');
    const ctx = canvas.getContext('2d');

    if (incomeChart) {
        incomeChart.destroy();
    }

    const labels = monthData.income.map(item => item.description || 'Unnamed');
    const values = monthData.income.map(item => parseNumber(item[type]));
    const colors = monthData.incomeColors;

    const total = values.reduce((sum, val) => sum + val, 0);

    incomeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderExpenseChart(data, type = 'actual') {
    const monthData = getCurrentMonthData(data);
    const canvas = document.getElementById('expenseChart');
    const ctx = canvas.getContext('2d');

    if (expenseChart) {
        expenseChart.destroy();
    }

    const labels = monthData.expenses.map(item => item.description || 'Unnamed');
    const values = monthData.expenses.map(item => parseNumber(item[type]));
    const colors = monthData.expenseColors;

    const total = values.reduce((sum, val) => sum + val, 0);

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        padding: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderYearSummary(data) {
    const tbody = document.getElementById('summaryTableBody');
    tbody.innerHTML = '';

    if (!data.years[currentYear]) {
        data.years[currentYear] = {};
    }

    for (let m = 0; m < 12; m++) {
        const monthData = data.years[currentYear][m] || { income: [], expenses: [] };

        const incomeEst = monthData.income.reduce((sum, item) => sum + parseNumber(item.estimated), 0);
        const incomeAct = monthData.income.reduce((sum, item) => sum + parseNumber(item.actual), 0);
        const incomeDiff = incomeAct - incomeEst;

        const expenseEst = monthData.expenses.reduce((sum, item) => sum + parseNumber(item.estimated), 0);
        const expenseAct = monthData.expenses.reduce((sum, item) => sum + parseNumber(item.actual), 0);
        const expenseDiff = expenseAct - expenseEst;

        const savingsEst = incomeEst - expenseEst;
        const savingsAct = incomeAct - expenseAct;
        const savingsDiff = savingsAct - savingsEst;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${MONTHS[m]}</strong></td>
            <td>${formatCurrency(incomeEst)}</td>
            <td>${formatCurrency(incomeAct)}</td>
            <td class="${incomeDiff >= 0 ? 'positive' : 'negative'}">${formatCurrency(incomeDiff)}</td>
            <td>${formatCurrency(expenseEst)}</td>
            <td>${formatCurrency(expenseAct)}</td>
            <td class="${expenseDiff <= 0 ? 'positive' : 'negative'}">${formatCurrency(expenseDiff)}</td>
            <td>${formatCurrency(savingsEst)}</td>
            <td>${formatCurrency(savingsAct)}</td>
            <td class="${savingsDiff >= 0 ? 'positive' : 'negative'}">${formatCurrency(savingsDiff)}</td>
        `;
        tbody.appendChild(row);
    }

    renderYearChart(data);
}

function renderYearChart(data) {
    const canvas = document.getElementById('yearChart');
    const ctx = canvas.getContext('2d');

    if (yearChart) {
        yearChart.destroy();
    }

    if (!data.years[currentYear]) {
        data.years[currentYear] = {};
    }

    const estimatedSavings = [];
    const actualSavings = [];

    for (let m = 0; m < 12; m++) {
        const monthData = data.years[currentYear][m] || { income: [], expenses: [] };

        const incomeEst = monthData.income.reduce((sum, item) => sum + parseNumber(item.estimated), 0);
        const incomeAct = monthData.income.reduce((sum, item) => sum + parseNumber(item.actual), 0);
        const expenseEst = monthData.expenses.reduce((sum, item) => sum + parseNumber(item.estimated), 0);
        const expenseAct = monthData.expenses.reduce((sum, item) => sum + parseNumber(item.actual), 0);

        estimatedSavings.push(incomeEst - expenseEst);
        actualSavings.push(incomeAct - expenseAct);
    }

    yearChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: MONTHS,
            datasets: [
                {
                    label: 'Estimated Savings',
                    data: estimatedSavings,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Actual Savings',
                    data: actualSavings,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                    }
                }
            }
        }
    });
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
    const data = loadData();

    document.getElementById('monthSelector').addEventListener('change', (e) => {
        currentMonth = parseInt(e.target.value);
        const data = loadData();
        renderAll(data);
    });

    document.getElementById('yearSelector').addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        const data = loadData();
        renderAll(data);
    });

    document.getElementById('themeToggle').addEventListener('click', () => {
        const data = loadData();
        data.theme = data.theme === 'light' ? 'dark' : 'light';
        applyTheme(data.theme);
        saveData(data);
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
        const data = loadData();
        renderColorSettings(data);
        document.getElementById('settingsModal').style.display = 'block';
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('settingsModal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.getElementById('addIncomeBtn').addEventListener('click', () => {
        const data = loadData();
        const monthData = getCurrentMonthData(data);
        monthData.income.push({
            id: generateUniqueId(),
            description: '',
            estimated: 0,
            actual: 0
        });
        monthData.incomeColors.push(generateUniqueColors(1, monthData.incomeColors)[0]);
        saveData(data);
        renderIncomeTable(data);
        renderIncomeChart(data, getCurrentChartType('income'));
    });

    document.getElementById('addExpenseBtn').addEventListener('click', () => {
        const data = loadData();
        const monthData = getCurrentMonthData(data);
        monthData.expenses.push({
            id: generateUniqueId(),
            description: '',
            estimated: 0,
            actual: 0
        });
        monthData.expenseColors.push(generateUniqueColors(1, monthData.expenseColors)[0]);
        saveData(data);
        renderExpenseTable(data);
        renderExpenseChart(data, getCurrentChartType('expense'));
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            const type = e.target.dataset.type;
            const data = loadData();
            const monthData = getCurrentMonthData(data);

            if (type === 'income') {
                const index = monthData.income.findIndex(item => item.id === id);
                if (index !== -1) {
                    monthData.income.splice(index, 1);
                    monthData.incomeColors.splice(index, 1);
                }
                saveData(data);
                renderIncomeTable(data);
                renderIncomeChart(data, getCurrentChartType('income'));
            } else {
                const index = monthData.expenses.findIndex(item => item.id === id);
                if (index !== -1) {
                    monthData.expenses.splice(index, 1);
                    monthData.expenseColors.splice(index, 1);
                }
                saveData(data);
                renderExpenseTable(data);
                renderExpenseChart(data, getCurrentChartType('expense'));
            }
            renderYearSummary(data);
        }
    });

    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.dataset.id) {
            const id = e.target.dataset.id;
            const field = e.target.dataset.field;
            const type = e.target.dataset.type;
            const value = e.target.value;

            const data = loadData();
            const monthData = getCurrentMonthData(data);

            const array = type === 'income' ? monthData.income : monthData.expenses;
            const item = array.find(item => item.id === id);

            if (item) {
                if (field === 'description') {
                    item[field] = value;
                } else {
                    item[field] = parseNumber(value);
                }
                saveData(data);
                updateTotals(data);

                if (type === 'income') {
                    renderIncomeChart(data, getCurrentChartType('income'));
                } else {
                    renderExpenseChart(data, getCurrentChartType('expense'));
                }
                renderYearSummary(data);
            }
        }

        if (e.target.type === 'color') {
            const type = e.target.dataset.type;
            const index = parseInt(e.target.dataset.index);
            const color = e.target.value;

            const data = loadData();
            const monthData = getCurrentMonthData(data);

            if (type === 'income') {
                monthData.incomeColors[index] = color;
                renderIncomeChart(data, getCurrentChartType('income'));
            } else {
                monthData.expenseColors[index] = color;
                renderExpenseChart(data, getCurrentChartType('expense'));
            }
            saveData(data);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.dataset.id) {
            const type = e.target.dataset.type;
            const id = e.target.dataset.id;

            const data = loadData();
            const monthData = getCurrentMonthData(data);

            const array = type === 'income' ? monthData.income : monthData.expenses;
            const index = array.findIndex(item => item.id === id);

            if (index === array.length - 1) {
                if (type === 'income') {
                    document.getElementById('addIncomeBtn').click();
                } else {
                    document.getElementById('addExpenseBtn').click();
                }
            }
        }
    });

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const chartType = e.target.dataset.chart;
            const dataType = e.target.dataset.type;

            document.querySelectorAll(`.toggle-btn[data-chart="${chartType}"]`).forEach(b => {
                b.classList.remove('active');
            });
            e.target.classList.add('active');

            const data = loadData();
            if (chartType === 'income') {
                renderIncomeChart(data, dataType);
            } else {
                renderExpenseChart(data, dataType);
            }
        });
    });

    document.getElementById('randomizeIncomeColors').addEventListener('click', () => {
        const data = loadData();
        const monthData = getCurrentMonthData(data);
        monthData.incomeColors = generateUniqueColors(monthData.income.length);
        saveData(data);
        renderColorSettings(data);
        renderIncomeChart(data, getCurrentChartType('income'));
    });

    document.getElementById('randomizeExpenseColors').addEventListener('click', () => {
        const data = loadData();
        const monthData = getCurrentMonthData(data);
        monthData.expenseColors = generateUniqueColors(monthData.expenses.length);
        saveData(data);
        renderColorSettings(data);
        renderExpenseChart(data, getCurrentChartType('expense'));
    });

    document.getElementById('exportDataBtn').addEventListener('click', () => {
        const data = loadData();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-data-${currentYear}-${currentMonth + 1}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });

    document.getElementById('importFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    saveData(importedData);
                    renderAll(importedData);
                    document.getElementById('settingsModal').style.display = 'none';
                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
        e.target.value = '';
    });

    document.getElementById('resetDataBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            const defaultData = getDefaultData();
            saveData(defaultData);
            renderAll(defaultData);
            document.getElementById('settingsModal').style.display = 'none';
            alert('All data has been reset.');
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

function renderAll(data) {
    renderIncomeTable(data);
    renderExpenseTable(data);
    renderIncomeChart(data, getCurrentChartType('income'));
    renderExpenseChart(data, getCurrentChartType('expense'));
    renderYearSummary(data);
    updateOverview(data);
}

function init() {
    const data = loadData();

    initializeYearSelector();

    const monthSelector = document.getElementById('monthSelector');
    monthSelector.value = currentMonth;

    applyTheme(data.theme || 'light');

    renderAll(data);

    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', init);
