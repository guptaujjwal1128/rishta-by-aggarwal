// External
import { alpha } from "@mui/material";

// Internal
import { ContentContainer, Content } from "../../styles/Layout.styled";
import Header from "../../components/molecule/layout/header/Header";
import Footer from "../../components/molecule/layout/footer/Footer";
import Banner from "../../components/molecule/advertisement/banner/Banner";
import HowItWorks from "../../components/molecule/advertisement/how-it-works/HowItWorks";
import PricingPlans from "../../components/molecule/advertisement/pricing-plans/PricingPlans";
import SuccessStories from "../../components/molecule/advertisement/success-stories/SuccessStories";
import WhyChooseUs from "../../components/molecule/advertisement/why-choose-us/WhyChooseUs";
import FAQ from "../../components/molecule/advertisement/faq/FAQ";

const Home = () => {
  // FAQ state
  return (
    <ContentContainer>
      {/* header */}
      <Content noMaxWidth>
        <Header />
      </Content>
      <ContentContainer component="main">
        {/* banner */}
        <Content noMaxWidth component="section" sx={{ p: { xs: 2, sm: 0 } }}>
          <Banner />
        </Content>
        {/* how it works */}
        <Content
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <HowItWorks />
        </Content>
        {/* pricing plans */}
        <ContentContainer
          component="section"
          sx={(theme) => ({
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          <Content sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}>
            <PricingPlans />
          </Content>
        </ContentContainer>
        {/* success stories */}
        <Content
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <SuccessStories />
        </Content>
        {/* why choose us */}
        <ContentContainer
          component="section"
          sx={(theme) => ({
            backgroundColor: alpha(theme.palette.tertiary.main, 0.1),
          })}
        >
          <Content sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}>
            <WhyChooseUs />
          </Content>
        </ContentContainer>
        {/* faq */}
        <Content
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <FAQ />
        </Content>
      </ContentContainer>
      {/* footer */}
      <Content noMaxWidth>
        <Footer />
      </Content>
    </ContentContainer>
  );
};

export default Home;
