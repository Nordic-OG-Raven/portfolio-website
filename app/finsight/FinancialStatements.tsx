'use client';

import { useState, useEffect } from 'react';

interface StatementItem {
  normalized_label: string;
  concept_name: string;
  preferred_label?: string;  // LASTING - from database, populated during ETL
  value: number | null;
  unit: string;
  period_date: string | null;
  period_year: number;
  period_type: string;
  hierarchy_level: number | null;
  parent_normalized_label: string | null;
  presentation_order_index: number | null;
  presentation_source: string | null;
  is_header?: boolean;  // Flag for synthetic header items
  side?: string;  // For balance sheet: 'assets' or 'liabilities_equity'
  equity_component?: string | null;  // For equity statement: 'share_capital', 'treasury_shares', 'retained_earnings', 'other_reserves', NULL for totals
}

interface StatementsData {
  income_statement: StatementItem[];
  comprehensive_income?: StatementItem[];  // OCI items
  balance_sheet: StatementItem[];
  cash_flow: StatementItem[];
  equity_statement?: StatementItem[];  // Statement of Changes in Equity
}

interface FinancialStatementsProps {
  ticker: string;
  year: number;
  API_BASE: string;
}

interface APIResponse {
  company: string;
  year: number;
  years: number[];
  accounting_standard: string;
  fiscal_year_end?: string | null;
  statements: StatementsData;
  count: number;
}

interface TreeNode {
  label: string;
  normalized_label: string;
  values: Record<number, number | null>; // year -> value
  unit: string;
  hierarchy_level: number | null;
  order_index: number;
  children: TreeNode[];
  isTotal: boolean;
  isHeader?: boolean;  // Flag for header items
  isSectionBoundary?: boolean;  // Universal section boundary detection (from hierarchy_level)
}

