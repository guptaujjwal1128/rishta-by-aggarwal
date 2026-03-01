import { Box, styled } from "@mui/material";

export const PageContainer = styled(Box)(({ theme }) => ({
  height: "100vh",
  backgroundColor: theme.palette.background.paper,
}));
