import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

const TenderDetailsBreadcrumbs = ({ tenderTitle }) => {
    const navigate = useNavigate();

    return (
        <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="Navigasjonssti"
            sx={{ mb: 3 }}
        >
            <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/dashboard")}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    textDecoration: "none",
                    color: "text.secondary",
                    cursor: "pointer",
                    "&:hover": {
                        textDecoration: "underline",
                        color: "primary.main",
                    },
                }}
            >
                <HomeIcon fontSize="small" />
                Dashboard
            </Link>
            <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/tenders")}
                sx={{
                    textDecoration: "none",
                    color: "text.secondary",
                    cursor: "pointer",
                    "&:hover": {
                        textDecoration: "underline",
                        color: "primary.main",
                    },
                }}
            >
                Anskaffelser
            </Link>
            <Typography variant="body2" color="text.primary">
                {tenderTitle}
            </Typography>
        </Breadcrumbs>
    );
};

export { TenderDetailsBreadcrumbs };






