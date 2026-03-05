// External
import { Typography, Grid } from "@mui/material";
import { Facebook, Instagram, X } from "@mui/icons-material";
import { NavLink } from "react-router";

// Internal
import { TEXT } from "../../../../constants/TEXT";
import { Center } from "../../../../styles/Layout.styled";
import { AppRoutes } from "../../../../constants/routes";

const { footer } = TEXT;

const Footer = () => {
  return (
    <Center
      gap={{ xs: 2, md: 4 }}
      sx={{ py: { xs: 4, sm: 6 }, px: { xs: 2, sm: 4 } }}
    >
      <Grid container spacing={{ xs: 2, md: 10 }} width="100%">
        {/* About Brand */}
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={2}
          size={{ xs: 12, md: 4 }}
        >
          <NavLink className="link-styling" to={AppRoutes.HOME}>
            <Typography
              variant="h4"
              component="p"
              color="text.primary"
              textAlign="center"
              sx={{ "&:hover": { opacity: 0.8 } }}
            >
              {footer.brandName}
            </Typography>
          </NavLink>
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
            <NavLink className="link-styling" key={link.label} to={link.path}>
              <Typography variant="body2Bold" color="text.primary">
                {link.label}
              </Typography>
            </NavLink>
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
          <NavLink
            className="link-styling"
            to="https://www.instagram.com/rishtabyaggarwal/"
            target="_blank"
            aria-label="facebook"
          >
            <Facebook sx={{ color: "text.secondary" }} />
          </NavLink>
          <NavLink
            className="link-styling"
            to="https://www.instagram.com/rishtabyaggarwal/"
            target="_blank"
            aria-label="instagram"
          >
            <Instagram sx={{ color: "text.secondary" }} />
          </NavLink>
          <NavLink
            className="link-styling"
            to="https://www.instagram.com/rishtabyaggarwal/"
            target="_blank"
            aria-label="x"
            aria-description="twitter"
          >
            <X sx={{ color: "text.secondary" }} />
          </NavLink>
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
