// External
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { useMediaQuery } from "@mui/material";

// Internal
import { Center } from "../../../../styles/Layout.styled";
import { PrimaryButton } from "../../../../components/atom/button/Button";
import useNavigation from "../../../../hooks/useNavigation";
import { AppRoutes } from "../../../../constants/routes";
import { TEXT } from "../../../../constants/TEXT";
import { ASSETS } from "../../../../constants/ASSETS";

const {
  home: { banner: bannerText },
} = TEXT;

const Banner = () => {
  const theme = useTheme();
  const wideScreen = useMediaQuery(theme.breakpoints.up("md"));
  const { goTo } = useNavigation();

  return (
    <Center
      sx={(theme) => ({
        position: "relative",
        minHeight: theme.spacing(60),
        [theme.breakpoints.down("sm")]: {
          borderRadius: theme.spacing(2),
          overflow: "hidden",
        },
      })}
    >
      {/* Layer 1: Base Clear Image */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${ASSETS.home.hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Layer 2: Blurred Outer Image (Radial Focus) */}
      {wideScreen && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${ASSETS.home.hero})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(6px)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 40%, black 60%)",
            maskImage: "radial-gradient(circle, transparent 40%, black 60%)",
          }}
        />
      )}

      {/* Layer 3: Dark Vignette Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Content */}
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          position: "relative",
          gap: { xs: 3, lg: 6 },
          padding: { xs: 2, lg: 6 },
        }}
      >
        <Typography
          variant="h1"
          component="p"
          sx={{
            color: "common.white",
            textAlign: "center",
            textShadow: "0 4px 12px rgba(0,0,0,0.8)",
            whiteSpace: "pre-wrap",
          }}
        >
          {bannerText.heading}
        </Typography>
        <Typography
          variant="body1"
          component="p"
          sx={{
            color: "common.white",
            textAlign: "center",
            textShadow: "0 4px 12px rgba(0,0,0,0.8)",
          }}
        >
          {bannerText.subheading}
        </Typography>
        <PrimaryButton
          component="a"
          href={AppRoutes.REGISTER}
          sx={{
            py: { xs: 1.5, md: 2 },
            px: { xs: 4, md: 6 },
            boxShadow: theme.shadows[4],
          }}
          onClick={() => {
            void goTo(AppRoutes.REGISTER);
          }}
        >
          <Typography variant="h4" component="p">
            {bannerText.cta}
          </Typography>
        </PrimaryButton>
      </Stack>
    </Center>
  );
};

export default Banner;
