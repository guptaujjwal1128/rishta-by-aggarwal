// External
import { Box, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router";

// Internal
import SuccessStoriesCard from "./SuccessStoriesCard";
import { TEXT } from "../../../../constants/TEXT";
import { AppRoutes } from "../../../../constants/routes";
import { ASSETS } from "../../../../constants/ASSETS";

const {
  home: { successStories },
} = TEXT;

const SuccessStories = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
      <NavLink className="link-styling" to={AppRoutes.SUCCESS_STORIES}>
        <Typography variant="body1Bold" color="primary">
          {successStories.viewAllLabel}
        </Typography>
      </NavLink>
    </Box>
  );
};

export default SuccessStories;
