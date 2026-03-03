// External
import { alpha, Box, Divider } from "@mui/material";

// Internal
import { PageContainer, PageContent } from "../../styles/Layout.styled";
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
    <PageContainer>
      <PageContent component="header" sx={{ py: 1, px: 2 }}>
        <Header />
      </PageContent>
      <PageContent>
        <Divider />
      </PageContent>
      <Box component="main">
        <PageContent component="section" sx={{ p: { xs: 2, sm: 0 } }}>
          <Banner />
        </PageContent>
        <PageContent
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <HowItWorks />
        </PageContent>
        <PageContent
          component="section"
          sx={(theme) => ({
            py: { xs: 4, sm: 6 },
            px: { xs: 2, sm: 4 },
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          })}
        >
          <PricingPlans />
        </PageContent>
        <PageContent
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <SuccessStories />
        </PageContent>
        <PageContent
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <WhyChooseUs />
        </PageContent>
        <PageContent
          component="section"
          sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
        >
          <FAQ />
        </PageContent>
      </Box>
      <PageContent
        component="footer"
        sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
      >
        <Footer />
      </PageContent>
    </PageContainer>
  );
};

export default Home;
