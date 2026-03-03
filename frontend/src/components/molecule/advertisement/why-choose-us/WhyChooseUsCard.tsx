// External
import { Box, Typography, Stack } from "@mui/material";

// Internal

export interface WhyChooseUsCardProps {
  title: string;
  description: string;
  icon: string;
}

const WhyChooseUsCard = ({
  title,
  description,
  icon,
}: WhyChooseUsCardProps) => {
  return (
    <Stack sx={{ maxWidth: "25rem", width: "100%" }}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box
          sx={{
            height: 20,
            width: 20,
          }}
        >
          <Box
            sx={{
              height: 16,
              maxWidth: 20,
              objectFit: "contain",
            }}
            src={icon}
            alt=""
            component="img"
          ></Box>
        </Box>
        <Typography variant="body1Bold" color="text.primary">
          {title}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
};

export default WhyChooseUsCard;
