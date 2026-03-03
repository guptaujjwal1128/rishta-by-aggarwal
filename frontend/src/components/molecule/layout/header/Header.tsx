// External
import { Box, Stack, Typography } from "@mui/material";
import {
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from "../../../../components/atom/button/Button";

// Internal
import banner from "../../../../assets/banner.png";
import useNavigation from "../../../../hooks/useNavigation";
import { AppRoutes } from "../../../../constants/routes";
import { TEXT } from "../../../../constants/TEXT";

const { header } = TEXT;

const Header = () => {
  const { goTo } = useNavigation();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ gap: { xs: 1, md: 2 } }}
      maxWidth="xl"
      width="100%"
    >
      <TextButton
        onClick={() => {
          void goTo(AppRoutes.HOME);
        }}
      >
        <Box
          component="img"
          src={banner}
          alt=""
          height={{ xs: 30, md: 40 }}
          width={{ xs: 30, md: 40 }}
        />
        <Typography variant="h5" component="h1" color="primary">
          {header.brandName}
        </Typography>
      </TextButton>
      <Stack direction="row" alignItems="center" sx={{ gap: { xs: 1, md: 2 } }}>
        <SecondaryButton
          onClick={() => {
            void goTo(AppRoutes.LOGIN);
          }}
        >
          <Typography variant="body2Bold">{header.login}</Typography>
        </SecondaryButton>
        <PrimaryButton
          onClick={() => {
            void goTo(AppRoutes.REGISTER);
          }}
        >
          <Typography variant="body2Bold">{header.joinNow}</Typography>
        </PrimaryButton>
      </Stack>
    </Stack>
  );
};

export default Header;