export default function FinancialStatements({ ticker, year, API_BASE }: FinancialStatementsProps) {
  const [data, setData] = useState<StatementsData | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountingStandard, setAccountingStandard] = useState<'IFRS' | 'US-GAAP'>('US-GAAP');
  const [fiscalYearEnd, setFiscalYearEnd] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['income_statement', 'comprehensive_income', 'balance_sheet', 'cash_flow', 'equity_statement']));

  const loadStatements = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}?path=/api/statements/${ticker}/${year}`);
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }
      const result: APIResponse = await res.json();
      setData(result.statements);
      setYears(result.years || [year, year - 1, year - 2]);
      setAccountingStandard(result.accounting_standard === 'IFRS' ? 'IFRS' : 'US-GAAP');
      setFiscalYearEnd(result.fiscal_year_end || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load statements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data && !loading) {
      loadStatements();
    }
  }, [ticker, year]);

  // Helper: Format fiscal year end date (e.g., "at 31 December")
  const formatFiscalYearEnd = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      return `at ${day} ${month}`;
    } catch {
      return '';
    }
  };

  // Helper: Determine if unit is millions or billions
  const getUnitScale = (items: StatementItem[]): { scale: 'millions' | 'billions' | 'thousands', unit: string } => {
    if (!items || items.length === 0) return { scale: 'millions', unit: 'USD' };
    
    // Get a sample value to determine scale
    const sampleItem = items.find(item => item.value !== null && item.value !== undefined && Math.abs(item.value) > 0);
    if (!sampleItem) return { scale: 'millions', unit: getCommonUnit(items) };
    
    const absValue = Math.abs(sampleItem.value!);
    const unit = getCommonUnit(items);
    
    // If values are in billions (typically > 1 billion in raw value)
    if (absValue >= 1e9) {
      return { scale: 'billions', unit };
    } else if (absValue >= 1e6) {
      return { scale: 'millions', unit };
    } else {
      return { scale: 'thousands', unit };
    }
  };

  // Format number with commas and parentheses for negatives (accounting format)
  const formatNumber = (value: number | null, unit: string = 'USD'): string => {
    if (value === null || value === undefined) return '—';
    
    // Normalize unit
    const normalizedUnit = unit === 'pure' ? '%' : unit;
    
    // CRITICAL: EPS and per-share values should NOT be divided by millions/billions
    // They are already in the correct unit (currency per share)
    // Check if unit contains "shares" or "share" - these are per-share values
    const isPerShareValue = normalizedUnit?.toLowerCase().includes('share') || 
                           normalizedUnit?.toLowerCase().includes('shares');
    
    if (isPerShareValue) {
      // Per-share values: format as-is with 2 decimal places
      const formatted = Math.abs(value).toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
      return value < 0 ? `(${formatted})` : formatted;
    }
    
    // Format with commas
    const absValue = Math.abs(value);
    let formatted: string;
    
    // CRITICAL: Currency-specific unit handling
    // DKK and EUR typically use millions, USD might use millions or billions
    // For DKK/EUR: always divide by 1e6 to get millions
    if (normalizedUnit === 'DKK' || normalizedUnit === 'EUR' || 
        normalizedUnit?.toUpperCase().includes('DKK') || normalizedUnit?.toUpperCase().includes('EUR')) {
      // DKK/EUR: divide by 1e6 to get millions
      formatted = (absValue / 1e6).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else if (absValue >= 1e9) {
      // For other currencies, use billions if >= 1e9
      formatted = (absValue / 1e9).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else if (absValue >= 1e6) {
      // Otherwise use millions
      formatted = (absValue / 1e6).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else if (absValue >= 1e3) {
      formatted = (absValue / 1e3).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else {
      formatted = absValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    
    // Use parentheses for negatives (accounting format)
    if (value < 0) {
      return `(${formatted})`;
    }
    return formatted;
  };

  const humanizeLabel = (normalizedLabel: string, conceptName?: string): string => {
    // Special handling for header items
    if (normalizedLabel === 'earnings_per_share_header') {
      return 'Earnings per share';
    }
    
    // BEST PRACTICE: Use concept_name (CamelCase) for humanization, not normalized_label (snake_case)
    // XBRL concept names are designed to be human-readable when properly converted
    // This is how Bloomberg, FactSet, and other platforms do it - they use taxonomy concept names
    if (conceptName && conceptName.trim()) {
      // Convert CamelCase to readable format
      // Example: "GainsLossesOnCashFlowHedgesBeforeTax" -> "Gains Losses On Cash Flow Hedges Before Tax"
      let humanized = conceptName
        .replace(/([a-z])([A-Z])/g, '$1 $2')  // Insert space before capital letters
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // Handle consecutive capitals (e.g., "OCI" -> "OCI ")
        .trim();
      
      // Remove redundant prefixes when in comprehensive income context
      // These are already implied by the statement type
      // BUT: Keep "Other Comprehensive Income" as-is if it's the full concept name
      const redundantPrefixes = [
        'Other Comprehensive Income Net Of Tax ',
        'Other Comprehensive Income Net Of Tax',
      ];
      
      for (const prefix of redundantPrefixes) {
        if (humanized.startsWith(prefix) && humanized.length > prefix.length) {
          humanized = humanized.substring(prefix.length).trim();
          break;
        }
      }
      
      // Special case: If we removed everything, restore "Other Comprehensive Income"
      if (!humanized || humanized.length === 0) {
        humanized = conceptName
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
          .trim();
      }
      
      // Remove "Header" suffix from headers (case-insensitive)
      // This ensures headers like "TransactionsWithOwnersHeader" become "Transactions with owners"
      humanized = humanized.replace(/\s+[Hh]eader\s*$/, '').trim();
      
      // Capitalize first letter of each word (Title Case)
      humanized = humanized
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return humanized;
    }
    
    // Fallback: Convert normalized_label (snake_case) to Title Case
    // This is less ideal but works as a fallback
    return normalizedLabel
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Build hierarchical tree structure from flat list
  const buildTree = (items: StatementItem[]): TreeNode[] => {
    if (!items || items.length === 0) return [];
    
    // Group items by normalized_label
    const itemsByLabel: Record<string, StatementItem[]> = {};
    items.forEach(item => {
      if (!itemsByLabel[item.normalized_label]) {
        itemsByLabel[item.normalized_label] = [];
      }
      itemsByLabel[item.normalized_label].push(item);
    });

    // Create tree nodes
    const nodes: Record<string, TreeNode> = {};
    const rootNodes: TreeNode[] = [];

    // First pass: create all nodes
    Object.keys(itemsByLabel).forEach(label => {
      const itemList = itemsByLabel[label];
      const firstItem = itemList[0];
      
      // Collect values by year
      const values: Record<number, number | null> = {};
      let unit = firstItem.unit;
      years.forEach(y => {
        const itemForYear = itemList.find(i => i.period_year === y);
        values[y] = itemForYear?.value ?? null;
        if (itemForYear?.unit) unit = itemForYear.unit;
      });

      const orderIndex = firstItem.presentation_order_index ?? 999999;
      const hierarchyLevel = firstItem.hierarchy_level;
      
      // BEST PRACTICE: Identify totals/subtotals by label patterns
      // Based on professional financial statements (Bloomberg, SEC filings):
      // - Totals/subtotals: Items with "Total", "Subtotal", or common subtotal names like "Gross profit", "Operating profit", "Net profit"
      // - Individual items: Everything else (like "Cost of goods sold", "Tax and other items", etc.)
      const labelLower = (firstItem.preferred_label || humanizeLabel(label, firstItem.concept_name) || '').toLowerCase();
      const isTotal = labelLower.includes('total') || 
                     labelLower.includes('subtotal') ||
                     labelLower === 'gross profit' ||
                     labelLower === 'operating profit' ||
                     labelLower === 'operating income' ||
                     labelLower === 'profit before income taxes' ||
                     labelLower === 'income before tax' ||
                     labelLower === 'net profit' ||
                     labelLower === 'net income' ||
                     labelLower === 'other comprehensive income' ||
                     (hierarchyLevel !== null && hierarchyLevel >= 3 && labelLower.includes('total'));

      // Check if this is a header item (synthetic item with no data)
      const isHeader = firstItem.is_header === true || (firstItem.value === null && Object.values(values).every(v => v === null));
      
      // UNIVERSAL SECTION DETECTION: Use hierarchy_level to identify section boundaries
      // hierarchy_level transitions indicate section changes:
      // - Level 1 → 3: End of detail section, start of section total
      // - Level 3 → 1: End of section total, start of new detail section
      // - Level 2: Subtotals within sections
      // - Level 4: Statement-level totals
      // This is universal because it comes from XBRL presentation hierarchy, not company-specific patterns
      const isSectionBoundary = hierarchyLevel !== null && (
        hierarchyLevel === 3 || // Section total (marks end of a section)
        hierarchyLevel === 4    // Statement total (marks end of statement)
      );
      
      nodes[label] = {
        label: firstItem.preferred_label || humanizeLabel(label, firstItem.concept_name),  // LASTING - use preferred_label from database
        normalized_label: label,
        values,
        unit,
        hierarchy_level: hierarchyLevel,
        order_index: orderIndex,
        children: [],
        isTotal,
        isHeader,
        isSectionBoundary  // Universal section boundary detection
      };
    });

    // Second pass: build parent-child relationships
    Object.keys(itemsByLabel).forEach(label => {
          const firstItem = itemsByLabel[label][0];
      const node = nodes[label];
      
      if (firstItem.parent_normalized_label && nodes[firstItem.parent_normalized_label]) {
        // Has parent - add to parent's children
        nodes[firstItem.parent_normalized_label].children.push(node);
      } else {
        // Root node
        rootNodes.push(node);
      }
    });

    // Sort: by order_index, then by hierarchy_level DESC (totals before details)
    const sortNodes = (nodeList: TreeNode[]): TreeNode[] => {
      const sorted = [...nodeList].sort((a, b) => {
        // First by order_index
        if (a.order_index !== b.order_index) {
          return a.order_index - b.order_index;
        }
        // Then by hierarchy_level DESC (totals first)
        const levelA = a.hierarchy_level ?? 0;
        const levelB = b.hierarchy_level ?? 0;
        if (levelA !== levelB) {
          return levelB - levelA;
        }
        // Finally alphabetically
        return a.label.localeCompare(b.label);
      });

      // Recursively sort children
      sorted.forEach(node => {
        if (node.children.length > 0) {
          node.children = sortNodes(node.children);
        }
      });

      return sorted;
    };

    return sortNodes(rootNodes);
  };

  // Helper to flatten tree for border detection
  const flattenTree = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children.length > 0) {
        result.push(...flattenTree(node.children));
      }
    });
    return result;
  };

  const renderTreeRow = (node: TreeNode, depth: number = 0, flatNodeList: TreeNode[] = [], nodeIndex: number = -1): React.JSX.Element[] => {
    const indent = depth * 24; // 24px per level
    
    // BEST PRACTICE: Identify totals/subtotals by label patterns
    // Based on professional financial statements (Bloomberg, SEC filings):
    // - Totals/subtotals: Items with "Total", "Subtotal", or common subtotal names
    // - Individual items: Everything else (like "Cost of goods sold", "Tax and other items", etc.)
    const labelLower = node.label.toLowerCase();
    const isTotal = labelLower.includes('total') || 
                   labelLower.includes('subtotal') ||
                   labelLower === 'gross profit' ||
                   labelLower === 'operating profit' ||
                   labelLower === 'operating income' ||
                   labelLower === 'profit before income taxes' ||
                   labelLower === 'income before tax' ||
                   labelLower === 'net profit' ||
                   labelLower === 'net income' ||
                   labelLower === 'other comprehensive income' ||
                   labelLower.includes('net cash flows from operating activities') ||
                   labelLower.includes('net cash flows from investing activities') ||
                   labelLower.includes('net cash flows from financing activities') ||
                   labelLower.includes('net increase decrease in cash and cash equivalents') ||
                   (node.hierarchy_level !== null && node.hierarchy_level >= 3 && labelLower.includes('total'));
    
    // PROFESSIONAL FORMATTING: Section break lines and spacing
    // BEST PRACTICE (Bloomberg, SEC filings, Novo Nordisk):
    // 1. Lines appear ABOVE totals/subtotals (section headers) - more prominent
    // 2. Lines also appear BELOW the last item in a section (section breaks)
    // 3. Subtle spacing after major section boundaries (hierarchy_level 3 or 4)
    // 4. Universal detection: Use hierarchy_level transitions, not company-specific patterns
    let borderTopClass = '';
    let borderBottomClass = '';
    let spacingClass = '';
    
    // Check if this is a final total (like "Total comprehensive income", "Total assets", "Total equity and liabilities")
    const isFinalTotal = labelLower.includes('total comprehensive income') || 
                        labelLower === 'total assets' ||
                        labelLower === 'total equity and liabilities' ||
                        labelLower === 'total liabilities' ||
                        labelLower.includes('net increase decrease in cash and cash equivalents');
    
    // Check if this is a section total that should have a line below (e.g., "Total non-current assets", "Total current assets")
    const isSectionTotal = labelLower === 'total non-current assets' ||
                          labelLower === 'total current assets' ||
                          labelLower === 'total non-current liabilities' ||
                          labelLower === 'total current liabilities';
    
    if (isTotal) {
      // Add border ABOVE totals/subtotals (section header) - more prominent for section boundaries
      if (node.isSectionBoundary) {
        borderTopClass = isFinalTotal ? 'border-t-2 border-gray-500' : 'border-t-2 border-gray-400';
      } else {
        borderTopClass = isFinalTotal ? 'border-t-2 border-gray-400' : 'border-t border-gray-300';
      }
      
      // Add border BELOW section totals (like "Total non-current assets", "Total current assets")
      if (isSectionTotal) {
        borderBottomClass = 'border-b border-gray-300';
      }
    }
    
    // UNIVERSAL SECTION BREAK DETECTION: Check if the NEXT item is a total/subtotal
    // This works universally because it's based on label patterns and hierarchy_level
    const currentIndex = nodeIndex >= 0 ? nodeIndex : flatNodeList.findIndex(n => n.normalized_label === node.normalized_label);
    const nextNode = currentIndex >= 0 && currentIndex < flatNodeList.length - 1 ? flatNodeList[currentIndex + 1] : null;
    
    if (nextNode && !isTotal) {
      // Check if next item is a total/subtotal
      const nextLabelLower = nextNode.label.toLowerCase();
      const nextIsTotal = nextLabelLower.includes('total') || 
                         nextLabelLower.includes('subtotal') ||
                         nextLabelLower === 'gross profit' ||
                         nextLabelLower === 'operating profit' ||
                         nextLabelLower === 'operating income' ||
                         nextLabelLower === 'profit before income taxes' ||
                         nextLabelLower === 'income before tax' ||
                         nextLabelLower === 'net profit' ||
                         nextLabelLower === 'net income' ||
                         nextLabelLower === 'other comprehensive income' ||
                         nextLabelLower.includes('net cash flows from operating activities') ||
                         nextLabelLower.includes('net cash flows from investing activities') ||
                         nextLabelLower.includes('net cash flows from financing activities') ||
                         nextLabelLower.includes('net increase decrease in cash and cash equivalents') ||
                         (nextNode.hierarchy_level !== null && nextNode.hierarchy_level >= 3 && nextLabelLower.includes('total'));
      
      if (nextIsTotal) {
        // Add section break line BELOW this item (it's the last item before a subtotal)
        // More prominent if next item is a section boundary
        const nextIsFinalTotal = nextLabelLower.includes('total comprehensive income') || 
                                nextLabelLower === 'total assets' ||
                                nextLabelLower === 'total equity and liabilities' ||
                                nextLabelLower === 'total liabilities' ||
                                nextLabelLower.includes('net increase decrease in cash and cash equivalents');
        if (nextNode.isSectionBoundary) {
          borderBottomClass = nextIsFinalTotal ? 'border-b-2 border-gray-500' : 'border-b-2 border-gray-400';
        } else {
          borderBottomClass = nextIsFinalTotal ? 'border-b-2 border-gray-400' : 'border-b border-gray-300';
        }
      }
    }
    
    // Add subtle spacing after major section boundaries (universal, from hierarchy_level)
    // This creates visual separation between major sections without breaking the compact professional look
    if (node.isSectionBoundary && node.hierarchy_level === 4) {
      // Statement-level total: add spacing below
      spacingClass = 'mb-2';
    } else if (node.isSectionBoundary && node.hierarchy_level === 3) {
      // Section total: add subtle spacing below
      spacingClass = 'mb-1';
    }

    const rows: React.JSX.Element[] = [
      <tr 
        key={node.normalized_label}
        className={`${
          node.isHeader 
            ? 'bg-blue-50/30 border-t border-blue-200' 
            : isTotal 
              ? 'bg-gray-50 font-bold hover:bg-gray-100' 
              : 'hover:bg-gray-50'
        } ${borderTopClass} ${borderBottomClass} ${spacingClass}`}
      >
        <td 
          className={`px-4 py-3 text-sm sticky left-0 z-10 ${
            node.isHeader
              ? 'bg-blue-50/30 font-semibold text-blue-900 uppercase tracking-wide text-xs'
              : isTotal
                ? 'bg-gray-50 font-bold text-gray-900'
                : 'bg-white font-normal text-gray-900'
          }`}
          style={{ paddingLeft: `${16 + indent}px` }}
        >
          {depth > 0 && '  '}
          {node.label}
        </td>
        {years.map(y => {
          const isCurrentYear = y === year;
          return (
            <td 
              key={y}
              className={`px-4 py-3 text-sm text-right ${
                node.isHeader
                  ? 'bg-blue-50/30' // Header cells: just background, no text
                  : `font-mono ${
                      node.values[y] !== null && node.values[y]! < 0 
                        ? 'text-red-600' 
                        : 'text-gray-900'
                    } ${isTotal ? 'font-bold' : ''} ${
                      isCurrentYear ? 'bg-purple-100' : ''
                    }`
              }`}
            >
              {node.isHeader ? '' : formatNumber(node.values[y], node.unit)}
            </td>
          );
        })}
      </tr>
    ];

    // Add children rows - find their indices in the flat list
    node.children.forEach((child) => {
      const childIndex = flatNodeList.findIndex(n => n.normalized_label === child.normalized_label);
      rows.push(...renderTreeRow(child, depth + 1, flatNodeList, childIndex));
    });

    return rows;
  };

  // Render equity statement as matrix (rows=movements, columns=components)
  const renderEquityStatement = (title: string, items: StatementItem[], statementKey: string, unit: string) => {
    if (!items || items.length === 0) return null;

    const isExpanded = expandedSections.has(statementKey);
    
    // Group items by normalized_label (movement) and period_year
    // Extract values by equity_component (share_capital, treasury_shares, retained_earnings, other_reserves, NULL for total)
    const movementMap = new Map<string, Map<number, Map<string | null, number | null>>>(); // movement -> year -> component -> value
    
    items.forEach(item => {
      const movement = item.normalized_label;
      const year = item.period_year;
      const component = item.equity_component || null; // NULL for totals
      
      if (!movementMap.has(movement)) {
        movementMap.set(movement, new Map());
      }
      const yearMap = movementMap.get(movement)!;
      
      if (!yearMap.has(year)) {
        yearMap.set(year, new Map());
      }
      const componentMap = yearMap.get(year)!;
      
      // Headers have no values, but we still want to display them
      if (item.is_header) {
        // Headers don't have component breakdowns - set all components to null
        componentMap.set(null, null);
      } else {
        componentMap.set(component, item.value);
      }
    });
    
    // Define component order and labels
    const components = [
      { key: 'share_capital', label: 'Share capital' },
      { key: 'treasury_shares', label: 'Treasury shares' },
      { key: 'retained_earnings', label: 'Retained earnings' },
      { key: 'other_reserves', label: 'Other reserves' },
      { key: null, label: 'Total' }
    ];
    
    // Get unique movements sorted by presentation_order_index
    // CRITICAL: Must use the ACTUAL order_index from items, including headers
    const movements = Array.from(movementMap.keys())
      .map(movement => {
        // Find ANY item with this normalized_label (headers have order_index too)
        const firstItem = items.find(item => item.normalized_label === movement);
        // If no item found, try to find header
        const headerItem = items.find(item => item.normalized_label === movement && item.is_header);
        const itemToUse = firstItem || headerItem;
        return {
          normalized_label: movement,
          preferred_label: itemToUse?.preferred_label || humanizeLabel(movement, itemToUse?.concept_name || ''),
          order_index: itemToUse?.presentation_order_index ?? 999999,
          is_header: itemToUse?.is_header || false
        };
      })
      .sort((a, b) => {
        // Sort by order_index first, then by normalized_label for stability
        if (a.order_index !== b.order_index) {
          return a.order_index - b.order_index;
        }
        return a.normalized_label.localeCompare(b.normalized_label);
    });

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {fiscalYearEnd && (
              <p className="text-xs text-gray-500 mt-1">{formatFiscalYearEnd(fiscalYearEnd)}</p>
            )}
            {(() => {
              const scaleInfo = getUnitScale(items);
              const scaleLabel = scaleInfo.scale === 'billions' ? 'billions' : scaleInfo.scale === 'millions' ? 'millions' : 'thousands';
              return <p className="text-sm text-gray-600 mt-1">({scaleLabel} {scaleInfo.unit})</p>;
            })()}
          </div>
          <button
            onClick={() => {
              const newExpanded = new Set(expandedSections);
              if (isExpanded) {
                newExpanded.delete(statementKey);
              } else {
                newExpanded.add(statementKey);
              }
              setExpandedSections(newExpanded);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isExpanded ? '▼ Collapse' : '▶ Expand'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[200px] sticky left-0 bg-gray-50 z-10">
                    Movement
                  </th>
                  {years.map(y => (
                    <th 
                      key={y} 
                      colSpan={components.length} 
                      className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider border-l-2 border-gray-300"
                    >
                      {y}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[200px] sticky left-0 bg-gray-50 z-10">
                    {/* Empty header for movement column */}
                  </th>
                  {years.map(y => {
                    const isCurrentYear = y === year;
                    return (
                      components.map(comp => {
                        // Only highlight the Total column header for the current year
                        const shouldHighlight = isCurrentYear && comp.key === null;
                        return (
                          <th 
                            key={`${y}-${comp.key}`} 
                            className={`px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px] ${
                              shouldHighlight ? 'bg-purple-100' : ''
                            }`}
                          >
                            {comp.label}
                          </th>
                        );
                      })
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white">
                {movements.map((movement, idx) => {
                  const yearMap = movementMap.get(movement.normalized_label)!;
                  const isHeader = movement.is_header;
                  
                  return (
                    <tr 
                      key={movement.normalized_label} 
                      className={isHeader ? "bg-blue-50/30 border-t border-blue-200" : ""}
                    >
                      <td className={`px-4 py-3 text-left ${isHeader ? 'font-semibold text-blue-900 uppercase tracking-wider' : 'text-gray-900'} sticky left-0 bg-white z-10`}>
                        {movement.preferred_label}
                      </td>
                      {years.map(y => {
                        const isCurrentYear = y === year;
                        return (
                          components.map(comp => {
                            const componentMap = yearMap.get(y);
                            let value = componentMap?.get(comp.key) ?? null;
                            
                            // If Total column and no explicit total value, calculate by summing components
                            if (comp.key === null && value === null && componentMap) {
                              const componentKeys = ['share_capital', 'treasury_shares', 'retained_earnings', 'other_reserves'];
                              const sum = componentKeys.reduce((acc, key) => {
                                const compValue = componentMap.get(key);
                                return acc + (compValue !== null && compValue !== undefined ? compValue : 0);
                              }, 0);
                              value = sum !== 0 ? sum : null;
                            }
                            
                            // Only highlight the Total column for the current year
                            const shouldHighlight = isCurrentYear && comp.key === null;
                            
                            return (
                              <td 
                                key={`${y}-${comp.key}`} 
                                className={`px-4 py-3 text-right ${isHeader ? 'font-semibold text-blue-900' : 'text-gray-700'} ${
                                  shouldHighlight ? 'bg-purple-100' : ''
                                }`}
                              >
                                {isHeader ? '' : formatNumber(value, unit)}
                              </td>
                            );
                          })
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderStatement = (title: string, items: StatementItem[], statementKey: string, unit: string, hideTitle: boolean = false, showDate: boolean = true) => {
    if (!items || items.length === 0) return null;

    const isExpanded = expandedSections.has(statementKey);
    
    // For balance sheet: separate into assets (left) and liabilities_equity (right)
    if (statementKey === 'balance_sheet') {
      const assetsItems = items.filter(item => item.side === 'assets');
      const liabilitiesEquityItems = items.filter(item => item.side === 'liabilities_equity');
      
      const assetsTree = buildTree(assetsItems);
      const liabilitiesEquityTree = buildTree(liabilitiesEquityItems);
      const assetsFlatList = flattenTree(assetsTree);
      const liabilitiesEquityFlatList = flattenTree(liabilitiesEquityTree);
      
      return (
        <div className={hideTitle ? '' : 'bg-white rounded-lg shadow-md p-6 mb-6'}>
          {!hideTitle && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                {showDate && fiscalYearEnd && (
                  <p className="text-xs text-gray-500 mt-1">{formatFiscalYearEnd(fiscalYearEnd)}</p>
                )}
                {(() => {
                  const scaleInfo = getUnitScale(items);
                  const scaleLabel = scaleInfo.scale === 'billions' ? 'billions' : scaleInfo.scale === 'millions' ? 'millions' : 'thousands';
                  return <p className="text-sm text-gray-600 mt-1">({scaleLabel} {scaleInfo.unit})</p>;
                })()}
              </div>
              <button
                onClick={() => {
                  const newExpanded = new Set(expandedSections);
                  if (isExpanded) {
                    newExpanded.delete(statementKey);
                  } else {
                    newExpanded.add(statementKey);
                  }
                  setExpandedSections(newExpanded);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {isExpanded ? '▼ Collapse' : '▶ Expand'}
              </button>
            </div>
          )}
          
          {isExpanded && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Assets */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Assets</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[200px]">
                          Item
                        </th>
                        {years.map(y => {
                          const isCurrentYear = y === year;
                          return (
                            <th 
                              key={y} 
                              className={`px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px] ${
                                isCurrentYear ? 'bg-purple-100' : ''
                              }`}
                            >
                              {y}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {assetsTree.flatMap((node, index) => {
                        return renderTreeRow(node, 0, assetsFlatList, index);
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Right: Equity and Liabilities */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Equity and liabilities</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[200px]">
                          Item
                        </th>
                        {years.map(y => {
                          const isCurrentYear = y === year;
                          return (
                            <th 
                              key={y} 
                              className={`px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px] ${
                                isCurrentYear ? 'bg-purple-100' : ''
                              }`}
                            >
                              {y}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {liabilitiesEquityTree.flatMap((node, index) => {
                        return renderTreeRow(node, 0, liabilitiesEquityFlatList, index);
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    const tree = buildTree(items);
    // Pre-compute flattened list for efficient border detection
    const flatNodeList = flattenTree(tree);

    return (
      <div className={hideTitle ? '' : 'bg-white rounded-lg shadow-md p-6 mb-6'}>
        {!hideTitle && (
        <div className="flex items-center justify-between mb-4">
            <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              {showDate && fiscalYearEnd && (
                <p className="text-xs text-gray-500 mt-1">{formatFiscalYearEnd(fiscalYearEnd)}</p>
              )}
              {(() => {
                const scaleInfo = getUnitScale(items);
                const scaleLabel = scaleInfo.scale === 'billions' ? 'billions' : scaleInfo.scale === 'millions' ? 'millions' : 'thousands';
                return <p className="text-sm text-gray-600 mt-1">({scaleLabel} {scaleInfo.unit})</p>;
              })()}
            </div>
            <button
              onClick={() => {
                const newExpanded = new Set(expandedSections);
                if (isExpanded) {
                  newExpanded.delete(statementKey);
                } else {
                  newExpanded.add(statementKey);
                }
                setExpandedSections(newExpanded);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isExpanded ? '▼ Collapse' : '▶ Expand'}
            </button>
          </div>
        )}

        {isExpanded && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">
                    Item
                  </th>
                  {years.map(y => {
                    const isCurrentYear = y === year;
                    return (
                      <th 
                        key={y} 
                        className={`px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider min-w-[120px] ${
                          isCurrentYear ? 'bg-purple-100' : ''
                        }`}
                      >
                        {y}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white">
                {tree.flatMap((node, index) => {
                  return renderTreeRow(node, 0, flatNodeList, index);
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Loading financial statements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={loadStatements}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={loadStatements}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Load Financial Statements
        </button>
      </div>
    );
  }

  // Get common unit for each statement type
  const getCommonUnit = (items: StatementItem[]): string => {
    if (!items || items.length === 0) return 'USD';
    const units = items.map(i => i.unit).filter(u => u && u !== 'pure');
    const mostCommon = units.reduce((a, b, _, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b, units[0] || 'USD'
    );
    return mostCommon === 'pure' ? '%' : mostCommon;
  };

  // Render Income Statement and Comprehensive Income based on accounting standard
  const renderIncomeStatements = () => {
    const incomeUnit = getCommonUnit(data.income_statement);
    const comprehensiveIncome = data.comprehensive_income || [];
    const comprehensiveUnit = comprehensiveIncome.length > 0 ? getCommonUnit(comprehensiveIncome) : incomeUnit;

    if (accountingStandard === 'IFRS') {
      // IFRS: Side-by-side layout (Income Statement + Comprehensive Income)
      return (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Income statement and Statement of comprehensive income</h2>
                {fiscalYearEnd && (
                  <p className="text-xs text-gray-500 mt-1">{formatFiscalYearEnd(fiscalYearEnd)}</p>
                )}
                {(() => {
                  const scaleInfo = getUnitScale(data.income_statement);
                  const scaleLabel = scaleInfo.scale === 'billions' ? 'billions' : scaleInfo.scale === 'millions' ? 'millions' : 'thousands';
                  return <p className="text-sm text-gray-600 mt-1">({scaleLabel} {scaleInfo.unit})</p>;
                })()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Income Statement */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Income statement</h3>
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedSections);
                      if (expandedSections.has('income_statement')) {
                        newExpanded.delete('income_statement');
                      } else {
                        newExpanded.add('income_statement');
                      }
                      setExpandedSections(newExpanded);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {expandedSections.has('income_statement') ? '▼ Collapse' : '▶ Expand'}
                  </button>
                </div>
                {renderStatement('', data.income_statement, 'income_statement', incomeUnit, true)}
              </div>
              
              {/* Right: Statement of Comprehensive Income */}
              {comprehensiveIncome.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">Statement of comprehensive income</h3>
                    <button
                      onClick={() => {
                        const newExpanded = new Set(expandedSections);
                        if (expandedSections.has('comprehensive_income')) {
                          newExpanded.delete('comprehensive_income');
                        } else {
                          newExpanded.add('comprehensive_income');
                        }
                        setExpandedSections(newExpanded);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {expandedSections.has('comprehensive_income') ? '▼ Collapse' : '▶ Expand'}
                    </button>
                  </div>
                  {renderStatement('', comprehensiveIncome, 'comprehensive_income', comprehensiveUnit, true)}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // US-GAAP: Two separate statements
      return (
        <>
          {renderStatement('Income Statement', data.income_statement, 'income_statement', incomeUnit)}
          {comprehensiveIncome.length > 0 && renderStatement('Statement of Comprehensive Income', comprehensiveIncome, 'comprehensive_income', comprehensiveUnit)}
        </>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>{ticker} - {year}</strong> Financial Statements ({accountingStandard})
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Showing {years.join(', ')} | Total: {data.income_statement.length} income statement items, {data.comprehensive_income?.length || 0} comprehensive income items, {data.balance_sheet.length} balance sheet items, {data.cash_flow.length} cash flow items, {data.equity_statement?.length || 0} equity statement items
        </p>
      </div>

      {/* NEW ORDER: Income + Comprehensive Income, then Cash Flow, then Balance Sheet, then Equity */}
      {renderIncomeStatements()}
      {renderStatement('Cash Flow Statement', data.cash_flow, 'cash_flow', getCommonUnit(data.cash_flow))}
      {renderStatement('Balance Sheet', data.balance_sheet, 'balance_sheet', getCommonUnit(data.balance_sheet))}
      {data.equity_statement && data.equity_statement.length > 0 && 
        renderEquityStatement('Statement of Changes in Equity', data.equity_statement, 'equity_statement', getCommonUnit(data.equity_statement))}
    </div>
  );
}
