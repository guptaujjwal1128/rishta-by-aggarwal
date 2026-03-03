// External
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";

//Internal
import { Center } from "../../../../styles/Layout.styled";
import { TEXT } from "../../../../constants/TEXT";
import { ASSETS } from "../../../../constants/ASSETS";

const { mostPopularLabel } = TEXT.home.pricingPlans;

export interface PricingPlansCardProps {
  title: string;
  price: number;
  features: readonly { text: string; isAvailable: boolean }[];
  isMostPopular?: boolean;
}

const PricingPlansCard = ({
  title,
  price,
  features,
  isMostPopular,
}: PricingPlansCardProps) => {
  return (
    <Center
      sx={(theme) => ({
        position: "relative",
        flex: 1,
        gap: 2,
        flexDirection: "column",
        p: 3,
        border: `1px solid ${theme.palette.border.primary}`,
        borderRadius: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        ...(isMostPopular && {
          border: `2px solid ${theme.palette.secondary.main}`,
        }),
      })}
    >
      {isMostPopular && (
        <Typography
          variant="body3Bold"
          color="secondary.main"
          sx={(theme) => ({
            backgroundColor: "secondary.main",
            px: 2,
            py: 0.25,
            color: "common.white",
            borderRadius: theme.spacing(2),
            textTransform: "uppercase",
            position: "absolute",
            top: -12,
          })}
        >
          {mostPopularLabel}
        </Typography>
      )}
      <Box>
        <Typography
          variant="h5"
          component="h3"
          color="text.primary"
          textAlign="center"
        >
          {title}
        </Typography>
        <Box pt={1}>
          <Typography variant="h2" component="span" color="text.primary">
            ${price}
          </Typography>
          <Typography variant="body1" component="span" color="text.secondary">
            /mo
          </Typography>
        </Box>
      </Box>
      <List sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        {features.map((feature, index) => (
          // eslint-disable-next-line react-x/no-array-index-key
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar
                src={
                  feature.isAvailable
                    ? ASSETS.home.pricing.tick
                    : ASSETS.home.pricing.cross
                }
                sx={{
                  width: 20,
                  height: 20,
                }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  {feature.text}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Center>
  );
};

export default PricingPlansCard;
