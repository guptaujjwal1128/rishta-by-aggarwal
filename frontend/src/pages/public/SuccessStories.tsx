// External
import { Divider } from "@mui/material";

// Internal
import { PageContainer, PageContent } from "../../styles/Layout.styled";
import Header from "../../components/molecule/layout/header/Header";
import Footer from "../../components/molecule/layout/footer/Footer";
import SuccessStoriesMolecule from "../../components/molecule/advertisement/success-stories/SuccessStories";

const SuccessStories = () => {
  return (
    <PageContainer>
      <PageContent component="header" sx={{ py: 1, px: 2 }}>
        <Header />
      </PageContent>
      <PageContent>
        <Divider />
      </PageContent>
      <PageContent
        component="main"
        sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
      >
        <SuccessStoriesMolecule />
      </PageContent>
      <PageContent
        component="footer"
        sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
      >
        <Footer />
      </PageContent>
    </PageContainer>
  );
};

export default SuccessStories;
