# Missing Data Audit

This document tracks all instances of missing data (displayed as "N/A" or "-") in the FinSight UI. The goal is to audit each instance to determine if:
1. The data is truly missing from the source filings
2. The data exists but is not being transformed/loaded correctly
3. The data exists but is being filtered out incorrectly

## Data Representation Standards

- **"-"**: Used when `value_numeric === null` in cross-company tables (DataWarehouseView)
- **"N/A"**: Used when `value === null` in formatNumber function (Single Company Analysis)
- **Empty cells**: Should not occur - all nulls should be represented as "-" or "N/A"

## Locations Where Missing Data Appears

### 1. Single Company Analysis (`page.tsx`)

**Location**: `formatNumber` function (line 164-177)
- Returns `'N/A'` when `value === null`
- Used in:
  - Key metrics cards (Revenue, Net Income, Total Assets)
  - Financial metrics tables (all statement types)
  - Period display: `metric.period_end ? new Date(...) : 'N/A'`

**Data Sources**:
- `result.metrics[key].value` - can be `null`
- `result.metrics[key].period_end` - can be `null`

**Audit Required**:
- Check if metrics with `value === null` actually exist in database
- Verify if `period_end` is being populated correctly from API

### 2. Data Warehouse Explorer (`DataWarehouseView.tsx`)

**Location**: Cross-company comparison tables (line 468)
- Returns `'-'` when `row === null` or `row.value_numeric === null`
- Used in cross-company tables where rows = metrics, columns = companies

**Data Sources**:
- `metricsByLabel[label]?.[ticker]` - can be undefined
- `row.value_numeric` - can be `null`

**Audit Required**:
- For each metric-company combination showing "-", verify:
  1. Does the company report this metric in the database?
  2. Is the metric being filtered out by hierarchy_level?
  3. Is the metric name matching correctly (normalized_label)?

### 3. Financial Statements (`FinancialStatements.tsx`)

**Location**: Statement tables (line 214)
- Returns `'-'` when `item === null` (no data for that period)
- Used in multi-period statement views

**Data Sources**:
- `labelPeriodMap[label]?.[period]` - can be undefined

**Audit Required**:
- For each missing period, verify:
  1. Does the filing contain data for that period?
  2. Is the period_date being parsed correctly?
  3. Are multiple periods being grouped correctly?

## Specific Missing Data Patterns to Investigate

### Pattern 1: "Unknown" Category
**Location**: Single Company Analysis results
**Issue**: A metric labeled "Unknown" appears with negative values (e.g., -2.10B DKK)
**Root Cause**: 
- Metrics are being classified with `statement_type = 'other'` or `null`
- These get grouped into "Other" category, but some may be incorrectly labeled as "Unknown"
- May be a data transformation issue where statement_type is not being properly inferred

**Action Required**: 
1. Find where "Unknown" label is being generated in the UI
2. Check database for metrics with `statement_type IS NULL` or `statement_type = 'other'`
3. Verify if these metrics should be classified under a proper statement type (income_statement, balance_sheet, cash_flow)
4. Check if taxonomy data (`rel_presentation_hierarchy`) can help classify these
5. Review the statement type inference logic in the API/backend

**Database Query to Find "Unknown" Metrics**:
```sql
SELECT DISTINCT
  co.normalized_label,
  co.statement_type,
  COUNT(*) as fact_count
FROM fact_financial_metrics f
JOIN dim_concepts co ON f.concept_id = co.concept_id
WHERE co.statement_type IS NULL 
   OR co.statement_type = 'other'
   OR co.statement_type = ''
GROUP BY co.normalized_label, co.statement_type
ORDER BY fact_count DESC
LIMIT 50;
```

### Pattern 2: Cash Flow Items Showing as 0
**Location**: Financial Statements summary
**Issue**: "0 cash flow items" reported
**Action**:
- Verify if cash flow data exists in database
- Check if cash flow concepts are being filtered incorrectly
- Verify statement_type classification for cash flow metrics

### Pattern 3: Inconsistent Missing Data Across Companies
**Location**: Data Warehouse Explorer cross-company tables
**Issue**: Same metric missing for some companies but present for others
**Action**:
- For each metric showing inconsistent coverage:
  1. Check if all companies should report this metric (universal vs. industry-specific)
  2. Verify normalized_label matching across companies
  3. Check if dimension_id filtering is excluding valid data

## Audit Checklist

For each instance of missing data:

- [ ] **Source Check**: Does the data exist in the source XBRL filing?
- [ ] **Database Check**: Does the data exist in `fact_financial_metrics` table?
- [ ] **Transformation Check**: Is the data being filtered out during transformation?
  - Check `hierarchy_level` filters
  - Check `dimension_id` filters (consolidated vs. segments)
  - Check `statement_type` classification
- [ ] **API Check**: Is the data being returned by the API endpoints?
- [ ] **UI Check**: Is the data being filtered out in the UI components?

## API Endpoints to Check

1. `/api/analyze/{ticker}/{year}` - Single company analysis
2. `/api/data` - Data warehouse data
3. `/api/statements/{ticker}/{year}` - Financial statements
4. `/api/metrics` - Available metrics list

## Database Queries for Audit

### Check if metric exists for company/year:
```sql
SELECT f.*, c.ticker, co.normalized_label, t.fiscal_year
FROM fact_financial_metrics f
JOIN dim_companies c ON f.company_id = c.company_id
JOIN dim_concepts co ON f.concept_id = co.concept_id
JOIN dim_time_periods t ON f.period_id = t.period_id
WHERE c.ticker = 'AAPL'
  AND t.fiscal_year = 2024
  AND co.normalized_label = 'revenue'
  AND f.dimension_id IS NULL
  AND f.value_numeric IS NOT NULL;
```

### Check all missing combinations:
```sql
-- This query identifies company-metric-year combinations that should exist but don't
WITH expected AS (
  SELECT DISTINCT c.ticker, co.normalized_label, t.fiscal_year
  FROM fact_financial_metrics f
  JOIN dim_companies c ON f.company_id = c.company_id
  JOIN dim_concepts co ON f.concept_id = co.concept_id
  JOIN dim_time_periods t ON f.period_id = t.period_id
  WHERE f.dimension_id IS NULL
    AND f.value_numeric IS NOT NULL
),
actual AS (
  SELECT DISTINCT c.ticker, co.normalized_label, t.fiscal_year
  FROM fact_financial_metrics f
  JOIN dim_companies c ON f.company_id = c.company_id
  JOIN dim_concepts co ON f.concept_id = co.concept_id
  JOIN dim_time_periods t ON f.period_id = t.period_id
  WHERE f.dimension_id IS NULL
    AND f.value_numeric IS NOT NULL
)
SELECT e.*
FROM expected e
LEFT JOIN actual a ON e.ticker = a.ticker 
  AND e.normalized_label = a.normalized_label 
  AND e.fiscal_year = a.fiscal_year
WHERE a.ticker IS NULL;
```

## Next Steps

1. Run database queries to identify all missing combinations
2. For each missing combination, check source XBRL filing
3. Document root cause (source missing vs. transformation issue)
4. Fix transformation/loading issues
5. Update UI to handle truly missing data appropriately

