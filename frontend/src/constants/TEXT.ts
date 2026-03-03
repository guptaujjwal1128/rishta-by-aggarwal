import { AppRoutes } from "./routes";

const HEADER_TEXT = {
  brandName: "Rishta by Aggarwal",
  login: "Login",
  joinNow: "Join Now",
};

const FOOTER_TEXT = {
  brandName: "Rishta by Aggarwal",
  tagline: "Your trusted partner in the journey to find a lifelong companion.",
  links: [
    { label: "Contact", path: AppRoutes.CONTACT },
    { label: "Contact", path: AppRoutes.CONTACT },
    { label: "Contact", path: AppRoutes.CONTACT },
    { label: "Contact", path: AppRoutes.CONTACT },
  ],
  copyright: "© 2024 Rishta by Aggarwal. All Rights Reserved.",
};

const HOME_TEXT = {
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
      },
      {
        quote:
          "The community filters helped us find someone with real peace of mind. We're getting married next year!",
        name: "Anjali & Vikram",
      },
      {
        quote:
          "A truly trustworthy platform. The verified profiles gave us confidence throughout the entire journey.",
        name: "Sneha & Karan",
      },
    ],
  },
  // Why Choose Us section
  whyChooseUs: {
    sectionTitle: "Why Choose Us?",
    cards: [
      {
        title: "100% Verified Profiles",
        description:
          "Every profile is manually screened for your safety and peace of mind.",
      },
      {
        title: "Secure & Private",
        description:
          "Your privacy is our priority. Control who sees your information.",
      },
      {
        title: "Advanced Matching",
        description:
          "Our smart algorithm helps you find the most compatible partners.",
      },
      {
        title: "Community Filters",
        description:
          "Find matches within the Aggarwal community with specific preferences.",
      },
      {
        title: "Dedicated Support",
        description:
          "Our team is here to assist you at every step of your journey.",
      },
      {
        title: "Couple Counselling",
        description:
          "Professional guidance to help you and your partner build a strong foundation.",
      },
    ],
  },

  // FAQ section
  faq: {
    sectionTitle: "Frequently Asked Questions",
    questions: [
      {
        question: "How do I create a profile?",
        answer:
          'Simply click on "Join Now", fill in your details, and follow the on-screen instructions to build a complete and attractive profile.',
      },
      {
        question: "Is my information safe?",
        answer:
          "Yes, we use advanced security measures to protect your data and ensure your privacy is never compromised.",
      },
      {
        question: "How are profiles verified?",
        answer:
          "Every profile is manually reviewed by our team. We may also request documentation to verify identity and community status.",
      },
      {
        question: "Can I use the service for free?",
        answer:
          "Yes, we offer a basic plan for free. You can upgrade to a premium plan for more features and better matching.",
      },
      {
        question: "What is Vastu & Astrological guidance?",
        answer:
          "We provide optional guidance based on traditional values for those who seek compatibility beyond just profiles.",
      },
    ],
  },
};

export const TEXT = {
  header: HEADER_TEXT,
  home: HOME_TEXT,
  footer: FOOTER_TEXT,
};
