// External
import { Box, Stack, Typography } from "@mui/material";

// Internal
import HowItWorksCard from "./HowItWorksCard";
import howItWorks1 from "../../../../assets/home/howItWorks1.png";
import howItWorks2 from "../../../../assets/home/howItWorks2.png";
import howItWorks3 from "../../../../assets/home/howItWorks3.png";
import { TEXT } from "../../../../constants/TEXT";

const { howItWorks } = TEXT;

const iconUrls = [howItWorks1, howItWorks2, howItWorks3];

const HowItWorks = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 3,
      }}
    >
      <Typography
        variant="h3"
        component="h2"
        textAlign="center"
        color="text.primary"
      >
        {howItWorks.sectionTitle}
      </Typography>
      <Stack
        sx={(theme) => ({
          flexDirection: "column",
          gap: 2,
          [theme.breakpoints.up("sm")]: {
            flexDirection: "row",
          },
        })}
      >
        {howItWorks.cards.map((card, index) => (
          <HowItWorksCard
            key={card.title}
            iconUrl={iconUrls[index]}
            {...card}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default HowItWorks;
