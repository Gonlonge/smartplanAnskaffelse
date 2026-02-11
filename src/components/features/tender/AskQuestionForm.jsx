import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useState } from "react";
import PropTypes from "prop-types";

export const AskQuestionForm = ({ tenderId, onQuestionAdded, loading }) => {
    const [question, setQuestion] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            setError("Vennligst skriv inn et spørsmål");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            if (onQuestionAdded) {
                await onQuestionAdded(question);
                setQuestion("");
            }
        } catch (err) {
            setError("Kunne ikke sende spørsmål. Prøv igjen.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                mb: 3,
                borderRadius: 2,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                }}
            >
                <QuestionAnswerIcon
                    sx={{ color: "primary.main" }}
                    aria-hidden="true"
                />
                <Typography
                    component="h3"
                    variant="h6"
                    sx={{ fontWeight: 600 }}
                >
                    Still et spørsmål
                </Typography>
            </Box>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
            >
                Har du spørsmål om denne Anskaffelsen? Send inn spørsmålet
                ditt, og vi vil besvare det så snart som mulig.
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    id="question-input"
                    name="question"
                    label="Spørsmål"
                    value={question}
                    onChange={(e) => {
                        setQuestion(e.target.value);
                        setError("");
                    }}
                    placeholder="Skriv inn spørsmålet ditt her..."
                    disabled={loading || submitting}
                    error={!!error}
                    helperText={error}
                    aria-describedby={error ? "question-error" : undefined}
                    aria-invalid={!!error}
                    required
                    sx={{ mb: 2 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    disabled={loading || submitting || !question.trim()}
                    sx={{
                        textTransform: "none",
                        fontWeight: 500,
                    }}
                >
                    {submitting ? "Sender..." : "Send spørsmål"}
                </Button>
            </form>
        </Paper>
    );
};

AskQuestionForm.propTypes = {
    tenderId: PropTypes.string.isRequired,
    onQuestionAdded: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

