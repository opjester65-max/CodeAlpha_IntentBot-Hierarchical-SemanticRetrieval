export enum IntentCategory {
  ENROLLMENT = 'Enrollment',
  PAYMENT = 'Payment',
  TECHNICAL_SUPPORT = 'Technical Support',
  COURSE_CONTENT = 'Course Content',
  GREETING = 'Greeting',
  UNKNOWN = 'Unknown/OOS'
}

export interface FAQItem {
  question: string;
  answer: string;
  intent: IntentCategory;
}

export interface IntentAnalysisResult {
  intent: string;
  confidence: number;
  answer: string | null;
  reasoning: string;
  suggestedSearchQuery?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  intent?: string;
  confidence?: number;
  isOOS?: boolean;
  suggestedSearchQuery?: string;
  searchResults?: Array<{
    title: string;
    url: string;
  }>;
}
