// External
import { styled, Button } from "@mui/material";
import { darken } from "@mui/material/styles";

export const PrimaryButtonStyled = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(4),
  textTransform: "none",
  color: theme.palette.common.white,
  boxShadow: "0 10px 24px rgba(185, 71, 31, 0.22)",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, #E26F3B)`,
  padding: theme.spacing(0.75, 2),
  transition: "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(1, 3),
  },
  "&:hover, &:focus": {
    backgroundColor: darken(theme.palette.primary.main, 0.1),
    transform: "translateY(-1px)",
    boxShadow: "0 14px 30px rgba(185, 71, 31, 0.28)",
  },
}));

export const SecondaryButtonStyled = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(4),
  textTransform: "none",
  color: theme.palette.text.primary,
  borderColor: theme.palette.border.primary,
  border: `1px solid ${theme.palette.border.primary}`,
  backgroundColor: "rgba(255, 255, 255, 0.72)",
  padding: theme.spacing(0.75, 2),
  transition: "transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(1, 3),
  },
  "&:hover, &:focus": {
    backgroundColor: darken(theme.palette.common.white, 0.03),
    borderColor: darken(theme.palette.border.primary, 0.2),
    transform: "translateY(-1px)",
    boxShadow: "0 10px 22px rgba(83, 45, 25, 0.08)",
  },
}));

export const TextButtonStyled = styled(Button)({
  textTransform: "none",
  padding: 0,
  "&:hover, &:focus": {
    opacity: 0.8,
  },
});
