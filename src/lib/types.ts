export interface AgentConfig {
  businessName: string;
  businessDescription: string;
  agentName: string;
  tone: "formal" | "friendly" | "casual" | "adaptive";
  greeting: string;
  knowledgeTexts: { filename: string; content: string }[];
  contactInfo: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  agentConfig: AgentConfig;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  businessName: "My Business",
  businessDescription: "We provide great products and services.",
  agentName: "Alex",
  tone: "friendly",
  greeting:
    "Hi there! 👋 I'm Alex, your virtual assistant. How can I help you today?",
  knowledgeTexts: [],
  contactInfo: "@bo_mirash",
};

export const PRESET_DEMOS: Record<string, AgentConfig> = {
  "nail-salon": {
    businessName: "Glamour Nails Studio",
    businessDescription: "Premium nail salon offering manicure, pedicure, gel, and nail art services.",
    agentName: "Sophie",
    tone: "friendly",
    greeting: "Hi there! 👋 I'm Sophie from Glamour Nails. Looking to book an appointment or have questions about our services?",
    knowledgeTexts: [
      {
        filename: "price-list.txt",
        content: `Services & Pricing:
• Classic Manicure — $35
• Gel Manicure — $55
• Classic Pedicure — $45
• Gel Pedicure — $65
• Nail Extensions (Acrylic) — $80
• Nail Extensions (Gel) — $90
• Nail Art — from $5/nail
• Polish Removal — $15
• Dip Powder — $60

Working Hours: Mon-Sat 9am-8pm, Sun 10am-6pm
Location: 123 Beauty Ave, Suite 4`,
      },
    ],
    contactInfo: "@bo_mirash",
  },
  clinic: {
    businessName: "ClearView Dental",
    businessDescription: "Modern dental clinic offering general dentistry, cosmetic procedures, and orthodontics.",
    agentName: "Anna",
    tone: "formal",
    greeting: "Hello! 👋 I'm Anna, your virtual assistant at ClearView Dental. How can I help you today?",
    knowledgeTexts: [
      {
        filename: "services.txt",
        content: `Services & Pricing:
• General Consultation — $150
• Dental Cleaning — $200
• Teeth Whitening — $450
• Dental Crown — from $900
• Root Canal — from $700
• Invisalign Consultation — Free
• Dental Implant — from $2,500
• Emergency Visit — $250

Working Hours: Mon-Fri 8am-6pm, Sat 9am-2pm
Insurance: We accept most major dental insurance plans.`,
      },
    ],
    contactInfo: "@bo_mirash",
  },
  realty: {
    businessName: "Prime Realty Group",
    businessDescription: "Full-service real estate agency specializing in residential properties.",
    agentName: "Max",
    tone: "friendly",
    greeting: "Hey! 👋 I'm Max from Prime Realty. Looking to buy, sell, or just exploring? I'm here to help!",
    knowledgeTexts: [
      {
        filename: "services.txt",
        content: `Services:
• Free Property Valuation
• Buyer Representation — 2.5% commission
• Seller Representation — 3% commission
• Rental Search — 1 month rent fee
• Mortgage Pre-Approval Assistance — Free
• Virtual Home Tours — Available 24/7

Areas: Downtown, Suburbs, Waterfront Properties
Average response time: Under 1 hour`,
      },
    ],
    contactInfo: "@bo_mirash",
  },
  school: {
    businessName: "FluentPath Academy",
    businessDescription: "Online language school offering English courses for all levels.",
    agentName: "Kate",
    tone: "friendly",
    greeting: "Hi! 👋 I'm Kate from FluentPath Academy. Interested in improving your English? Let me help you find the right course!",
    knowledgeTexts: [
      {
        filename: "courses.txt",
        content: `Courses & Pricing:
• General English (Group) — $149/month
• General English (1-on-1) — $249/month
• Business English — $299/month
• IELTS Preparation — $349/month
• Conversational Practice — $99/month
• Kids English (7-12) — $129/month

Trial Lesson: Free (30 minutes)
Schedule: Flexible, 7 days a week
Platform: Zoom / Google Meet`,
      },
    ],
    contactInfo: "@bo_mirash",
  },
  catering: {
    businessName: "Golden Table Catering",
    businessDescription: "Premium catering service for events, weddings, and corporate functions.",
    agentName: "Laura",
    tone: "friendly",
    greeting: "Hello! 👋 I'm Laura from Golden Table Catering. Planning an event? Let me help you create the perfect menu!",
    knowledgeTexts: [
      {
        filename: "packages.txt",
        content: `Catering Packages:
• Cocktail Reception — $25/person (min 30 guests)
• Buffet Style — $45/person (min 20 guests)
• Plated Dinner — $65/person (min 15 guests)
• Wedding Package — $85/person (min 50 guests)
• Corporate Lunch — $30/person (min 10 guests)

Includes: Setup, service staff, cleanup
Dietary options: Vegetarian, Vegan, Gluten-free, Halal, Kosher
Booking: Minimum 2 weeks in advance`,
      },
    ],
    contactInfo: "@bo_mirash",
  },
};
