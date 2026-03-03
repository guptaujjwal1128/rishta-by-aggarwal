// External
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

export interface FAQCardProps {
  question: string;
  answer: string;
}

const FAQCard = ({ question, answer }: FAQCardProps) => {
  return (
    <Accordion
      sx={(theme) => ({
        backgroundColor: "background.tertiary",
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.spacing(4),
        px: { xs: 1, md: 2 },
        py: { xs: 0.5, md: 1 },
        "&:first-of-type": {
          borderTopLeftRadius: theme.spacing(4),
          borderTopRightRadius: theme.spacing(4),
        },
        "&:last-of-type": {
          borderBottomLeftRadius: theme.spacing(4),
          borderBottomRightRadius: theme.spacing(4),
        },
      })}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMore
            sx={{
              color: "text.primary",
            }}
          />
        }
      >
        <Typography variant="body1Bold">{question}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary">
          {answer}
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default FAQCard;
