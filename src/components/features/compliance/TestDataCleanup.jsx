import PropTypes from 'prop-types';
import {
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

/**
 * Test Data Cleanup Component
 * Handles deletion of test data with confirmation dialog
 */
export const TestDataCleanup = ({
    deleting,
    showDeleteDialog,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteCancel,
}) => {
    return (
        <>
            <Paper sx={{ p: 3, border: 1, borderColor: "error.main" }}>
                <Typography variant="h6" sx={{ mb: 2, color: "error.dark" }}>
                    <DeleteIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    Slett testdata
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Fjern alle testprosjekter, anskaffelser og kontrakter
                    opprettet av tester.
                </Typography>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onDeleteClick}
                    disabled={deleting}
                    startIcon={
                        deleting ? (
                            <CircularProgress size={20} />
                        ) : (
                            <DeleteIcon />
                        )
                    }
                >
                    {deleting ? "Sletter..." : "Slett testdata"}
                </Button>
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteDialog}
                onClose={onDeleteCancel}
            >
                <DialogTitle>Bekreft sletting</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Er du sikker på at du vil slette alle testdata? Dette
                        vil fjerne alle prosjekter, anskaffelser og kontrakter
                        som inneholder &quot;Test&quot; i navnet.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDeleteCancel}>
                        Avbryt
                    </Button>
                    <Button
                        onClick={onDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                    >
                        {deleting ? "Sletter..." : "Slett"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

TestDataCleanup.propTypes = {
    deleting: PropTypes.bool,
    showDeleteDialog: PropTypes.bool,
    onDeleteClick: PropTypes.func.isRequired,
    onDeleteConfirm: PropTypes.func.isRequired,
    onDeleteCancel: PropTypes.func.isRequired,
};

