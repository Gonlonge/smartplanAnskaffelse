import PropTypes from 'prop-types';
import { Grid, Card, CardContent, Skeleton } from "@mui/material";
import { StatCard } from "./StatCard";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FolderIcon from "@mui/icons-material/Folder";
import BusinessIcon from "@mui/icons-material/Business";
import InboxIcon from "@mui/icons-material/Inbox";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

/**
 * Dashboard statistics cards section
 */
export const DashboardStats = ({ stats, isSender, loading }) => {
    const navigate = useNavigate();

    return (
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
            {loading ? (
                // Loading skeletons
                Array.from({ length: isSender ? 4 : 3 }).map((_, index) => (
                    <Grid item xs={6} sm={isSender ? 3 : 4} key={index}>
                        <Card elevation={0}>
                            <CardContent>
                                <Skeleton
                                    variant="rectangular"
                                    width={56}
                                    height={56}
                                    sx={{ borderRadius: 2, mb: 2 }}
                                />
                                <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="40%" height={40} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))
            ) : isSender ? (
                <>
                    <Grid item xs={6} sm={3}>
                        <StatCard
                            title="Totalt Anskaffelse"
                            value={stats.totalTenders}
                            icon={DescriptionIcon}
                            color="primary"
                            onClick={() => navigate("/tenders")}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard
                            title="Åpne Anskaffelse"
                            value={stats.openTenders}
                            icon={FolderOpenIcon}
                            color="info"
                            onClick={() => navigate("/tenders?status=open")}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard
                            title="Lukkede Anskaffelse"
                            value={stats.closedTenders}
                            icon={FolderIcon}
                            color="success"
                            onClick={() => navigate("/tenders?status=closed")}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <StatCard
                            title="Prosjekter"
                            value={stats.totalProjects}
                            icon={BusinessIcon}
                            color="warning"
                            onClick={() => navigate("/projects")}
                        />
                    </Grid>
                </>
            ) : (
                <>
                    <Grid item xs={6} sm={4}>
                        <StatCard
                            title="Invitasjoner"
                            value={stats.invitations}
                            icon={InboxIcon}
                            color="primary"
                            onClick={() => navigate("/invitations")}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <StatCard
                            title="Ventende"
                            value={stats.pendingBids}
                            icon={PendingActionsIcon}
                            color="warning"
                            onClick={() => navigate("/invitations?status=invited")}
                        />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                        <StatCard
                            title="Innsendte tilbud"
                            value={stats.submittedBids}
                            icon={CheckCircleIcon}
                            color="success"
                            onClick={() => navigate("/invitations?status=submitted")}
                        />
                    </Grid>
                </>
            )}
        </Grid>
    );
};

DashboardStats.propTypes = {
    stats: PropTypes.shape({
        totalTenders: PropTypes.number,
        openTenders: PropTypes.number,
        closedTenders: PropTypes.number,
        totalProjects: PropTypes.number,
        invitations: PropTypes.number,
        pendingBids: PropTypes.number,
        submittedBids: PropTypes.number,
    }),
    isSender: PropTypes.bool,
    loading: PropTypes.bool,
};

