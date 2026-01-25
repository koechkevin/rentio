import { Router } from "express";
import * as publicController from "../controllers/public.controller";

const router = Router();

/**
 * @swagger
 * /public/properties:
 *   get:
 *     summary: Search public property listings
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of available properties
 */
router.get("/properties", publicController.searchProperties);

/**
 * @swagger
 * /public/properties/{id}:
 *   get:
 *     summary: Get public property details
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *       404:
 *         description: Property not found
 */
router.get("/properties/:id", publicController.getPropertyDetails);

/**
 * @swagger
 * /properties/resolve:
 *   get:
 *     summary: Resolve property address to coordinates
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coordinates of the property
 */
router.get("/properties/resolve", publicController.resolveProperty);

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Get all property listings
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: List of property listings
 */
router.get("/listings", publicController.getListings);

/**
 * @swagger
 * /listings/{id}/view:
 *   post:
 *     summary: Track a property listing view
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully tracked the view
 */
router.post("/listings/:id/view", publicController.trackListingView);

export default router;
