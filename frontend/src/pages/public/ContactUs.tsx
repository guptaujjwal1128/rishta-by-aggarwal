// Internal
import { ContentContainer, Content } from "../../styles/Layout.styled";
import Header from "../../components/molecule/layout/header/Header";
import Footer from "../../components/molecule/layout/footer/Footer";

const ContactUs = () => {
  // Form State
  return (
    <ContentContainer>
      {/* header */}
      <Content>
        <Header />
      </Content>
      {/* Main Content */}
      <ContentContainer component="main"></ContentContainer>
      {/* footer */}
      <Content noMaxWidth>
        <Footer />
      </Content>
    </ContentContainer>
  );
};

export default ContactUs;
