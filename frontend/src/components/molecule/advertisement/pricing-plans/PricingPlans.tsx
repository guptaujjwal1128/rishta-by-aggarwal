// External
import { Box, Stack, Typography } from "@mui/material";

// Internal
import PricingPlansCard from "./PricingPlansCard";
import { TEXT } from "../../../../constants/TEXT";

const {
  home: { pricingPlans },
} = TEXT;

const PricingPlans = () => {
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
        {pricingPlans.sectionTitle}
      </Typography>
      <Stack
        sx={(theme) => ({
          flexDirection: "column",
          alignItems: "stretch",
          gap: 3,
          [theme.breakpoints.up("sm")]: {
            flexDirection: "row",
          },
        })}
      >
        {pricingPlans.plans.map((plan) => (
          <PricingPlansCard key={plan.title} {...plan} />
        ))}
      </Stack>
    </Box>
  );
};

export default PricingPlans;
