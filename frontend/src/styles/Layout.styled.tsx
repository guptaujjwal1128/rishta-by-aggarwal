import {
  Box,
  type BoxProps,
  Stack,
  type StackProps,
  styled,
} from "@mui/material";

export const ContentContainer = styled(Box)<BoxProps>({
  height: "100%",
  width: "100%",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
});

interface ContentProps extends BoxProps {
  noMaxWidth?: boolean;
}

// maxWidth should be applied or not needs to be a prop
export const Content = styled(Box, {
  shouldForwardProp: (prop) => prop !== "noMaxWidth",
})<ContentProps>(({ theme, noMaxWidth = false }) => ({
  width: "100%",
  maxWidth: noMaxWidth ? "none" : theme.breakpoints.values.xl,
}));

export const Center = styled(Stack)<StackProps>({
  alignItems: "center",
  justifyContent: "center",
});
