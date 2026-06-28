export const tickerRows = [
  {
    tone: "tickerCoral",
    items: [
      "Upload PDFs",
      "Voice Conversations",
      "Instant Summaries",
      "Personal Library",
      "Upload PDFs",
      "Voice Conversations",
      "Instant Summaries",
      "Personal Library",
    ],
  },
  {
    tone: "tickerBlue",
    items: [
      "Ask Any Chapter",
      "Study Faster",
      "Remember More",
      "Read On The Go",
      "Ask Any Chapter",
      "Study Faster",
      "Remember More",
      "Read On The Go",
    ],
  },
  {
    tone: "tickerGold",
    items: [
      "Book Insights",
      "Progress Tracking",
      "Audio Answers",
      "No More Skimming",
      "Audio Answers",
      "Book Insights",
      "Progress Tracking",
      "No More Skimming",
    ],
  },
] as const;

export const testimonialCards = [
  {
    brand: "Lit Circle",
    text: "Bookworm AI helps me turn dense reading into a conversation, so I actually finish and retain what I upload.",
    name: "Remi Lawson",
    role: "Growth Lead",
  },
  {
    brand: "actiondesk",
    text: "Instead of hunting through notes and PDFs, I ask the book directly and get the answer in seconds.",
    name: "Louisa Adam",
    role: "Chief of Staff",
  },
  {
    brand: "Northvale",
    text: "Our team uses Bookworm AI to break down research docs quickly before meetings. It saves a surprising amount of time.",
    name: "Lauren Patou",
    role: "Head of Product",
  },
  {
    brand: "Staycation",
    text: "I upload long reads on Sunday, then listen and ask questions through the week. It fits around real life.",
    name: "Matthew Dugan",
    role: "Co-founder",
  },
  {
    brand: "Unflow",
    text: "Between classes and commute time, the voice flow is what makes this stick. It feels closer to a tutor than a reader.",
    name: "Romy Lynch",
    role: "Founder",
  },
  {
    brand: "trusty",
    text: "Uploading a book and speaking to it is the first AI reading experience that feels natural instead of gimmicky.",
    name: "Edward Pierce",
    role: "Engineering Lead",
  },
] as const;

export const pricingTiers = [
  {
    label: "For curious readers",
    price: "FREE",
    subprice: "",
    accent: "pricingGreen",
    features: [
      "15 voice minutes per month",
      "Upload your first PDFs",
      "Personal reading library",
      "Core summaries and notes",
    ],
    cta: "Start reading",
    muted: false,
  },
  {
    label: "For serious learners",
    price: "$12",
    subprice: "/month",
    accent: "pricingBlue",
    features: [
      "120 voice minutes per month",
      "15 interactive reading sessions",
      "Deeper chapter breakdowns",
      "Saved highlights and memory",
    ],
    cta: "Upgrade",
    muted: false,
  },
  {
    label: "Pro power reader",
    price: "$29",
    subprice: "/month",
    accent: "pricingCoral",
    features: [
      "450 voice minutes per month",
      "45 interactive reading sessions",
      "Extended 30-min voice sessions",
      "Priority AI response models",
    ],
    cta: "Upgrade",
    muted: false,
  },
] as const;
