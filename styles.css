:root {
    --bg-primary: #f5f7fa;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f9fafb;
    --text-primary: #1a202c;
    --text-secondary: #4a5568;
    --text-muted: #718096;
    --border-color: #e2e8f0;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --primary-color: #3b82f6;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --accent-color: #8b5cf6;
}

[data-theme="dark"] {
    --bg-primary: #1a202c;
    --bg-secondary: #2d3748;
    --bg-tertiary: #374151;
    --text-primary: #f7fafc;
    --text-secondary: #e2e8f0;
    --text-muted: #a0aec0;
    --border-color: #4a5568;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

header {
    background-color: var(--bg-secondary);
    padding: 24px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
}

.header-controls {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.selector {
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.selector:hover {
    border-color: var(--primary-color);
}

.selector:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
}

.btn-secondary {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background-color: var(--border-color);
}

.btn-danger {
    background-color: var(--danger-color);
    color: white;
}

.btn-danger:hover {
    background-color: #dc2626;
}

.overview-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.metric-card {
    background-color: var(--bg-secondary);
    padding: 24px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.metric-card h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.metric-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.metric-label {
    font-size: 14px;
    color: var(--text-muted);
}

.metric-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
}

.badge {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.badge.good {
    background-color: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.badge.watch {
    background-color: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
}

.badge.risk {
    background-color: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.budget-section {
    background-color: var(--bg-secondary);
    padding: 24px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    margin-bottom: 24px;
}

.budget-section h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--text-primary);
}

.section-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 24px;
}

@media (max-width: 1024px) {
    .section-content {
        grid-template-columns: 1fr;
    }
}

.table-container {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 16px;
}

thead th {
    background-color: var(--bg-tertiary);
    padding: 12px;
    text-align: left;
    font-weight: 600;
    font-size: 14px;
    color: var(--text-secondary);
    border-bottom: 2px solid var(--border-color);
}

tbody tr {
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.2s ease;
}

tbody tr:hover {
    background-color: var(--bg-tertiary);
}

td {
    padding: 12px;
    font-size: 14px;
}

td input {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 14px;
}

td input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

tfoot td {
    padding: 16px 12px;
    background-color: var(--bg-tertiary);
    font-weight: 600;
    border-top: 2px solid var(--border-color);
}

.delete-btn {
    background-color: transparent;
    border: none;
    color: var(--danger-color);
    cursor: pointer;
    font-size: 18px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.delete-btn:hover {
    background-color: rgba(239, 68, 68, 0.1);
}

.chart-container {
    background-color: var(--bg-tertiary);
    padding: 20px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chart-toggle {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.toggle-btn {
    padding: 8px 16px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
}

.toggle-btn.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.toggle-btn:hover:not(.active) {
    background-color: var(--border-color);
}

.summary-section {
    background-color: var(--bg-secondary);
    padding: 24px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    margin-bottom: 24px;
}

.summary-section h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--text-primary);
}

.table-wrapper {
    overflow-x: auto;
    margin-bottom: 24px;
}

#summaryTable {
    font-size: 13px;
}

#summaryTable th {
    padding: 10px 8px;
}

#summaryTable td {
    padding: 10px 8px;
}

.chart-container-large {
    background-color: var(--bg-tertiary);
    padding: 24px;
    border-radius: 8px;
    max-height: 400px;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.modal-content {
    background-color: var(--bg-secondary);
    margin: 5% auto;
    border-radius: 12px;
    max-width: 700px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    animation: slideDown 0.3s ease;
}

@keyframes slideDown {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    padding: 24px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    font-size: 22px;
    font-weight: 700;
}

.close-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: var(--text-muted);
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
}

.modal-body {
    padding: 24px;
}

.settings-group {
    margin-bottom: 32px;
}

.settings-group:last-child {
    margin-bottom: 0;
}

.settings-group h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-primary);
}

.settings-group h4 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
    margin-top: 16px;
    color: var(--text-secondary);
}

.color-list {
    margin-bottom: 16px;
}

.color-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    margin-bottom: 8px;
}

.color-item span {
    flex: 1;
    font-size: 14px;
    color: var(--text-primary);
}

.color-item input[type="color"] {
    width: 50px;
    height: 35px;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
}

.positive {
    color: var(--success-color);
}

.negative {
    color: var(--danger-color);
}

@media (max-width: 768px) {
    header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-controls {
        width: 100%;
    }

    .selector, .btn {
        flex: 1;
        min-width: 120px;
    }

    .overview-dashboard {
        grid-template-columns: 1fr;
    }

    .section-content {
        grid-template-columns: 1fr;
    }

    .modal-content {
        margin: 10% 10px;
        max-width: calc(100% - 20px);
    }

    table {
        font-size: 12px;
    }

    th, td {
        padding: 8px 4px;
    }
}
