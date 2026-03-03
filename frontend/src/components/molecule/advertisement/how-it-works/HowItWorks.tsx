// External
import { Box, Stack, Typography } from "@mui/material";

// Internal
import HowItWorksCard from "./HowItWorksCard";
import { TEXT } from "../../../../constants/TEXT";
import { ASSETS } from "../../../../constants/ASSETS";

const {
  home: { howItWorks },
} = TEXT;

const iconUrls = ASSETS.home.howItWorks;

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
