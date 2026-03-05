import { Box, Stack, Typography } from "@mui/material";

export interface SuccessStoriesCardProps {
  quote: string;
  name: string;
  image: string;
}

const SuccessStoriesCard = ({
  quote,
  name,
  image,
}: SuccessStoriesCardProps) => {
  return (
    <Stack
      sx={(theme) => ({
        flex: 1,
        flexDirection: "column",
        border: `1px solid ${theme.palette.border.primary}`,
        borderRadius: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
      })}
    >
      {/* Couple Image */}
      <Box
        component="img"
        src={image}
        alt={name}
        loading="lazy"
        sx={(theme) => ({
          height: "20rem",
          width: "100%",
          objectFit: "cover",
          borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
        })}
      />
      <Box sx={{ p: 3 }}>
        {/* Quote text */}
        <Typography variant="body1" component="p" color="text.secondary">
          "{quote}"
        </Typography>

        {/* Attribution */}
        <Typography
          sx={{
            width: "100%",
            color: "text.primary",
            textAlign: "right",
            pt: 0.5,
          }}
          variant="body2Bold"
          component="p"
        >
          — {name}
        </Typography>
      </Box>
    </Stack>
  );
};

export default SuccessStoriesCard;
