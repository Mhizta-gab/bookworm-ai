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
      "Upload your first PDFs",
      "Voice chat with each book",
      "Personal reading library",
      "Core summaries and notes",
    ],
    cta: "Start reading",
    muted: false,
  },
  {
    label: "For serious learners",
    price: "$9",
    subprice: "/month /user",
    accent: "pricingBlue",
    features: [
      "More uploads and longer sessions",
      "Deeper chapter breakdowns",
      "Saved highlights and memory",
      "Priority support",
    ],
    cta: "Upgrade",
    muted: false,
  },
  {
    label: "For schools and teams",
    price: "$29",
    subprice: "/month /user",
    accent: "pricingCoral",
    features: [
      "Shared libraries",
      "Admin controls",
      "Group access and roles",
      "Collaborative study workflows",
    ],
    cta: "Coming soon",
    muted: true,
  },
] as const;
