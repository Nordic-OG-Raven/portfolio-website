# FinSight UI/UX Improvement To-Do List

## High Priority - Data Quality & Presentation

### ✅ Completed
- [x] Document missing data patterns (missingness.md)
- [x] Fix inconsistent unit formatting
- [x] Fix redundant buttons
- [x] Add export options everywhere
- [x] Fix number formatting consistency
- [x] Add red/black for negative/positive values
- [x] Organize data properly (not starting with "Other")
- [x] Fix pagination/lazy loading
- [x] Fix loading states
- [x] Fix mobile responsiveness

### 🔄 In Progress
- [ ] Audit missing data (N/A and "-") - see missingness.md
- [ ] Add data context and definitions (tooltips, info icons)
- [ ] Add drill-down capability (click rows for details)

### 📋 Pending
- [ ] Add visualizations (charts, graphs, heatmaps)
- [ ] Add table interactivity (sorting, filtering, search) - with proper balance sheet organization
- [ ] Comparison tools (period-over-period, company benchmarking) - deferred to future

## Medium Priority - Usability

- [ ] Add keyboard navigation for tables
- [ ] Improve visual hierarchy in tables
- [ ] Add data quality indicators (coverage %, warnings)
- [ ] Add export format options (CSV, JSON, Excel)

## Low Priority - Nice to Have

- [ ] Bookmarking/saved views
- [ ] Data quality dashboard
- [ ] Validation warnings display
- [ ] Data provenance visibility

## Notes

### Sorting Tables
- Balance sheets should NOT be sorted by value size
- Instead: maintain proper accounting order (Assets first, then Liabilities, then Equity)
- Use hierarchy_level and parent relationships to maintain order
- Only allow sorting within statement sections, not across sections

### Data Organization
- Don't start with "Other" category
- Organize by statement type: Income Statement → Balance Sheet → Cash Flow → Other
- Within each statement, maintain proper accounting hierarchy
- Use taxonomy data to determine proper ordering

### Visualizations
- Time series charts for single company multi-year analysis
- Bar charts for cross-company comparisons
- Heatmaps for missing data patterns
- Sparklines for quick trend indicators

### Comparison Tools (Future)
- Period-over-period comparison
- Company benchmarking
- Industry averages (if available)
- Variance analysis

