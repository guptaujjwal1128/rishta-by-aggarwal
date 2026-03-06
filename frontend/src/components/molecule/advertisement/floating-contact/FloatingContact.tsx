// External
import { Fab } from "@mui/material";
import { WhatsApp } from "@mui/icons-material";

// Internal
import { TEXT } from "../../../../constants/TEXT";

export const FloatingContact = () => {
  const { footer } = TEXT;
  return (
    <Fab
      className="link-styling"
      target="_blank"
      color="success"
      href={`https://wa.me/${footer.contact.mobile[1]}`}
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
      }}
    >
      <WhatsApp />
    </Fab>
  );
};
