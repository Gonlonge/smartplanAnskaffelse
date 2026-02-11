import { useState } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import SendIcon from "@mui/icons-material/Send";
import {
    shouldSendEmail,
    sendTenderInvitationEmail,
    sendBidSubmissionEmail,
    sendContractSigningRequestEmail,
    sendDeadlineReminderEmail,
} from "../../../api/emailService";

const EMAIL_TYPES = [
    "TENDER_INVITATION",
    "NEW_BID",
    "CONTRACT_SIGNED",
    "DEADLINE_REMINDER",
];

const DEFAULT_TEST_EMAIL = "gonlonge@icloud.com";

/** Minimal mock data for devtools send tests only. Do not use in production. */
const getMockDataForType = (type) => {
    const baseTender = {
        id: "devtools-test-tender",
        title: "Devtools Test Anskaffelse",
        description: "Test",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        contractStandard: "NS 8405",
    };
    switch (type) {
        case "TENDER_INVITATION":
            return { tender: baseTender, supplierName: "Test" };
        case "NEW_BID":
            return {
                tender: baseTender,
                bid: {
                    companyName: "Test Leverandør",
                    submittedAt: new Date(),
                    price: 100000,
                },
            };
        case "CONTRACT_SIGNED": {
            const tender = { ...baseTender };
            return {
                contract: {
                    id: "devtools-test-contract",
                    tenderId: tender.id,
                    contractStandard: "NS 8405",
                    price: 100000,
                    version: 1,
                },
                tender,
            };
        }
        case "DEADLINE_REMINDER":
            return { tender: baseTender, daysUntilDeadline: 3 };
        default:
            return {};
    }
};

/**
 * Devtools: Email preference tests (gate only + real send).
 * Isolated; does not change production services.
 */
