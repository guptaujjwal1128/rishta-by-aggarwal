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
        border: `1px solid ${theme.palette.border.secondary}`,
        borderRadius: theme.spacing(1),
        backgroundColor: "rgba(255, 255, 255, 0.86)",
        boxShadow: "0 18px 42px rgba(83, 45, 25, 0.08)",
        overflow: "hidden",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 24px 54px rgba(83, 45, 25, 0.13)",
        },
      })}
    >
      {/* Couple Image */}
      <Box
        component="img"
        src={image}
        alt={name}
        loading="lazy"
        sx={{
          height: "20rem",
          width: "100%",
          objectFit: "cover",
          transition: "transform 260ms ease",
          ".MuiStack-root:hover &": {
            transform: "scale(1.025)",
          },
        }}
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
