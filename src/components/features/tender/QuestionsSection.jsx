import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

export const QuestionsSection = ({
    questions,
    questionInput,
    onQuestionInputChange,
    onAddQuestion,
    onRemoveQuestion,
    loading,
}) => {
    return (
        <Accordion
            sx={{
                boxShadow: "none",
                "&:before": {
                    display: "none",
                },
                "&.Mui-expanded": {
                    margin: 0,
                },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon color="primary" />}
                sx={{
                    backgroundColor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    px: 2,
                    py: 1.5,
                    "&:hover": {
                        backgroundColor: "action.hover",
                    },
                    "&.Mui-expanded": {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    <QuestionAnswerIcon color="primary" />
                    <Typography
                        variant="h6"
                        color="primary"
                        sx={{
                            fontSize: {
                                xs: "1rem",
                                sm: "1.25rem",
                            },
                            fontWeight: 600,
                        }}
                    >
                        Spørsmål
                    </Typography>
                    {questions.length > 0 && (
                        <Chip
                            label={questions.length}
                            size="small"
                            sx={{
                                ml: 1,
                                backgroundColor: "primary.main",
                                color: "primary.contrastText",
                            }}
                        />
                    )}
                </Box>
            </AccordionSummary>
            <AccordionDetails
                sx={{
                    border: 1,
                    borderTop: 0,
                    borderColor: "divider",
                    borderBottomLeftRadius: 1,
                    borderBottomRightRadius: 1,
                    backgroundColor: "background.paper",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 2, sm: 3 },
                }}
            >
                <Box sx={{ mb: 3 }}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Legg til spørsmål som kan stilles av leverandører. Disse
                        kan besvares senere.
                    </Typography>

                    <TextField
                        fullWidth
                        id="question-input"
                        label="Nytt spørsmål"
                        value={questionInput}
                        onChange={onQuestionInputChange}
                        disabled={loading}
                        multiline
                        rows={2}
                        placeholder="Skriv inn spørsmål her..."
                        sx={{ mb: 2 }}
                    />

                    {/* "Legg til" button */}
                    <Box sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={onAddQuestion}
                            disabled={loading}
                            aria-busy={loading}
                            sx={{
                                fontSize: {
                                    xs: "1rem",
                                    sm: "0.875rem",
                                },
                                minHeight: {
                                    xs: 44,
                                    sm: 56,
                                },
                                textTransform: "none",
                                fontWeight: 500,
                            }}
                        >
                            Legg til
                        </Button>
                    </Box>

                    {questions.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Lagt til spørsmål ({questions.length})
                            </Typography>
                            <List
                                dense
                                sx={{
                                    backgroundColor: "background.paper",
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: "divider",
                                }}
                            >
                                {questions.map((question) => (
                                    <ListItem key={question.id}>
                                        <ListItemText
                                            primary={question.question}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                aria-label="fjern"
                                                onClick={() =>
                                                    onRemoveQuestion(
                                                        question.id
                                                    )
                                                }
                                                disabled={loading}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};
