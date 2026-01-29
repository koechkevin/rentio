import { Router } from "express";
// import multer from "multer";
import { UserProfileController } from "../controllers/userProfile.controller";
import multer from "multer";

const router = Router();
const userProfileController = new UserProfileController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * @swagger
 * /api/v1/user-profile/{userId}:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve user profile information by user ID
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 displayPicture:
 *                   type: string
 *                 backgroundPicture:
 *                   type: string
 *                 about:
 *                   type: string
 *                 website:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:userId", userProfileController.getUserProfile);

/**
 * @swagger
 * /api/user-profile/{userId}:
 *   put:
 *     summary: Update user profile
 *     description: Update user profile information including display and background pictures
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               about:
 *                 type: string
 *                 description: User's about/bio information
 *               website:
 *                 type: string
 *                 description: User's website URL
 *               displayPicture:
 *                 type: string
 *                 format: binary
 *                 description: Display picture image file (max 5MB)
 *               backgroundPicture:
 *                 type: string
 *                 format: binary
 *                 description: Background picture image file (max 5MB)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 displayPicture:
 *                   type: string
 *                 backgroundPicture:
 *                   type: string
 *                 about:
 *                   type: string
 *                 website:
 *                   type: string
 *       400:
 *         description: Invalid file format
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update profile
 */
router.put(
  "/:userId",
  //   @ts-ignore
  upload.fields([
    { name: "displayPicture", maxCount: 1 },
    { name: "backgroundPicture", maxCount: 1 },
  ]),
  userProfileController.updateUserProfile,
);

/**
 * @swagger
 * /api/user-profile/{userId}/activities:
 *   get:
 *     summary: Get user activities
 *     description: Retrieve user's activity timeline (location changes, uploads, etc.)
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of activities to return
 *     responses:
 *       200:
 *         description: User activities retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   activityType:
 *                     type: string
 *                     enum: [LOCATION_CHANGE, DOCUMENT_UPLOAD, PROPERTY_ADDITION, PROFILE_UPDATE]
 *                   description:
 *                     type: string
 *                   metadata:
 *                     type: object
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch activities
 */
router.get("/:userId/activities", (req, res) =>
  userProfileController.getUserActivities(req, res),
);

/**
 * @swagger
 * /api/user-profile/{userId}/tenancy:
 *   get:
 *     summary: Get user tenancy agreement
 *     description: Retrieve user's active tenancy agreement details
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Tenancy agreement retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 propertyId:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                 rentAmount:
 *                   type: number
 *                 rentFrequency:
 *                   type: string
 *                   enum: [MONTHLY, QUARTERLY, ANNUALLY]
 *                 agreementDocument:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, EXPIRED, TERMINATED]
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active tenancy found
 *       500:
 *         description: Failed to fetch tenancy agreement
 */
router.get("/:userId/tenancy", (req, res) =>
  userProfileController.getTenancyAgreement(req, res),
);

/**
 * @swagger
 * /api/user-profile/{userId}/uploads:
 *   get:
 *     summary: Get user uploads
 *     description: Retrieve all documents uploaded by the user
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of uploads to return
 *     responses:
 *       200:
 *         description: User uploads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   activityType:
 *                     type: string
 *                     enum: [DOCUMENT_UPLOAD]
 *                   description:
 *                     type: string
 *                   metadata:
 *                     type: object
 *                     properties:
 *                       fileName:
 *                         type: string
 *                       fileUrl:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch uploads
 */
router.get("/:userId/uploads", userProfileController.getUserUploads);

export default router;
