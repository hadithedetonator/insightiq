const express = require('express');
const {
    getUsers,
    updateUserRole,
    updateWorkspaceRole,
    addUserToWorkspace,
    removeUserFromWorkspace,
    deleteUser,
    createUser
} = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/role', updateUserRole);
router.put('/workspace-role', updateWorkspaceRole);
router.post('/add-to-workspace', addUserToWorkspace);
router.post('/remove-from-workspace', removeUserFromWorkspace);
router.delete('/:userId', deleteUser);

module.exports = router;
