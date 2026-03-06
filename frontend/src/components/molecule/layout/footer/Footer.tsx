// External
import { Typography, Grid, Stack } from "@mui/material";
import {
  Facebook,
  Instagram,
  X,
  LocationOn,
  WhatsApp,
  Phone,
  Person,
  Mail,
} from "@mui/icons-material";
import { NavLink } from "react-router";

// Internal
import { TEXT } from "../../../../constants/TEXT";
import { Center } from "../../../../styles/Layout.styled";
import { AppRoutes } from "../../../../constants/routes";

const { footer } = TEXT;

const Footer = () => {
  return (
    <Center sx={{ backgroundColor: "background.tertiary" }}>
      <Center
        maxWidth="xl"
        component="footer"
        gap={{ xs: 2, md: 4 }}
        sx={{
          py: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Grid container spacing={{ xs: 2, md: 6, lg: 10 }} width="100%">
          {/* About Brand */}
          <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={2}
            size={{ xs: 12, md: 3 }}
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
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
            >
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
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              alignContent: "center",
              gap: 2,
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
          {/* Contact Details */}
          <Grid
            component="nav"
            container
            size={{ xs: 12, md: 5 }}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              color: "text.primary",
            }}
          >
            <Center sx={{ gap: 2 }}>
              {/* Contact Details */}
              <Stack sx={{ gap: 1 }}>
                {/* Location */}
                <Stack direction="row" alignItems="center" gap={2}>
                  <LocationOn titleAccess="Office Address" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "break-spaces" }}
                  >
                    {footer.address}
                  </Typography>
                </Stack>
                {/* Contact Person */}
                <Stack direction="row" alignItems="center" gap={2}>
                  <Person titleAccess="Contact Person Name" />
                  <Typography color="text.secondary" variant="body2">
                    {footer.contact.name}
                  </Typography>
                </Stack>
                {/* Contact Phone */}
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={2}
                  rowGap={0}
                  flexWrap="wrap"
                >
                  <Phone titleAccess="Contact Phone" />
                  {footer.contact.mobile.map((mobile) => (
                    <NavLink
                      className="link-styling"
                      to={`tel:+91${mobile}`}
                      key={mobile}
                    >
                      <Typography color="text.secondary" variant="body2">
                        {mobile}
                      </Typography>
                    </NavLink>
                  ))}
                  <NavLink
                    className="link-styling"
                    target="_blank"
                    to={`https://wa.me/${footer.contact.mobile[1]}`}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {"( Also available on"}
                      {"   "}
                      <WhatsApp
                        titleAccess="whatsapp"
                        sx={{ fontSize: 16, position: "relative", top: 3 }}
                      />{" "}
                      {")"}
                    </Typography>
                  </NavLink>
                </Stack>
                {/* Contact Mail */}
                <Stack direction="row" alignItems="center" gap={2}>
                  <Mail titleAccess="Contact Mail" />
                  <NavLink
                    to={`mailto:${footer.contact.mail}`}
                    className="link-styling"
                  >
                    <Typography variant="body2" color="text.secondary">
                      {footer.contact.mail}
                    </Typography>
                  </NavLink>
                </Stack>
              </Stack>
            </Center>
          </Grid>
        </Grid>
        {/* social links */}
        <Center direction="row" sx={{ gap: { xs: 2, sm: 4 } }}>
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
        </Center>
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
    </Center>
  );
};

export default Footer;
