// External
import { styled, Button } from "@mui/material";
import { darken } from "@mui/material/styles";

export const PrimaryButtonStyled = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(4),
  textTransform: "none",
  color: theme.palette.common.white,
  boxShadow: "none",
  backgroundColor: theme.palette.primary.main,
  padding: theme.spacing(0.5, 2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(1, 3),
  },
  "&:hover, &:focus": {
    backgroundColor: darken(theme.palette.primary.main, 0.1),
    boxShadow: "none",
  },
}));

export const SecondaryButtonStyled = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(4),
  textTransform: "none",
  color: theme.palette.text.primary,
  borderColor: theme.palette.border.primary,
  border: `1px solid ${theme.palette.border.primary}`,
  padding: theme.spacing(0.5, 2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(1, 3),
  },
  "&:hover, &:focus": {
    backgroundColor: darken(theme.palette.common.white, 0.05),
    borderColor: darken(theme.palette.border.primary, 0.2),
  },
}));

export const TextButtonStyled = styled(Button)({
  textTransform: "none",
  padding: 0,
  "&:hover, &:focus": {
    opacity: 0.8,
  },
});
