// NPM

// Local
import { PageContainer, PageContent } from "../../styles/Layout.styled";

import Header from "../../components/molecule/layout/header/Header";
import Footer from "../../components/molecule/layout/footer/Footer";
import Banner from "../../components/molecule/advertisement/banner/Banner";
import HowItWorks from "../../components/molecule/advertisement/how-it-works/HowItWorks";
import PricingPlans from "../../components/molecule/advertisement/pricing-plans/PricingPlans";
import SuccessStories from "../../components/molecule/advertisement/success-stories/SuccessStories";
import WhyChooseUs from "../../components/molecule/advertisement/why-choose-us/WhyChooseUs";
import FAQ from "../../components/molecule/advertisement/faq/FAQ";
import { Divider } from "@mui/material";

const Home = () => {
  return (
    <PageContainer>
      <PageContent>
        <Header />
      </PageContent>
      <PageContent noMaxWidth>
        <Divider />
        <Banner />
      </PageContent>
      <HowItWorks />
      <PricingPlans />
      <SuccessStories />
      <WhyChooseUs />
      <FAQ />
      <Footer />
    </PageContainer>
  );
};

export default Home;
