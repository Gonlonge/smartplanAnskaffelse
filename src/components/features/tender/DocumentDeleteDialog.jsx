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
 * Dialog for confirming document deletion
 */
export const DocumentDeleteDialog = ({
    open,
    onClose,
    onConfirm,
    uploading,
    documentName,
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Slett dokument</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Er du sikker på at du vil slette &quot;{documentName}
                    &quot;? Denne handlingen kan ikke angres.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Avbryt</Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={uploading}
                >
                    {uploading ? "Sletter..." : "Slett"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DocumentDeleteDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    uploading: PropTypes.bool,
    documentName: PropTypes.string,
};
