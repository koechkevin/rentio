import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";

const router = Router();

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload a file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid request
 */
router.post(
  "/",

  //   @ts-ignore
  uploadController.upload.single("file"),
  uploadController.uploadFile,
);

/**
 * @swagger
 * /uploads/link:
 *   post:
 *     summary: Link an upload to an entity
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uploadId
 *               - entityType
 *               - entityId
 *             properties:
 *               uploadId:
 *                 type: string
 *               entityType:
 *                 type: string
 *                 enum: [UNIT, PROPERTY, USER]
 *               entityId:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Upload linked successfully
 */
router.post("/link", uploadController.linkUpload);

/**
 * @swagger
 * /uploads/entity/{entityType}/{entityId}:
 *   get:
 *     summary: Get all uploads for an entity
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of uploads
 */
router.get(
  "/entity/:entityType/:entityId",

  uploadController.getEntityUploads,
);

/**
 * @swagger
 * /uploads/link/{id}:
 *   patch:
 *     summary: Update upload order or primary status
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: integer
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Upload updated successfully
 */
router.patch(
  "/link/:id",

  uploadController.updateUploadOrder,
);

/**
 * @swagger
 * /uploads/link/{id}:
 *   delete:
 *     summary: Unlink an upload from an entity
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upload unlinked successfully
 */
router.delete("/link/:id", uploadController.unlinkUpload);

/**
 * @swagger
 * /uploads/{id}:
 *   get:
 *     summary: Get upload details
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upload details
 */
router.get("/:id", uploadController.getUpload);

export default router;
