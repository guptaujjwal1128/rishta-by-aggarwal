import { styled, Button } from "@mui/material";
import { darken, lighten } from "@mui/material/styles";

export const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: "none",
  color: theme.palette.common.white,
  boxShadow: "none",
  backgroundColor: theme.palette.primary.main,
  "&:hover, &:focus": {
    backgroundColor: darken(theme.palette.primary.main, 0.1),
    boxShadow: "none",
  },
}));

export const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: "none",
  color: theme.palette.text.primary,
  borderColor: theme.palette.border.primary,
  border: `1px solid ${theme.palette.border.primary}`,
  "&:hover, &:focus": {
    backgroundColor: darken(theme.palette.common.white, 0.05),
    borderColor: darken(theme.palette.border.primary, 0.2),
  },
}));

export const TextButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: "none",
  "&:hover, &:focus": {
    color: lighten(theme.palette.text.primary, 0.2),
  },
}));
