export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  CONVERTED: 'Converted',
  LOST: 'Lost',
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export const STATUS_COLORS: Record<LeadStatus, { bg: string; text: string }> = {
  [LEAD_STATUS.NEW]: { bg: 'bg-blue-100', text: 'text-blue-800' },
  [LEAD_STATUS.CONTACTED]: { bg: 'bg-amber-100', text: 'text-amber-800' },
  [LEAD_STATUS.QUALIFIED]: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  [LEAD_STATUS.CONVERTED]: { bg: 'bg-teal-100', text: 'text-teal-800' },
  [LEAD_STATUS.LOST]: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const STATUS_ORDER: LeadStatus[] = [
  LEAD_STATUS.NEW,
  LEAD_STATUS.CONTACTED,
  LEAD_STATUS.QUALIFIED,
  LEAD_STATUS.CONVERTED,
  LEAD_STATUS.LOST,
];

export interface Lead {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  notes?: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LeadsApiResponse {
  success: boolean;
  data: Lead[];
  pagination: ApiPagination;
}

export interface StatsData {
  total: number;
  byStatus: Record<LeadStatus, number>;
  conversionRate: string;
}

export interface StatsApiResponse {
  success: boolean;
  data: StatsData;
}
