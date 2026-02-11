import PropTypes from 'prop-types';
import { Chip } from "@mui/material";

/**
 * StatusChip - Displays tender/bid status with appropriate color
 */
const StatusChip = ({ status, size = "small" }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case "draft":
                return { label: "Utkast", color: "default" };
            case "open":
                return { label: "Åpen", color: "info" };
            case "closed":
                return { label: "Lukket", color: "success" };
            case "awarded":
                return { label: "Tildelt", color: "success" };
            case "submitted":
                return { label: "Innsendt", color: "info" };
            case "evaluated":
                return { label: "Vurdert", color: "primary" };
            case "rejected":
                return { label: "Avslått", color: "error" };
            case "invited":
                return { label: "Invitert", color: "default" };
            case "viewed":
                return { label: "Sett", color: "info" };
            default:
                return { label: status, color: "default" };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Chip
            label={config.label}
            color={config.color}
            size={size}
            sx={{ fontWeight: 500 }}
        />
    );
};

StatusChip.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export default StatusChip;
