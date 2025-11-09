# FinSight UI/UX Improvement To-Do List

## High Priority - Data Quality & Presentation

### ✅ Completed
- [x] Document missing data patterns (missingness.md)
- [x] Fix inconsistent unit formatting (normalized "pure" to "%", consistent placement)
- [x] Fix redundant buttons (renamed "View Full Financial Statements" → "Financial Statements")
- [x] Add export options everywhere (CSV/JSON export for metrics)
- [x] Fix number formatting consistency (B/M/K suffixes, consistent decimal places)
- [x] Add red/black for negative/positive values (text-red-400/600 for negatives)
- [x] Organize data properly (not starting with "Other", proper statement order)
- [x] Fix pagination/lazy loading (50 items per page with page controls)
- [x] Fix loading states (full-screen loading overlay for initial data fetch)
- [x] Fix mobile responsiveness (responsive table cells, text sizing)
- [x] **MAJOR: Implement two-tier presentation hierarchy (XBRL + Standard Templates)**
  - Backend: `src/utils/populate_standard_presentation_order.py` - Populates standard accounting order for concepts missing XBRL hierarchy
  - Backend: Updated `api/main.py` `/api/statements` endpoint to return multi-year data with `presentation_order_index`
  - Frontend: Completely rewrote `FinancialStatements.tsx` to render hierarchical, multi-year statements
  - Features:
    - Multi-year columns (current year + 2 previous years side-by-side)
    - Hierarchical tree structure with proper indentation
    - Uses `presentation_order_index` for proper accounting order (not alphabetical)
    - Calculated totals shown with bold text and gray background
    - Accounting-style number formatting (commas, parentheses for negatives)
    - Units shown once at top of table, not per row
    - Proper parent-child relationships with indentation

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

## Implementation Details

### Financial Statement Organization (Implemented)
**Two-Tier Presentation Hierarchy:**
1. **Tier 1: XBRL Presentation Hierarchy** (Most Authoritative)
   - Uses `rel_presentation_hierarchy.order_index` from XBRL filings
   - Source: `'xbrl'` in database
   - Provides company-specific filing structure

2. **Tier 2: Standard Accounting Templates** (Fallback)
   - Uses standard IFRS/US-GAAP templates when XBRL hierarchy missing
   - Source: `'standard'` in database
   - Populated by `populate_standard_presentation_order.py`
   - Ensures consistent presentation across all companies

**Backend Implementation:**
- `src/utils/populate_standard_presentation_order.py`: Populates standard templates
- Integrated into pipeline: `database/load_financial_data.py` (runs automatically after data loading)
- API endpoint: `/api/statements/<ticker>/<year>` returns multi-year data with ordering

**Frontend Implementation:**
- `app/finsight/FinancialStatements.tsx`: Complete rewrite
  - Builds hierarchical tree from `parent_concept_id` relationships
  - Sorts by `presentation_order_index` (not hierarchy_level DESC)
  - Renders with proper indentation (24px per level)
  - Shows multi-year columns (2024, 2023, 2022)
  - Formats numbers with commas and parentheses for negatives
  - Highlights calculated totals (hierarchy_level >= 3) with bold and gray background

**Result:**
- Financial statements now display like professional reports (e.g., Novo Nordisk example)
- Proper accounting order: Revenue → Costs → Gross Profit → Operating Expenses → Operating Profit
- Balance Sheet: Non-current Assets → Current Assets → Current Liabilities → Non-current Liabilities → Equity
- Cash Flow: Operating → Investing → Financing Activities

### Sorting Tables
- Balance sheets should NOT be sorted by value size
- Instead: maintain proper accounting order (Assets first, then Liabilities, then Equity)
- Use `presentation_order_index` and parent relationships to maintain order
- Only allow sorting within statement sections, not across sections

### Data Organization
- Don't start with "Other" category
- Organize by statement type: Income Statement → Balance Sheet → Cash Flow → Other
- Within each statement, maintain proper accounting hierarchy using `presentation_order_index`
- Use taxonomy data and standard templates to determine proper ordering

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

