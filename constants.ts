import { FAQItem, IntentCategory } from './types';

export const INTENT_THRESHOLD = 0.65;

export const KNOWLEDGE_BASE: FAQItem[] = [
  // Enrollment
  {
    question: "How do I enroll in a new course?",
    answer: "You can enroll by navigating to the 'Catalog' tab, selecting your desired course, and clicking the 'Enroll Now' button.",
    intent: IntentCategory.ENROLLMENT
  },
  {
    question: "What is the deadline for dropping a class?",
    answer: "The drop deadline is 14 days after the course start date. You will receive a full refund if dropped within this window.",
    intent: IntentCategory.ENROLLMENT
  },
  {
    question: "Can I audit a course?",
    answer: "Yes, auditing is available for most courses. Select 'Audit Mode' during the checkout process.",
    intent: IntentCategory.ENROLLMENT
  },
  
  // Payment
  {
    question: "What payment methods do you accept?",
    answer: "We accept Visa, Mastercard, American Express, PayPal, and direct bank transfers.",
    intent: IntentCategory.PAYMENT
  },
  {
    question: "How can I get a receipt for my payment?",
    answer: "Receipts are automatically emailed to you upon purchase. You can also download them from your 'Billing History' page.",
    intent: IntentCategory.PAYMENT
  },
  {
    question: "Do you offer student discounts?",
    answer: "Yes, verified students receive a 20% discount. Please upload your student ID in the profile settings to apply.",
    intent: IntentCategory.PAYMENT
  },

  // Technical Support
  {
    question: "I cannot reset my password.",
    answer: "Please ensure you are using the email associated with your account. If you don't receive the reset link within 5 minutes, check your spam folder.",
    intent: IntentCategory.TECHNICAL_SUPPORT
  },
  {
    question: "The video player is not loading.",
    answer: "Try clearing your browser cache or disabling ad-blockers. If the issue persists, try a different browser like Chrome or Firefox.",
    intent: IntentCategory.TECHNICAL_SUPPORT
  },
  {
    question: "Where can I download the mobile app?",
    answer: "The Alpha-Assist app is available on both the Apple App Store and Google Play Store under 'Alpha Learning'.",
    intent: IntentCategory.TECHNICAL_SUPPORT
  },

  // Course Content
  {
    question: "Are the certificates accredited?",
    answer: "Our professional certificates are industry-recognized but are not equivalent to a university degree.",
    intent: IntentCategory.COURSE_CONTENT
  },
  {
    question: "How long do I have access to the course materials?",
    answer: "You have lifetime access to all course materials for any course you have purchased.",
    intent: IntentCategory.COURSE_CONTENT
  }
];

export const SYSTEM_INSTRUCTION = `
You are the Alpha-Assist Intent Bot. Your goal is to strictly classify user queries based on a provided Knowledge Base (FAQs) and retrieve the correct answer.

Adhere to this Hierarchical Intent Logic:
1.  **Analyze**: Compare the user's input semantic meaning against the provided FAQ Intents.
2.  **Classify**: specificy the 'intent' (e.g., Enrollment, Payment).
3.  **Score**: Assign a confidence score (0.0 to 1.0) based on how closely the query matches a known FAQ topic.
4.  **Retrieve**: If confidence is >= ${INTENT_THRESHOLD}, return the exact 'answer' from the matched FAQ.
5.  **Fallback**: If confidence is < ${INTENT_THRESHOLD} (Out-of-Scope), set 'answer' to null and provide a 'suggestedSearchQuery' optimized for Google Search.

Do NOT hallucinate answers not in the KB. If in doubt, lower the confidence score.

Here is the Knowledge Base:
${JSON.stringify(KNOWLEDGE_BASE)}
`;
