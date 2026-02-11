import {
    TenderAwardDialog,
    TenderDeleteDialog,
    TenderStatusDialog,
    DocumentDeleteDialog,
} from "./index";

const TenderDetailsDialogs = ({
    awardActions,
    documentActions,
    onDeleteConfirm,
    tenderTitle,
}) => {
    return (
        <>
            <TenderAwardDialog
                open={awardActions.showAwardDialog}
                onClose={() => awardActions.setShowAwardDialog(false)}
                onConfirm={awardActions.handleAwardConfirm}
                awarding={awardActions.awarding}
                awardBidId={awardActions.awardBidId}
                onCancel={() => {
                    awardActions.setAwardBidId(null);
                    awardActions.setShowAwardDialog(false);
                }}
            />

            <DocumentDeleteDialog
                open={documentActions.showDeleteDocDialog}
                onClose={() => {
                    documentActions.setShowDeleteDocDialog(false);
                    documentActions.setDocToDelete(null);
                }}
                onConfirm={documentActions.handleRemoveDocumentConfirm}
                uploading={documentActions.uploadingDocuments}
                documentName={documentActions.docToDelete?.name}
            />

            <TenderStatusDialog
                open={awardActions.showCloseDialog}
                onClose={() => awardActions.setShowCloseDialog(false)}
                onConfirm={awardActions.handleCloseConfirm}
                changingStatus={awardActions.changingStatus}
                action="close"
            />

            <TenderStatusDialog
                open={awardActions.showReopenDialog}
                onClose={() => awardActions.setShowReopenDialog(false)}
                onConfirm={awardActions.handleReopenConfirm}
                changingStatus={awardActions.changingStatus}
                action="reopen"
            />

            <TenderDeleteDialog
                open={awardActions.showDeleteDialog}
                onClose={awardActions.handleDeleteCancel}
                onConfirm={onDeleteConfirm}
                deleting={awardActions.deletingTender}
                tenderTitle={tenderTitle}
            />
        </>
    );
};

export { TenderDetailsDialogs };






