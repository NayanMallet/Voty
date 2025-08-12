// server/src/routes/healthRoutes.ts
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

type DbState = "disconnected" | "connected" | "connecting" | "disconnecting" | "unknown";

function mongoState(rs: number): DbState {
    switch (rs) {
        case 0: return "disconnected";
        case 1: return "connected";
        case 2: return "connecting";
        case 3: return "disconnecting";
        default: return "unknown";
    }
}

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check (liveness & readiness)
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: Service not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get("/health", (_req, res) => {
    const rs = mongoose.connection.readyState; // 0..3
    const dbState = mongoState(rs);
    const ok = rs === 1;

    res.status(ok ? 200 : 503).json({
        ok,
        db: dbState,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV ?? "unknown",
    });
});

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     HealthResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *         db:
 *           type: string
 *           enum: [disconnected, connected, connecting, disconnecting, unknown]
 *         uptime:
 *           type: number
 *           format: float
 *           description: Process uptime in seconds
 *         timestamp:
 *           type: string
 *           format: date-time
 *         env:
 *           type: string
 *       example:
 *         ok: true
 *         db: connected
 *         uptime: 12.34
 *         timestamp: "2025-08-12T11:45:00.000Z"
 *         env: "development"
 */
