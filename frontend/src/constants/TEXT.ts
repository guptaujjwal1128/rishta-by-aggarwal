// ─── Home Page ───────────────────────────────────────────────────────────────

const HOME_TEXT = {
  // Header
  header: {
    brandName: "Rishta by Aggarwal",
    login: "Login",
    joinNow: "Join Now",
  },

  // Banner / Hero section
  banner: {
    heading: "Find Your Perfect Match with Trust and Care",
    subheading:
      "Connecting hearts within the Aggarwal community for a lifetime of happiness.",
    cta: "Join Now",
  },

  // How It Works section
  howItWorks: {
    sectionTitle: "How It Works",
    cards: [
      {
        title: "Create Profile",
        description: "Sign up and build your detailed profile to get started.",
      },
      {
        title: "Connect and Match",
        description: "Receive and browse profiles curated just for you.",
      },
      {
        title: "Start Your Journey",
        description: "Begin conversations with matches and find your partner.",
      },
    ],
  },

  // Pricing Plans section
  pricingPlans: {
    sectionTitle: "Our Pricing Plans",
    mostPopularLabel: "Most Popular",
    plans: [
      {
        title: "Basic",
        price: 29,
        isMostPopular: false,
        features: [
          { text: "50 Verified Contacts", isAvailable: true },
          { text: "Basic Search Filters", isAvailable: true },
          { text: "Astrology Report", isAvailable: false },
        ],
      },
      {
        title: "Standard",
        price: 49,
        isMostPopular: true,
        features: [
          { text: "150 Verified Contacts", isAvailable: true },
          { text: "Advanced Search Filters", isAvailable: true },
          { text: "Astrology Report", isAvailable: true },
        ],
      },
      {
        title: "Premium",
        price: 79,
        isMostPopular: false,
        features: [
          { text: "Unlimited Contacts", isAvailable: true },
          { text: "Personalized Support", isAvailable: true },
          { text: "Couple Counselling Session", isAvailable: true },
        ],
      },
    ],
  },
  // Success Stories section
  successStories: {
    sectionTitle: "Success Stories",
    viewAllLabel: "View All Stories →",
    stories: [
      {
        quote:
          "We found each other thanks to this platform. It felt safe and genuine from the start. Highly recommended!",
        name: "Priya & Rohan",
        initials: "PR",
      },
      {
        quote:
          "The community filters helped us find someone with real peace of mind. We're getting married next year!",
        name: "Anjali & Vikram",
        initials: "AV",
      },
      {
        quote:
          "A truly trustworthy platform. The verified profiles gave us confidence throughout the entire journey.",
        name: "Sneha & Karan",
        initials: "SK",
      },
    ],
  },
};

export const TEXT = {
  ...HOME_TEXT,
};
