// External
import { Box, Stack, Typography } from "@mui/material";

// Internal
import SuccessStoriesCard from "./SuccessStoriesCard";
import { TEXT } from "../../../../constants/TEXT";
import useNavigation from "../../../../hooks/useNavigation";
import { AppRoutes } from "../../../../constants/routes";
import { ASSETS } from "../../../../constants/ASSETS";

const {
  home: { successStories },
} = TEXT;

const SuccessStories = () => {
  const { goTo } = useNavigation();
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
        {successStories.sectionTitle}
      </Typography>
      <Stack
        sx={(theme) => ({
          flexDirection: "column",
          gap: 3,
          [theme.breakpoints.up("sm")]: {
            flexDirection: "row",
          },
        })}
      >
        {successStories.stories.map((story, index) => (
          <SuccessStoriesCard
            key={story.name}
            image={ASSETS.home.successStories[index]}
            {...story}
          />
        ))}
      </Stack>
      <Typography
        tabIndex={0}
        variant="body1Bold"
        component="a"
        color="primary"
        textAlign="center"
        sx={{ cursor: "pointer", textDecoration: "none" }}
        onClick={() => {
          void goTo(AppRoutes.SUCCESS_STORIES);
        }}
      >
        {successStories.viewAllLabel}
      </Typography>
    </Box>
  );
};

export default SuccessStories;
