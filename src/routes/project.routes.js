import { Router } from 'express';
import { 
    createProject,
    getProject,
    getProjectById,
    updateProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember
    } from '../controllers/project.controller.js';
import { login } from '../controllers/auth.controller.js';
import {
    createProjectValidator,
    addMemberToProjectValidator
    } from '../validators/index.js';
import { validateRequest } from '../middlewares/validator.middleware.js';
import { userRegistrationValidator } from '../validators/index.js';
import { verifyJWTtoken, validateProjectPermission} from '../middlewares/auth.middleware.js';
import { logoutUser } from '../controllers/auth.controller.js';
import { get } from 'mongoose';
import { AvailableUserRoles } from '../utils/constants.js';

const router = Router();

router.use(verifyJWTtoken);

router.route('/').get(getProject).post(createProjectValidator(),
 validateRequest, createProject);

router.route('/:projectId')
    .get
    (validateProjectPermission(Object.values(AvailableUserRoles)), getProjectById)
    .put
    (validateProjectPermission([AvailableUserRoles.ADMIN]),
     createProjectValidator(), validateRequest, updateProject)
    .delete
    (validateProjectPermission([AvailableUserRoles.ADMIN]), deleteProject);

router.route('/:projectId/members')
    .get(getProjectMembers)
    .post
    (
    validateProjectPermission([AvailableUserRoles.ADMIN]),
    addMemberToProjectValidator(),
    validateRequest,
    addMembersToProject);
  
router.route('/:projectId/members/:userId')
    .put
    (
    validateProjectPermission([AvailableUserRoles.ADMIN]),
    updateMemberRole)
    .delete
    (
    validateProjectPermission([AvailableUserRoles.ADMIN]),
    deleteMember);


export default router;