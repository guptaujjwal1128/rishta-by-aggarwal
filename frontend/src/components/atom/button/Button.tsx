// External
import type { ButtonProps } from "@mui/material";

// Internal
import {
  PrimaryButtonStyled,
  SecondaryButtonStyled,
  TextButtonStyled,
} from "./Button.styled";

export const PrimaryButton = (props: ButtonProps) => (
  <PrimaryButtonStyled variant="contained" {...props}>
    {props.children}
  </PrimaryButtonStyled>
);

export const SecondaryButton = (props: ButtonProps) => (
  <SecondaryButtonStyled variant="outlined" {...props}>
    {props.children}
  </SecondaryButtonStyled>
);

export const TextButton = (props: ButtonProps) => (
  <TextButtonStyled variant="text" {...props}>
    {props.children}
  </TextButtonStyled>
);
