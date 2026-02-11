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
 * Dialog for confirming tender award
 */
export const TenderAwardDialog = ({
    open,
    onClose,
    onConfirm,
    awarding,
    awardBidId,
    onCancel,
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Tildele kontrakt</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Er du sikker på at du vil tildele kontrakten til denne
                    leverandøren? Denne handlingen kan ikke angres.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onCancel();
                        onClose();
                    }}
                >
                    Avbryt
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="primary"
                    disabled={awarding}
                >
                    {awarding ? "Tildeler..." : "Tildele"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TenderAwardDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    awarding: PropTypes.bool,
    awardBidId: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
};
