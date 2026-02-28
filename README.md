[README.md](https://github.com/user-attachments/files/25617302/README.md)
# Home Budget Calculator

A comprehensive monthly household budgeting calculator with a 12-month system. Track your income and expenses, visualize spending patterns with interactive charts, and monitor your financial health with real-time analytics.

## Features

### Overview Dashboard
- Modern analytics dashboard with metric cards displaying:
  - Total Income (Estimated, Actual, Difference)
  - Total Expenses (Estimated, Actual, Difference)
  - Total Savings (Estimated, Actual, Difference)
  - Savings Rate with health indicator (Good ≥20%, Watch 10-19%, Risk <10%)
- All values update instantly without page refresh

### Monthly Budget Management
- Month selector (January - December)
- Year selector (2020 - 2031)
- Independent data storage for each month
- Seamless navigation between months and years

### Income Tracking
- Unlimited income entries with detailed columns:
  - Number, Description, Estimated, Actual, Difference
- Automatic difference calculation (Actual - Estimated)
- Add/Delete income entries
- Quick add: Press Enter on last input to create new row
- Real-time totals for Estimated, Actual, and Difference
- Interactive pie chart showing income distribution
- Toggle between Actual and Estimated views
- Unique colors for each income source

### Expense Tracking
- Unlimited expense entries with detailed columns:
  - Number, Description, Estimated, Actual, Difference
- Automatic difference calculation (Actual - Estimated)
- Add/Delete expense entries
- Quick add: Press Enter on last input to create new row
- Real-time totals for Estimated, Actual, and Difference
- Interactive pie chart showing expense distribution
- Toggle between Actual and Estimated views
- Unique colors for each expense category

### 12-Month Summary
- Comprehensive table showing all months:
  - Income: Estimated, Actual, Difference
  - Expenses: Estimated, Actual, Difference
  - Savings: Estimated, Actual, Difference
- Line chart comparing Estimated vs Actual Savings across all 12 months

### Settings & Customization
- Light/Dark theme toggle
- Color management:
  - Edit individual colors for income items
  - Edit individual colors for expense items
  - Randomize all income colors
  - Randomize all expense colors
- Data management:
  - Export budget data to JSON
  - Import budget data from JSON
  - Reset all data (with confirmation)

### Data Persistence
- All data automatically saved to LocalStorage
- No data loss on browser reload
- Stable unique IDs for each entry
- Persistent color assignments
- Settings saved across sessions

### User Experience
- Clean, professional layout
- Fully responsive (desktop and mobile)
- Sample data preloaded for immediate use
- Color-coded positive/negative values
- Modern analytics dashboard design
- Clear visual hierarchy
- Smooth animations and transitions

## How to Run

1. Open `index.html` in a modern web browser
2. Start budgeting immediately with preloaded sample data
3. Customize your income and expense entries
4. Navigate between months and years to manage your budget
5. Export your data for backup or transfer to another device

## LocalStorage Explanation

This application uses the browser's LocalStorage API to store all budget data locally on your device. This means:

- Data persists even after closing the browser
- No server or internet connection required
- Data is stored only on your device (privacy-friendly)
- Storage capacity: typically 5-10MB per domain
- Data is saved automatically on every change

### Storage Structure

The data is stored under the key `homeBudgetData` and includes:

- Theme preference (light/dark)
- All years of budget data
- Monthly income and expense entries
- Color assignments for charts
- Unique IDs for each entry

### Backup Recommendations

- Use the Export feature regularly to create JSON backups
- Store exported files in a safe location
- Import data to restore from backups or transfer to another browser/device

## Folder Structure

```
home-budget-calculator/
├── index.html          # Main HTML structure
├── styles.css          # All styling and theme definitions
├── app.js              # Application logic and data management
└── README.md           # This file
```

## Technologies Used

- HTML5 for structure
- CSS3 for styling with CSS custom properties for theming
- Vanilla JavaScript for all functionality
- Chart.js (v4.4.0) for data visualization
- LocalStorage API for data persistence

## Browser Compatibility

Works on all modern browsers that support:
- ES6 JavaScript
- LocalStorage API
- CSS Custom Properties
- Canvas API (for Chart.js)

Recommended browsers: Chrome, Firefox, Safari, Edge (latest versions)

## Sample Data

The application comes preloaded with sample data including:

**Income:**
- Salary: $5,000
- Side Income: $750

**Expenses:**
- Rent: $1,500
- Food: $650
- Utilities: $180
- Transportation: $320
- Subscriptions: $95

You can modify or delete this sample data and add your own entries immediately.

## Features Implementation Details

### Error Prevention
- All numeric inputs validated and parsed safely
- NaN values prevented through proper number parsing
- Empty inputs treated as zero
- Charts handle zero values gracefully
- Duplicate colors automatically avoided

### Calculations
- **Difference**: Actual - Estimated
- **Savings**: Income - Expenses
- **Savings Rate**: (Savings / Income) × 100

### Color Management
- Each entry assigned a unique HSL color
- Colors persist across sessions
- Randomization ensures no duplicate colors
- Color picker allows manual customization
- Minimum 30° hue difference between colors

## Future Enhancements

This is a complete, production-ready application. Potential future additions could include:
- Category-based expense grouping
- Budget templates
- Multi-currency support
- PDF export for reports
- Goal setting and tracking
- Spending trend analysis

## License

This project is open source and free to use for personal and commercial purposes.
