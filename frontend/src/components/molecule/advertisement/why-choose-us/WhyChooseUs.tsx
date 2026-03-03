// External
import { Typography, Stack, Grid, Box } from "@mui/material";

// Internal
import { TEXT } from "../../../../constants/TEXT";
import { ASSETS } from "../../../../constants/ASSETS";
import WhyChooseUsCard from "./WhyChooseUsCard";

const {
  home: { whyChooseUs },
} = TEXT;

const WhyChooseUs = () => {
  return (
    <Stack gap={3} alignItems="center">
      <Typography
        variant="h3"
        component="h2"
        textAlign="center"
        color="text.primary"
      >
        {whyChooseUs.sectionTitle}
      </Typography>
      <Grid container rowSpacing={4} columnSpacing={4} justifyContent="center">
        {whyChooseUs.cards.map((card, index) => (
          <Grid
            key={card.title}
            size={{ xs: 12, md: 6, lg: 4 }}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <WhyChooseUsCard {...card} icon={ASSETS.home.whyChooseUs[index]} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default WhyChooseUs;
