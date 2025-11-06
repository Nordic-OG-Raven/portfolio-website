# Concrete Examples of UI/UX Issues

## Issue 1: Missing Column Headers

### Example 1: Single Company Analysis - Financial Metrics Table
**Location**: `page.tsx` lines 530-571
**Current State**: Table has headers "Line Item", "Value", "Period" - these are correct.
**Status**: ✅ No issue here - headers are present

### Example 2: Data Warehouse Explorer - Cross-Company Comparison
**Location**: `DataWarehouseView.tsx` lines 425-442
**Current State**: 
- Header row exists with "Metric" and company names as headers
- Each company column is properly labeled with company name
**Status**: ✅ No issue here - headers are present

### Example 3: Financial Statements - Multi-Period View
**Location**: `FinancialStatements.tsx` lines 174-187
**Current State**:
- Headers: "Line Item", then period dates (e.g., "Jan 2024"), then "Unit"
- Period headers are formatted as dates
**Status**: ✅ No issue here - headers are present

**Conclusion**: After reviewing the code, all tables appear to have proper column headers. The issue mentioned in the original analysis may have been from an older version or a different view. Current implementation looks correct.

## Issue 2: Missing Data Representation

### Locations where "-" or "N/A" appear:

1. **Single Company Analysis** (`page.tsx`):
   - Line 165: `if (value === null) return 'N/A';` - used in formatNumber
   - Line 565: `metric.period_end ? new Date(...) : 'N/A'` - period display

2. **Data Warehouse Explorer** (`DataWarehouseView.tsx`):
   - Line 128: `if (value === null) return 'N/A';` - formatNumber
   - Line 468: `row ? formatNumber(...) : '-'` - cross-company table cells

3. **Financial Statements** (`FinancialStatements.tsx`):
   - Line 61: `if (value === null || value === undefined) return 'N/A';` - formatNumber
   - Line 214: `item ? formatNumber(...) : '-'` - statement table cells

**All instances documented in missingness.md for audit**

## Issue 4: Date/Period Inconsistencies

### Current Implementation Review:

**Financial Statements** (`FinancialStatements.tsx`):
- Line 181: Periods formatted as `new Date(period).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })`
- Example output: "Jan 2024", "Dec 2023"
- Periods are sorted: most recent first (line 97)

**Single Company Analysis** (`page.tsx`):
- Line 565: `new Date(metric.period_end).toLocaleDateString()` - uses default locale format
- Shows full date (e.g., "1/1/2024")

**Data Warehouse Explorer**:
- Uses `selectedYear` (single year) for cross-company comparison
- Year is clearly labeled: "Fiscal Year (for comparison): 2024" (line 236)

**Conclusion**: After review, periods appear to be consistently labeled. The "Income Statement - 2024" format is clear. No inconsistencies found in current implementation.

## Issue 6: Table Interactivity - Sorting

### Current State:
- No sorting functionality exists
- Tables are sorted by hierarchy_level (totals first) then alphabetically

### Proposed Sorting Strategy:

**For Balance Sheets**: 
- DO NOT sort by value size
- Maintain accounting order: Assets → Liabilities → Equity
- Within each section, maintain hierarchy order
- Only allow sorting within a section (e.g., sort current assets by value, but keep current assets before noncurrent assets)

**For Income Statements**:
- Maintain standard order: Revenue → Cost of Revenue → Gross Profit → Operating Expenses → Operating Income → Other Income → Net Income
- Can allow sorting within expense categories

**For Cash Flow**:
- Maintain: Operating → Investing → Financing
- Can allow sorting within each section

**Implementation Note**: Use `hierarchy_level` and `parent_concept_id` to maintain proper order, only allow sorting within same hierarchy level and parent.

## Issue 9: Empty UI Space

### Example 1: Single Company Analysis Page
**Location**: `page.tsx` - main layout
**Current State**: 
- Full-width layout with cards
- No obvious empty space
**Status**: ✅ No issue

### Example 2: Data Warehouse Explorer
**Location**: `DataWarehouseView.tsx`
**Current State**:
- Filters at top, data table below
- No obvious empty space
**Status**: ✅ No issue

**Conclusion**: After review, no significant empty UI space found. Layout appears efficient.

## Issue 11: Data Organization - "Other" Category

### Current Implementation:
**Location**: `page.tsx` lines 494-512
**Current Order**:
1. Income Statement
2. Balance Sheet  
3. Cash Flow
4. Other

**Issue**: "Other" appears last, which is correct, but the problem is that items are being classified as "Other" when they should be in proper statements.

**Solution Needed**: 
- Improve statement_type classification
- Use taxonomy data (`rel_presentation_hierarchy`) to determine proper statement type
- Only use "Other" for truly unclassifiable items

### Balance Sheet Organization:

**Current**: Items sorted by hierarchy_level then alphabetically
**Needed**: Items organized in proper accounting order:
1. Assets (Current → Noncurrent)
2. Liabilities (Current → Noncurrent)  
3. Equity

**Implementation**: Use `parent_concept_id` relationships and `order_index` from `rel_presentation_hierarchy` table to maintain proper order.

