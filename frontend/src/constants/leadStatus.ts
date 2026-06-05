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

export const CONTACT_SOURCES = ['Referral', 'Website', 'LinkedIn', 'Cold Call', 'Email', 'Event', 'Other'] as const;
export type ContactSource = (typeof CONTACT_SOURCES)[number];

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: ContactSource;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  source: ContactSource;
  notes?: string;
}

export interface ContactsApiResponse {
  success: boolean;
  data: Contact[];
  pagination: ApiPagination;
}

export const DEAL_STAGES = ['Qualification', 'Demo', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const STAGE_COLORS: Record<DealStage, string> = {
  'Qualification': 'bg-blue-100 text-blue-800',
  'Demo': 'bg-amber-100 text-amber-800',
  'Proposal': 'bg-purple-100 text-purple-800',
  'Negotiation': 'bg-orange-100 text-orange-800',
  'Closed Won': 'bg-emerald-100 text-emerald-800',
  'Closed Lost': 'bg-red-100 text-red-800',
};

export interface Deal {
  _id: string;
  title: string;
  value: number;
  stage: DealStage;
  contact: { _id: string; name: string; email: string; company: string } | string;
  notes: string;
  expectedCloseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealFormData {
  title: string;
  value: number;
  stage: DealStage;
  contact: string;
  notes?: string;
  expectedCloseDate: string;
}

export interface DealsApiResponse {
  success: boolean;
  data: Deal[];
  pagination: ApiPagination;
}

export interface DealStats {
  total: number;
  byStage: Record<DealStage, number>;
  totalValue: number;
}

export interface DealStatsApiResponse {
  success: boolean;
  data: DealStats;
}

export const TASK_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ['Pending', 'In Progress', 'Completed'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
}

export interface TasksApiResponse {
  success: boolean;
  data: Task[];
  pagination: ApiPagination;
}
