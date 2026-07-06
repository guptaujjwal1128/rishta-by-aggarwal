// External
import { Avatar, Typography } from "@mui/material";

//Internal
import { Center } from "../../../../styles/Layout.styled";

export interface HowItWorksCardProps {
  iconUrl: string;
  title: string;
  description: string;
}

const HowItWorksCard = ({
  iconUrl,
  title,
  description,
}: HowItWorksCardProps) => {
  return (
    <Center
      sx={(theme) => ({
        flex: 1,
        gap: 2,
        flexDirection: "column",
        p: 3,
        border: `1px solid ${theme.palette.border.secondary}`,
        borderRadius: theme.spacing(1),
        backgroundColor: "rgba(255, 255, 255, 0.78)",
        boxShadow: "0 16px 38px rgba(83, 45, 25, 0.07)",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: theme.palette.border.primary,
          boxShadow: "0 20px 48px rgba(83, 45, 25, 0.12)",
        },
      })}
    >
      <Avatar
        slotProps={{ img: { loading: "lazy" } }}
        src={iconUrl}
        alt=""
        sx={(theme) => ({
          width: 56,
          height: 56,
          backgroundColor: theme.palette.background.tertiary,
          boxShadow: "0 10px 24px rgba(185, 71, 31, 0.12)",
        })}
      ></Avatar>
      <Typography variant="body1Bold" component="h3" color="text.primary">
        {title}
      </Typography>
      <Typography
        variant="body2"
        component="p"
        color="text.secondary"
        textAlign="center"
      >
        {description}
      </Typography>
    </Center>
  );
};

export default HowItWorksCard;
