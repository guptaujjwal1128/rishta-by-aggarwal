// NPM
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { useMediaQuery } from "@mui/material";

// Local
import hero from "../../../../assets/hero.png";
import { Center } from "../../../../styles/Layout.styled";
import { PrimaryButton } from "../../../../styles/Button.styled";
import useNavigation from "../../../../hooks/useNavigation";
import { AppRoutes } from "../../../../constants/routes";

const Banner = () => {
  const theme = useTheme();
  const wideScreen = useMediaQuery(theme.breakpoints.up("md"));
  const { goTo } = useNavigation();

  return (
    <Center
      sx={{
        position: "relative",
        minHeight: "30rem",
      }}
    >
      {/* Layer 1: Base Clear Image */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${hero})`,
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
            backgroundImage: `url(${hero})`,
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
          gap: 2,
        }}
      >
        <Typography
          variant="h1"
          component="p"
          sx={{
            color: "common.white",
            textAlign: "center",
            textShadow: "0 4px 12px rgba(0,0,0,0.8)",
          }}
        >
          Find Your Perfect Match with Trust and Care
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "common.white",
            textAlign: "center",
            textShadow: "0 4px 12px rgba(0,0,0,0.8)",
          }}
        >
          Connecting hearts within the Aggarwal community for a lifetime of
          happiness.
        </Typography>
        <PrimaryButton
          variant="contained"
          onClick={() => {
            void goTo(AppRoutes.REGISTER);
          }}
        >
          <Typography variant="h3">Join Now</Typography>
        </PrimaryButton>
      </Stack>
    </Center>
  );
};

export default Banner;
