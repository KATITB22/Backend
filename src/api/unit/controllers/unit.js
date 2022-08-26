"use strict";

/**
 *  unit controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const defFaculty = [
    "FITB",
    "FMIPA",
    "FSRD",
    "FTI",
    "FTMD",
    "FTSL",
    "FTTM",
    "FTTM-C",
    "SAPPK",
    "SBM",
    "SF",
    "SITH",
    "SITH-R",
    "SITH-S",
    "STEI",
    "STEI-K",
    "STEI-R",
    "-",
];

module.exports = createCoreController("api::unit.unit", ({ strapi }) => ({
    async findOne(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::unit.unit").findOne({
            where: { ext_id: id },
            populate: { image: true },
        });

        return entity;
    },

    async find() {
        const entity = await strapi.db.query("api::unit.unit").findMany({
            populate: { image: true },
        });

        return entity;
    },

    async update(ctx) {
        const { id } = ctx.params;

        const { visitors } = ctx.request.body;

        const entity = await strapi.db.query("api::unit.unit").update({
            where: { ext_id: id },
            data: {
                visitors,
            },
        });
        return entity;
    },

    async getScore(ctx) {
        const {
            page = 1,
            search = "",
            lim = 10,
            facultys = defFaculty,
        } = ctx.query;
        const filterFaculty =
            facultys.length === 18 ? facultys : facultys.split(",");
        const [entity, count] = await strapi.db
            .query("plugin::users-permissions.user")
            .findWithCount({
                limit: lim,
                offset: (page - 1) * lim,
                orderBy: { score: "desc", username: "asc" },
                select: ["username", "name", "score", "faculty"],
                where: {
                    role: {
                        name: "Participant",
                    },
                    faculty: {
                        $in: filterFaculty,
                    },
                    $or: [
                        {
                            username: { $containsi: search },
                        },
                        {
                            name: { $containsi: search },
                        },
                    ],
                    $or: [
                        {
                            hideScoreboard: false,
                        },
                        {
                            hideScoreboard: null,
                        },
                    ],
                    $or: [
                        {
                            score: { $gt: 0 },
                        },
                        {
                            score: { $ne: null },
                        },
                    ],
                },
            });
        const res = entity.map((item, idx) => {
            return {
                rank: (page - 1) * 10 + idx + 1,
                ...item,
            };
        });

        return {
            data: res,
            metadata: {
                total: count,
                pageCount: Math.ceil(count / lim),
            },
        };
    },

    async updateScore(ctx) {
        const { username, score, username_unit } = ctx.request.body;

        const unit = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: { username: username_unit },
            });

        if (
            !unit ||
            unit.score === null ||
            unit.score <= 0 ||
            unit.score - score <= 0
        ) {
            return ctx.badRequest("Skor tidak memadai");
        }

        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: { username },
            });

        unit.score -= score;
        user.score += score;

        const newUser = await strapi.db
            .query("plugin::users-permissions.user")
            .update({
                select: ["username", "name", "score"],
                where: { username },
                data: { score: user.score },
            });

        const newUnit = await strapi.db
            .query("plugin::users-permissions.user")
            .update({
                select: ["username", "name", "score"],
                where: { username: username_unit },
                data: { score: unit.score },
            });

        return {
            data: {
                user: newUser,
                unit: newUnit,
            },
            message: "SUCCESS",
        };
    },

    async getShowcase() {
        const entity = await strapi.db.query("api::unit.unit").findMany({
            populate: { image: true },
            orderBy: { visitors: "asc" },
            limit: 3,
        });

        return entity;
    },
}));
