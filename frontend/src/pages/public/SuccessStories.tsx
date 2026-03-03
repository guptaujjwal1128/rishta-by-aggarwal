// External
import { Divider } from "@mui/material";

// Internal
import { ContentContainer, Content } from "../../styles/Layout.styled";
import Header from "../../components/molecule/layout/header/Header";
import Footer from "../../components/molecule/layout/footer/Footer";
import SuccessStories from "../../components/molecule/advertisement/success-stories/SuccessStories";

const SuccessStoriesPage = () => {
  return (
    <ContentContainer>
      <Content component="header" sx={{ py: 1, px: 2 }}>
        <Header />
      </Content>
      <Content>
        <Divider />
      </Content>
      <Content
        component="main"
        sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
      >
        <SuccessStories />
      </Content>
      <Content
        component="footer"
        sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
      >
        <Footer />
      </Content>
    </ContentContainer>
  );
};

export default SuccessStoriesPage;
