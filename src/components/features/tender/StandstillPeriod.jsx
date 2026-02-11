import { Box, Typography, Chip, Alert, LinearProgress } from "@mui/material";
import { DateDisplay } from "../../common";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { isStandstillPeriodEnded, getRemainingStandstillDays } from "../../../api";
import { STANDSTILL_PERIOD_DAYS } from "../../../constants";

/**
 * StandstillPeriod Component
 * Displays standstill period status and countdown
 */
export const StandstillPeriod = ({ tender, size = "medium" }) => {
    if (!tender?.standstillEndDate) {
        return null;
    }

    const standstillEnded = isStandstillPeriodEnded(tender.standstillEndDate);
    const remainingDays = getRemainingStandstillDays(tender.standstillEndDate);
    const standstillStartDate = tender.standstillStartDate 
        ? (tender.standstillStartDate instanceof Date 
            ? tender.standstillStartDate 
            : new Date(tender.standstillStartDate))
        : null;

    if (standstillEnded) {
        return (
            <Alert 
                severity="success" 
                icon={<CheckCircleIcon />}
                sx={{ mb: 2 }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Ventetid (Standstill periode) er utløpt
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Kontrakten kan nå signeres. Ventetiden utløp {standstillStartDate && (
                        <DateDisplay date={tender.standstillEndDate} variant="caption" />
                    )}
                </Typography>
            </Alert>
        );
    }

    const progress = remainingDays !== null 
        ? Math.max(0, Math.min(100, ((STANDSTILL_PERIOD_DAYS - remainingDays) / STANDSTILL_PERIOD_DAYS) * 100))
        : 0;

    return (
        <Alert 
            severity="warning" 
            icon={<AccessTimeIcon />}
            sx={{ mb: 2 }}
        >
            <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Ventetid (Standstill periode)
                    </Typography>
                    <Chip 
                        label={`${remainingDays} ${remainingDays === 1 ? 'dag' : 'dager'} igjen`}
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    I henhold til norsk anskaffelseslovgivning er det en ventetid på 10 dager fra tildeling. 
                    Kontrakten kan ikke signeres før ventetiden er utløpt.
                </Typography>

                <Box sx={{ mt: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            Startet: {standstillStartDate && (
                                <DateDisplay 
                                    date={standstillStartDate} 
                                    variant="caption" 
                                    showTime={false}
                                />
                            )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Utløper: <DateDisplay 
                                date={tender.standstillEndDate} 
                                variant="caption" 
                                showTime={false}
                            />
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        }} 
                    />
                </Box>
            </Box>
        </Alert>
    );
};

