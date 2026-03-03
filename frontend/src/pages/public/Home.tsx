// External
import { alpha, Divider } from "@mui/material";

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
  return (
    <ContentContainer>
      <Content component="header" sx={{ py: 1, px: 2 }}>
        <Header />
      </Content>
      <Content>
        <Divider />
      </Content>
      <ContentContainer component="main">
        <Content noMaxWidth component="section" sx={{ p: { xs: 2, sm: 0 } }}>
          <Banner />
        </Content>
        <Content
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <HowItWorks />
        </Content>
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
        <Content
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <SuccessStories />
        </Content>
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
        <Content
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <FAQ />
        </Content>
      </ContentContainer>
      <ContentContainer
        component="footer"
        sx={(theme) => ({
          backgroundColor: theme.palette.background.tertiary,
        })}
      >
        <Content sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}>
          <Footer />
        </Content>
      </ContentContainer>
    </ContentContainer>
  );
};

export default Home;
