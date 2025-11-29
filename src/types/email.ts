export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  tier: 1 | 2 | 3;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'archived' | 'deleted';
  hasAttachments: boolean;
}

export interface Draft {
  id: string;
  emailId: string;
  content: string;
  tone: string;
  confidence: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
}

export interface Stats {
  total: number;
  tier1: number;
  tier2: number;
  tier3: number;
  drafts: number;
  unprocessed: number;
}
