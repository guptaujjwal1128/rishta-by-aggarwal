// External
import { Typography, Link, Grid } from "@mui/material";
import { Facebook, Instagram, X } from "@mui/icons-material";

// Internal
import { TEXT } from "../../../../constants/TEXT";
import { Center } from "../../../../styles/Layout.styled";
import { NavLink } from "react-router";

const { footer } = TEXT;

const Footer = () => {
  return (
    <Center gap={{ xs: 2, md: 4 }}>
      <Grid container spacing={{ xs: 2, md: 6 }} width="100%">
        {/* About Brand */}
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          size={{ xs: 12, md: 4 }}
        >
          <Typography
            variant="h4"
            component="p"
            color="text.primary"
            textAlign="center"
          >
            {footer.brandName}
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            {footer.tagline}
          </Typography>
        </Grid>
        {/* links */}
        <Grid
          component="nav"
          container
          direction="row"
          size={{ xs: 12, md: 4 }}
          sx={{
            gap: { xs: 2, sm: 4 },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {footer.links.map((link) => (
            <Link
              component={NavLink}
              to={link.path}
              tabIndex={0}
              key={link.label}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="body2Bold" color="text.primary">
                {link.label}
              </Typography>
            </Link>
          ))}
        </Grid>
        {/* social links */}
        <Grid
          component="nav"
          container
          size={{ xs: 12, md: 4 }}
          sx={{
            gap: { xs: 2, sm: 4 },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Link href="#" aria-label="facebook">
            <Facebook sx={{ color: "text.secondary" }} />
          </Link>
          <Link href="#" aria-label="instagram">
            <Instagram sx={{ color: "text.secondary" }} />
          </Link>
          <Link href="#" aria-label="x" aria-description="twitter">
            <X sx={{ color: "text.secondary" }} />
          </Link>
        </Grid>
      </Grid>
      {/* copyright */}
      <Typography
        variant="body3"
        color="text.secondary"
        textAlign="center"
        display="block"
      >
        {footer.copyright}
      </Typography>
    </Center>
  );
};

export default Footer;
