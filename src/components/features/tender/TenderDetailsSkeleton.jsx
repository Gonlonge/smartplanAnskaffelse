import { Box, Skeleton, Grid } from "@mui/material";

/**
 * Loading skeleton for TenderDetails page
 */
export const TenderDetailsSkeleton = () => {
    return (
        <Box>
            <Skeleton
                variant="rectangular"
                width={200}
                height={40}
                sx={{ mb: 3, borderRadius: 1 }}
            />
            <Skeleton
                variant="text"
                width="60%"
                height={48}
                sx={{ mb: 2 }}
            />
            <Skeleton
                variant="rectangular"
                width={100}
                height={32}
                sx={{ mb: 4, borderRadius: 1 }}
            />
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Skeleton
                        variant="rectangular"
                        height={200}
                        sx={{ mb: 3, borderRadius: 2 }}
                    />
                    <Skeleton
                        variant="rectangular"
                        height={200}
                        sx={{ mb: 3, borderRadius: 2 }}
                    />
                    <Skeleton
                        variant="rectangular"
                        height={200}
                        sx={{ mb: 3, borderRadius: 2 }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Skeleton
                        variant="rectangular"
                        height={400}
                        sx={{ borderRadius: 2 }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TenderDetailsSkeleton;

