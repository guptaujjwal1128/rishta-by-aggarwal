// Home
import banner from "../assets/banner.png";
import hero from "../assets/home/hero.png";
import howItWorks1 from "../assets/home/howItWorks1.png";
import howItWorks2 from "../assets/home/howItWorks2.png";
import howItWorks3 from "../assets/home/howItWorks3.png";
import pricingTick from "../assets/home/pricingPlanIconTick.png";
import pricingCross from "../assets/home/pricingPlanIconCross.png";
import successStory1 from "../assets/home/success_story_1.png";
import successStory2 from "../assets/home/success_story_2.png";
import successStory3 from "../assets/home/success_story_3.png";
import WhyChooseUs1 from "../assets/home/WhyChooseUs1.png";
import WhyChooseUs2 from "../assets/home/WhyChooseUs2.png";
import WhyChooseUs3 from "../assets/home/WhyChooseUs3.png";
import WhyChooseUs4 from "../assets/home/WhyChooseUs4.png";
import WhyChooseUs5 from "../assets/home/WhyChooseUs5.png";
import WhyChooseUs6 from "../assets/home/WhyChooseUs6.png";
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
    banner,
  },
} as const;
