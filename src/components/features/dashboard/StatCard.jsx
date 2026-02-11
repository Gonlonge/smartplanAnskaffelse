import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Skeleton,
    alpha,
    useTheme,
} from "@mui/material";

/**
 * Reusable stat card component for dashboard statistics
 */
export const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "primary",
    onClick,
    loading = false,
}) => {
    const theme = useTheme();
    const isEmpty = value === 0 || value === "0";
    const iconColor = isEmpty
        ? theme.palette.primary.main
        : theme.palette[color]?.main || theme.palette.primary.main;
    const cardColor = isEmpty
        ? theme.palette.text.secondary
        : theme.palette[color]?.main || theme.palette.primary.main;

    return (
        <Card
            onClick={onClick}
            sx={{
                height: "100%",
                cursor: onClick ? "pointer" : "default",
                transition: "all 0.2s ease",
                "&:hover": onClick
                    ? {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          "& .stat-icon": {
                              transform: "scale(1.05)",
                          },
                      }
                    : {},
                position: "relative",
                overflow: "visible",
            }}
            elevation={0}
        >
            <CardContent sx={{ position: "relative", pb: 2 }}>
                <Box
                    className="stat-icon"
                    sx={{
                        width: 56,
                        height: 56,
                        p: 1.5,
                        borderRadius: 1.5,
                        backgroundColor: isEmpty
                            ? alpha(theme.palette.text.secondary, 0.1)
                            : alpha(
                                  theme.palette[color]?.main ||
                                      theme.palette.primary.main,
                                  0.1
                              ),
                        color: iconColor,
                        transition: "transform 0.3s ease-in-out",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                    }}
                >
                    {Icon && <Icon sx={{ fontSize: 28 }} />}
                </Box>
                {loading ? (
                    <>
                        <Skeleton
                            variant="text"
                            width="60%"
                            height={20}
                            sx={{ mb: 1 }}
                        />
                        <Skeleton variant="text" width="40%" height={40} />
                    </>
                ) : (
                    <>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontWeight: 500,
                                mb: 1,
                                fontSize: {
                                    xs: "1rem",
                                    sm: "1rem",
                                    md: "0.9375rem",
                                },
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                color: cardColor,
                                fontSize: {
                                    xs: "1.75rem",
                                    sm: "2rem",
                                    md: "2.25rem",
                                },
                                opacity: isEmpty ? 0.6 : 1,
                            }}
                        >
                            {value}
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType,
    color: PropTypes.string,
    onClick: PropTypes.func,
    loading: PropTypes.bool,
};
