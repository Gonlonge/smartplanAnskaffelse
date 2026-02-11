import { Alert } from "@mui/material";

const TenderDetailsErrorAlerts = ({
    awardError,
    statusError,
    deleteError,
    contractError,
}) => {
    return (
        <>
            {awardError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {awardError}
                </Alert>
            )}

            {statusError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {statusError}
                </Alert>
            )}

            {deleteError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {deleteError}
                </Alert>
            )}

            {contractError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {contractError}
                </Alert>
            )}
        </>
    );
};

export { TenderDetailsErrorAlerts };






