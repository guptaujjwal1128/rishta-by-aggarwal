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
        border: `1px solid ${theme.palette.border.primary}`,
        borderRadius: theme.spacing(2),
      })}
    >
      <Avatar src={iconUrl} alt="" sx={{ width: 48, height: 48 }}></Avatar>
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
