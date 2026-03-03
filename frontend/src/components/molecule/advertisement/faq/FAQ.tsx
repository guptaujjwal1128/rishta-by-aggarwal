// External
import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

// Internal
import { TEXT } from "../../../../constants/TEXT";
import { Center } from "../../../../styles/Layout.styled";
import FAQCard from "./FAQCard";

const {
  home: { faq },
} = TEXT;

const FAQ = () => {
  return (
    <Center sx={{ flexDirection: "column", gap: 3 }}>
      <Typography
        variant="h3"
        component="h2"
        textAlign="center"
        color="text.primary"
      >
        {faq.sectionTitle}
      </Typography>
      <Stack sx={{ maxWidth: "md", width: "100%", gap: 2 }}>
        {faq.questions.map((item) => (
          <FAQCard key={item.question} {...item} />
        ))}
      </Stack>
    </Center>
  );
};

export default FAQ;
