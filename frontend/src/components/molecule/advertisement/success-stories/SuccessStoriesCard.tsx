// External
import { Avatar, Box, Typography } from "@mui/material";

// Internal
import { Center } from "../../../../styles/Layout.styled";

export interface SuccessStoriesCardProps {
  quote: string;
  name: string;
  initials: string;
}

const SuccessStoriesCard = ({
  quote,
  name,
  initials,
}: SuccessStoriesCardProps) => {
  return (
    <Center
      sx={(theme) => ({
        flex: 1,
        gap: 2,
        flexDirection: "column",
        alignItems: "flex-start",
        p: 3,
        border: `1px solid ${theme.palette.border.primary}`,
        borderRadius: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
      })}
    >
      {/* Quote mark */}
      <Typography
        variant="h2"
        component="span"
        color="primary"
        sx={{ lineHeight: 0.8, mt: 0.5 }}
      >
        "
      </Typography>

      {/* Quote text */}
      <Typography variant="body1" component="p" color="text.secondary">
        {quote}
      </Typography>

      {/* Attribution */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: "auto" }}>
        <Avatar
          sx={(theme) => ({
            bgcolor: theme.palette.primary.main,
            width: 40,
            height: 40,
          })}
        >
          <Typography variant="body2Bold" color="common.white">
            {initials}
          </Typography>
        </Avatar>
        <Typography variant="body2Bold" component="p" color="text.primary">
          — {name}
        </Typography>
      </Box>
    </Center>
  );
};

export default SuccessStoriesCard;
