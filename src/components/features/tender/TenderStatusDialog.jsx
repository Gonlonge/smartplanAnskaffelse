import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import PropTypes from "prop-types";

/**
 * Dialog for confirming tender status changes (close/reopen)
 */
export const TenderStatusDialog = ({
    open,
    onClose,
    onConfirm,
    changingStatus,
    action, // "close" or "reopen"
}) => {
    const isClose = action === "close";
    const title = isClose ? "Lukk Anskaffelse" : "Gjenåpne Anskaffelse";
    const message = isClose
        ? "Er du sikker på at du vil lukke denne anskaffelsen? Leverandører vil ikke lenger kunne sende inn tilbud."
        : "Er du sikker på at du vil gjenåpne denne anskaffelsen? Leverandører vil igjen kunne sende inn tilbud.";
    const confirmText = isClose ? "Lukk" : "Gjenåpne";
    const loadingText = isClose ? "Lukker..." : "Gjenåpner...";

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={isClose ? "warning" : "primary"}
                    disabled={changingStatus}
                >
                    {changingStatus ? loadingText : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TenderStatusDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    changingStatus: PropTypes.bool,
    action: PropTypes.oneOf(["close", "reopen"]).isRequired,
};
