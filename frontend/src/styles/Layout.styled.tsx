import { Box, styled } from "@mui/material";

export const PageContainer = styled(Box)({
  height: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
});

interface PageContentProps {
  noMaxWidth?: boolean;
}

// maxWidth should be applied or not needs to be a prop
export const PageContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== "noMaxWidth",
})<PageContentProps>(({ theme, noMaxWidth = false }) => ({
  width: "100%",
  maxWidth: noMaxWidth ? "none" : theme.breakpoints.values.xl,
}));

export const Center = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
