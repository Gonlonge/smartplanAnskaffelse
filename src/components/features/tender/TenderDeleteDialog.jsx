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
 * Dialog for confirming tender deletion
 */
export const TenderDeleteDialog = ({
    open,
    onClose,
    onConfirm,
    deleting,
    tenderTitle,
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Slett Anskaffelse</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Er du sikker på at du vil slette &quot;{tenderTitle}
                    &quot;? Denne handlingen kan ikke angres.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={deleting}>
                    Avbryt
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={deleting}
                >
                    {deleting ? "Sletter..." : "Slett"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TenderDeleteDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    deleting: PropTypes.bool,
    tenderTitle: PropTypes.string,
};
