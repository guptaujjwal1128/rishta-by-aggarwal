import { Box, Stack, Typography } from "@mui/material";
import {
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from "../../../../styles/Button.styled";

// Local
import banner from "../../../../assets/banner.png";
import useNavigation from "../../../../hooks/useNavigation";
import { AppRoutes } from "../../../../constants/routes";

const Header = () => {
  const { goTo } = useNavigation();

  return (
    <Stack
      component="header"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 1, px: 2, gap: { xs: 1, md: 2 } }}
      maxWidth="xl"
      width="100%"
    >
      <TextButton
        onClick={() => {
          void goTo(AppRoutes.HOME);
        }}
        sx={{ p: 0 }}
      >
        <Box component="img" src={banner} alt="" height={40} />
        <Typography variant="h5" component="h1" color="primary">
          Rishta by Aggarwal
        </Typography>
      </TextButton>
      <Stack direction="row" sx={{ gap: { xs: 1, md: 2 } }}>
        <SecondaryButton
          variant="outlined"
          onClick={() => {
            void goTo(AppRoutes.LOGIN);
          }}
        >
          <Typography variant="body2Bold">Login</Typography>
        </SecondaryButton>
        <PrimaryButton
          variant="contained"
          onClick={() => {
            void goTo(AppRoutes.REGISTER);
          }}
        >
          <Typography variant="body2Bold">Join Now</Typography>
        </PrimaryButton>
      </Stack>
    </Stack>
  );
};

export default Header;
