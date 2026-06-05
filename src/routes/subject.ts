import express from "express";
import { and, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { subjects, departments } from "../db/schema/app";
import { db } from "../db";

const router = express.Router();

// Get all subjects with optional search, filtering and pagination
router.get("/", async (req, res) => {
    try {
        const { search, departments: deptFilter, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, +page);
        const limitPerPage = Math.max(1, +limit);

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        // If search query exists, filter by subject name OR subject code
        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        // If department filter exists, match department name
        if (deptFilter) {
            filterConditions.push(ilike(departments.name, `%${deptFilter}%`));
        }

        // Combine all filters using AND if any exist
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        // Count total matching subjects
        const countResults = await db
            .select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = Number(countResults[0]?.count ?? 0);

        // Fetch paginated subjects list with department details
        const subjectList = await db
            .select({
                ...getTableColumns(subjects),
                department: getTableColumns(departments)
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectList,
            meta: {
                total: totalCount,
                page: currentPage,
                limit: limitPerPage,
                totalPages: Math.ceil(totalCount / limitPerPage),
            }
        });
    } catch (e) {
        console.error(`GET /subjects error: ${e}`);
        res.status(500).json({ error: 'Failed to get subjects' });
    }
});

export default router;