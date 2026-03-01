import { Stack, Typography } from "@mui/material";
import {
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from "../../../../styles/Button.styled";
import { useNavigate } from "react-router";

const Header = () => {
  const navigate = useNavigate();
  const handleNavigation = (path: string) => {
    void navigate(path);
  };

  return (
    <Stack
      component="header"
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, px: 2, gap: { xs: 1, md: 2 } }}
    >
      <Stack>
        <TextButton onClick={() => handleNavigation("/")}>
          <Typography variant="h5" component="h1">
            Rishta by Aggarwal
          </Typography>
        </TextButton>
      </Stack>
      <Stack direction="row" sx={{ gap: { xs: 1, md: 2 } }}>
        <SecondaryButton
          variant="outlined"
          onClick={() => handleNavigation("/login")}
        >
          <Typography variant="body1Bold">Login</Typography>
        </SecondaryButton>
        <PrimaryButton
          variant="contained"
          onClick={() => handleNavigation("/register")}
        >
          <Typography variant="body1Bold">Join Now</Typography>
        </PrimaryButton>
      </Stack>
    </Stack>
  );
};

export default Header;
