// Shared FinSight types, used by the page shell and the view components.

export interface Company {
  ticker: string;
  name: string;
  years: number[];
  years_detail?: Array<{
    year: number;
    quarters?: number[];
    filing_types?: string[];
    reporting_frequencies?: string[];
  }>;
}

export interface QuotaInfo {
  custom_requests_used: number;
  custom_requests_limit: number;
  quota_available: boolean;
  message: string;
}

export interface FinancialMetric {
  value: number | null;
  unit: string;
  period_end: string | null;
  statement_type?: string;
  hierarchy_level?: number | null;
}

export interface AnalysisResult {
  company: string;
  year: number;
  metrics: Record<string, FinancialMetric>;
  fact_count: number;
  processing_time: number;
  source: 'preloaded' | 'custom';
}
