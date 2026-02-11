import { Alert, Button } from "@mui/material";

const ContractGenerationAlert = ({
    onGenerateContract,
    generatingContract,
}) => {
    return (
        <Alert
            severity="info"
            action={
                <Button
                    color="inherit"
                    size="small"
                    onClick={onGenerateContract}
                    disabled={generatingContract}
                >
                    {generatingContract ? "Genererer..." : "Generer kontrakt"}
                </Button>
            }
            sx={{ mb: 3 }}
        >
            Ventetiden er utløpt. Du kan nå generere kontrakten.
        </Alert>
    );
};

export { ContractGenerationAlert };