export const EmailPreferenceDevtools = ({ user }) => {
    const [testEmail, setTestEmail] = useState(DEFAULT_TEST_EMAIL);
    const [gateLoading, setGateLoading] = useState(false);
    const [gateResults, setGateResults] = useState(null);
    const [sendLoading, setSendLoading] = useState(false);
    const [sendResults, setSendResults] = useState(null);

    const runGateTest = async () => {
        if (!user?.id) {
            setGateResults({ error: "Not logged in" });
            return;
        }
        setGateLoading(true);
        setGateResults(null);
        try {
            const rows = [];
            for (const type of EMAIL_TYPES) {
                const allowed = await shouldSendEmail(user.id, type);
                rows.push({
                    type,
                    allowed,
                    reason: allowed ? "Allowed" : "Blocked (preferences)",
                });
            }
            setGateResults({ rows });
        } catch (err) {
            setGateResults({ error: err.message || "Gate test failed" });
        } finally {
            setGateLoading(false);
        }
    };

    const runRealSendTest = async () => {
        if (!user?.id) {
            setSendResults({ error: "Not logged in" });
            return;
        }
        if (!testEmail?.trim()) {
            setSendResults({ error: "Test email address required" });
            return;
        }
        setSendLoading(true);
        setSendResults(null);
        const targetEmail = testEmail.trim();
        const rows = [];
        try {
            for (const type of EMAIL_TYPES) {
                const allowed = await shouldSendEmail(user.id, type);
                let attempted = false;
                let status = "Skipped";
                if (allowed) {
                    attempted = true;
                    try {
                        if (type === "TENDER_INVITATION") {
                            const { tender, supplierName } =
                                getMockDataForType(type);
                            const r = await sendTenderInvitationEmail(
                                targetEmail,
                                tender,
                                supplierName,
                            );
                            status = r.success
                                ? r.skipped
                                    ? "Skipped"
                                    : "Sent"
                                : `Error: ${r.error || "unknown"}`;
                        } else if (type === "NEW_BID") {
                            const { tender, bid } = getMockDataForType(type);
                            const r = await sendBidSubmissionEmail(
                                targetEmail,
                                tender,
                                bid,
                            );
                            status = r.success
                                ? r.skipped
                                    ? "Skipped"
                                    : "Sent"
                                : `Error: ${r.error || "unknown"}`;
                        } else if (type === "CONTRACT_SIGNED") {
                            const { contract, tender } =
                                getMockDataForType(type);
                            const r = await sendContractSigningRequestEmail(
                                targetEmail,
                                contract,
                                tender,
                            );
                            status = r.success
                                ? r.skipped
                                    ? "Skipped"
                                    : "Sent"
                                : `Error: ${r.error || "unknown"}`;
                        } else if (type === "DEADLINE_REMINDER") {
                            const { tender, daysUntilDeadline } =
                                getMockDataForType(type);
                            const r = await sendDeadlineReminderEmail(
                                targetEmail,
                                tender,
                                daysUntilDeadline,
                            );
                            status = r.success
                                ? r.skipped
                                    ? "Skipped"
                                    : "Sent"
                                : `Error: ${r.error || "unknown"}`;
                        }
                    } catch (e) {
                        status = `Error: ${e.message || "unknown"}`;
                    }
                }
                rows.push({
                    type,
                    allowed,
                    attempted,
                    status,
                    targetEmail,
                });
            }
            setSendResults({ rows, targetEmail });
        } catch (err) {
            setSendResults({ error: err.message || "Send test failed" });
        } finally {
            setSendLoading(false);
        }
    };

    return (
        <>
            <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 2, fontWeight: 600 }}
            >
                <SettingsIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Devtools: E-post varselinnstillinger
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                Verifiser at shouldSendEmail og innstillinger styrer sending.
                Ingen e-post sendes i Gate Test. Real Send bruker kun angitt
                adresse.
            </Alert>

            {/* 1) Gate Test (No Email Sent) */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    1) Test Email Preference Logic (No Send)
                </Typography>
                <Button
                    variant="outlined"
                    onClick={runGateTest}
                    disabled={gateLoading || !user?.id}
                    startIcon={
                        gateLoading ? (
                            <CircularProgress size={20} />
                        ) : (
                            <SettingsIcon />
                        )
                    }
                    sx={{ mb: 2 }}
                >
                    {gateLoading
                        ? "Kjører..."
                        : "Test Email Preference Logic (No Send)"}
                </Button>
                {gateResults?.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {gateResults.error}
                    </Alert>
                )}
                {gateResults?.rows && (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Allowed</TableCell>
                                    <TableCell>Reason</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {gateResults.rows.map((row) => (
                                    <TableRow key={row.type}>
                                        <TableCell>{row.type}</TableCell>
                                        <TableCell>
                                            {row.allowed ? "Yes" : "No"}
                                        </TableCell>
                                        <TableCell>{row.reason}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* 2) Real Send Test */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                    2) Send Test Emails (Respects Preferences)
                </Typography>
                <Box sx={{ mb: 2, maxWidth: 400 }}>
                    <TextField
                        fullWidth
                        type="email"
                        label="Email address for testing"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder={DEFAULT_TEST_EMAIL}
                        variant="outlined"
                        size="small"
                    />
                </Box>
                <Button
                    variant="contained"
                    onClick={runRealSendTest}
                    disabled={sendLoading || !user?.id || !testEmail?.trim()}
                    startIcon={
                        sendLoading ? (
                            <CircularProgress size={20} />
                        ) : (
                            <SendIcon />
                        )
                    }
                    sx={{ mb: 2 }}
                >
                    {sendLoading
                        ? "Kjører..."
                        : "Send Test Emails (Respects Preferences)"}
                </Button>
                {sendResults?.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {sendResults.error}
                    </Alert>
                )}
                {sendResults?.rows && (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Allowed</TableCell>
                                    <TableCell>Attempted</TableCell>
                                    <TableCell>Sent/Skipped</TableCell>
                                    <TableCell>Target Email</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sendResults.rows.map((row) => (
                                    <TableRow key={row.type}>
                                        <TableCell>{row.type}</TableCell>
                                        <TableCell>
                                            {row.allowed ? "Yes" : "No"}
                                        </TableCell>
                                        <TableCell>
                                            {row.attempted ? "Yes" : "No"}
                                        </TableCell>
                                        <TableCell>{row.status}</TableCell>
                                        <TableCell>{row.targetEmail}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </>
    );
};

EmailPreferenceDevtools.propTypes = {
    user: PropTypes.object,
};
