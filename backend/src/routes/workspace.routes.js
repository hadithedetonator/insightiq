const express = require('express');
const {
    createWorkspace,
    getUserWorkspaces,
    getAllWorkspaces,
    discoverWorkspaces,
    requestJoinWorkspace,
    inviteUser,
    getUserInvitations,
    getPendingRequests,
    acceptInvitation,
    approveJoinRequest,
    rejectJoinRequest,
    getGlobalPendingRequests,
    getWorkspaceMembers,
    deleteWorkspace
} = require('../controllers/workspace.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);

router.post('/', createWorkspace);
router.get('/', getUserWorkspaces);
// Admin routes
router.get('/all', getAllWorkspaces);
router.get('/global-requests', getGlobalPendingRequests);

// General workspace routes
router.get('/discover', discoverWorkspaces);
router.post('/request-join', requestJoinWorkspace);
router.get('/invitations', getUserInvitations);
router.post('/invite', inviteUser);
router.post('/accept', acceptInvitation);
router.get('/:workspaceId/members', getWorkspaceMembers);
router.get('/:workspaceId/requests', getPendingRequests);
router.post('/approve-request', approveJoinRequest);
router.post('/reject-request', rejectJoinRequest);
router.delete('/:id', deleteWorkspace);

module.exports = router;
