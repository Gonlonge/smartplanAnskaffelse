import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useState } from "react";
import PropTypes from "prop-types";

export const AnswerQuestionForm = ({
    question,
    onAnswerSubmitted,
    loading,
}) => {
    const [answer, setAnswer] = useState(question.answer || "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!answer.trim()) {
            setError("Vennligst skriv inn et svar");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            if (onAnswerSubmitted) {
                await onAnswerSubmitted(question.id, answer);
                setAnswer("");
            }
        } catch (err) {
            setError("Kunne ikke sende svar. Prøv igjen.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: "background.default",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                }}
            >
                <QuestionAnswerIcon
                    sx={{ color: "primary.main", fontSize: 20 }}
                    aria-hidden="true"
                />
                <Typography
                    component="h4"
                    variant="subtitle2"
                    sx={{ fontWeight: 600 }}
                >
                    Spørsmål fra {question.askedByCompany || "Leverandør"}
                </Typography>
            </Box>
            <Typography
                variant="body2"
                sx={{
                    mb: 2,
                    p: 1.5,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                    border: 1,
                    borderColor: "divider",
                }}
            >
                {question.question}
            </Typography>
            {question.answer ? (
                <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{ mb: 2 }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Ditt svar:
                    </Typography>
                    <Typography variant="body2">{question.answer}</Typography>
                </Alert>
            ) : (
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        id={`answer-input-${question.id}`}
                        name="answer"
                        label="Svar"
                        value={answer}
                        onChange={(e) => {
                            setAnswer(e.target.value);
                            setError("");
                        }}
                        placeholder="Skriv inn svaret ditt her..."
                        disabled={loading || submitting}
                        error={!!error}
                        helperText={error}
                        aria-describedby={
                            error
                                ? `answer-error-${question.id}`
                                : undefined
                        }
                        aria-invalid={!!error}
                        required
                        sx={{ mb: 2 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="small"
                        disabled={loading || submitting || !answer.trim()}
                        sx={{
                            textTransform: "none",
                            fontWeight: 500,
                        }}
                    >
                        {submitting ? "Sender..." : "Send svar"}
                    </Button>
                </form>
            )}
        </Paper>
    );
};

AnswerQuestionForm.propTypes = {
    question: PropTypes.shape({
        id: PropTypes.string.isRequired,
        question: PropTypes.string.isRequired,
        answer: PropTypes.string,
        askedByCompany: PropTypes.string,
    }).isRequired,
    onAnswerSubmitted: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

