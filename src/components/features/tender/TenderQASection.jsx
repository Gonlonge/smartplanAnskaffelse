import {
    Box,
    Typography,
    Paper,
    Chip,
    Alert,
    List,
    ListItem,
    ListItemText,
    alpha,
    useTheme,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { DateDisplay } from "../../common";
import { AnswerQuestionForm } from "./AnswerQuestionForm";
import PropTypes from "prop-types";

export const TenderQASection = ({
    tender,
    isSender,
    qaActions,
    loading,
    user,
}) => {
    const theme = useTheme();

    const unansweredQuestions = tender.qa?.filter((q) => !q.answer) || [];
    const hasUnansweredQuestions = unansweredQuestions.length > 0;

    return (
        <Paper
            elevation={0}
            sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                }}
            >
                <DescriptionIcon sx={{ color: "primary.main" }} />
                <Typography
                    component="h2"
                    variant="h6"
                    sx={{ fontWeight: 600 }}
                >
                    Spørsmål og svar
                </Typography>
                {tender.qa?.length > 0 && (
                    <Chip
                        label={tender.qa.length}
                        size="small"
                        color="primary"
                    />
                )}
            </Box>

            {qaActions.qaError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {qaActions.qaError}
                </Alert>
            )}

            {/* Unanswered questions for senders */}
            {isSender &&
                tender.status === "open" &&
                hasUnansweredQuestions && (
                    <Box sx={{ mb: 3, p: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 2,
                            }}
                        >
                            <Chip
                                label={unansweredQuestions.length}
                                size="small"
                                color="info"
                            />
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600 }}
                            >
                                Ubesvarte spørsmål
                            </Typography>
                        </Box>
                        {unansweredQuestions
                            .sort(
                                (a, b) =>
                                    new Date(b.askedAt) -
                                    new Date(a.askedAt)
                            )
                            .map((question) => (
                                <AnswerQuestionForm
                                    key={question.id}
                                    question={question}
                                    onAnswerSubmitted={(id, text) =>
                                        qaActions.handleAnswerQuestion(
                                            id,
                                            text,
                                            user
                                        )
                                    }
                                    loading={loading}
                                />
                            ))}
                    </Box>
                )}
            {isSender &&
                tender.status === "draft" &&
                hasUnansweredQuestions && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Du kan ikke besvare spørsmål før Anskaffelsen er
                        publisert. Publiser Anskaffelsen først.
                    </Alert>
                )}

            {/* All Q&A */}
            {tender.qa?.length > 0 ? (
                <List>
                    {tender.qa
                        .sort(
                            (a, b) =>
                                new Date(b.askedAt) - new Date(a.askedAt)
                        )
                        .map((qa) => (
                            <ListItem key={qa.id}>
                                <ListItemText
                                    primary={qa.question}
                                    primaryTypographyProps={{
                                        variant: "body1",
                                        sx: {
                                            fontWeight: 500,
                                            mb: 1,
                                        },
                                    }}
                                    secondary={
                                        <Box sx={{ mt: 1 }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                component="span"
                                                sx={{
                                                    display: "block",
                                                }}
                                            >
                                                <strong>Spurt av:</strong>{" "}
                                                {qa.askedByCompany || "Ukjent"}
                                            </Typography>
                                            {qa.askedAt && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    component="span"
                                                    sx={{
                                                        display: "block",
                                                    }}
                                                >
                                                    Spurt:{" "}
                                                    <DateDisplay
                                                        date={qa.askedAt}
                                                    />
                                                </Typography>
                                            )}
                                            {qa.answer && (
                                                <Typography
                                                    variant="body2"
                                                    component="div"
                                                    sx={{
                                                        mt: 1,
                                                        p: 1.5,
                                                        backgroundColor: alpha(
                                                            theme.palette.success
                                                                .main,
                                                            0.1
                                                        ),
                                                        borderRadius: 1,
                                                        border: 1,
                                                        borderColor: alpha(
                                                            theme.palette.success
                                                                .main,
                                                            0.3
                                                        ),
                                                    }}
                                                >
                                                    <strong>Svar:</strong>{" "}
                                                    {qa.answer}
                                                </Typography>
                                            )}
                                            {!qa.answer && (
                                                <Chip
                                                    label="Venter på svar"
                                                    size="small"
                                                    color="warning"
                                                    sx={{ mt: 1 }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondaryTypographyProps={{
                                        component: "div",
                                    }}
                                />
                            </ListItem>
                        ))}
                </List>
            ) : (
                <Typography
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 4 }}
                >
                    Ingen spørsmål ennå
                </Typography>
            )}
        </Paper>
    );
};

TenderQASection.propTypes = {
    tender: PropTypes.shape({
        qa: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                question: PropTypes.string.isRequired,
                answer: PropTypes.string,
                askedAt: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.instanceOf(Date),
                ]),
                askedByCompany: PropTypes.string,
            })
        ),
        status: PropTypes.string.isRequired,
    }).isRequired,
    isSender: PropTypes.bool.isRequired,
    qaActions: PropTypes.shape({
        handleAnswerQuestion: PropTypes.func.isRequired,
        qaError: PropTypes.string,
    }).isRequired,
    loading: PropTypes.bool,
    user: PropTypes.object,
};

