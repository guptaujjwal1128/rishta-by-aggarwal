// Home
import hero from "../assets/home/hero.webp";
import howItWorks1 from "../assets/home/howItWorks1.webp";
import howItWorks2 from "../assets/home/howItWorks2.webp";
import howItWorks3 from "../assets/home/howItWorks3.webp";
import pricingTick from "../assets/home/pricingPlanIconTick.webp";
import pricingCross from "../assets/home/pricingPlanIconCross.webp";
import successStory1 from "../assets/home/success_story_1.webp";
import successStory2 from "../assets/home/success_story_2.webp";
import successStory3 from "../assets/home/success_story_3.webp";
import WhyChooseUs1 from "../assets/home/whyChooseUs1.webp";
import WhyChooseUs2 from "../assets/home/whyChooseUs2.webp";
import WhyChooseUs3 from "../assets/home/whyChooseUs3.webp";
import WhyChooseUs4 from "../assets/home/whyChooseUs4.webp";
import WhyChooseUs5 from "../assets/home/whyChooseUs5.webp";
import WhyChooseUs6 from "../assets/home/WhyChooseUs6.webp";
export const ASSETS = {
  home: {
    hero,
    howItWorks: [howItWorks1, howItWorks2, howItWorks3],
    pricing: {
      tick: pricingTick,
      cross: pricingCross,
    },
    successStories: [successStory1, successStory2, successStory3],
    whyChooseUs: [
      WhyChooseUs1,
      WhyChooseUs2,
      WhyChooseUs3,
      WhyChooseUs4,
      WhyChooseUs5,
      WhyChooseUs6,
    ],
  },
  common: {
    banner: "/favicon.png",
  },
} as const;
