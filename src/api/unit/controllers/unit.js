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
        });

        return entity;
    },

    async find() {
        const entity = await strapi.db.query("api::unit.unit").findMany();

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
            orderBy: { visitors: "asc" },
            limit: 3,
        });

        return entity;
    },

    async findParticipant(ctx) {
        const { search } = ctx.query;

        const entity = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: {
                    role: {
                        name: "Participant",
                    },
                    $or: [
                        {
                            name: search,
                        },
                        {
                            username: search,
                        },
                    ],
                },
                select: ["username", "name", "score"],
            });

        return entity;
    },

    async getRecommendation() {
        const entity = await strapi.db.query("api::unit.unit").findMany({
            where: {
                isRec: true,
            },
            orderBy: {
                lelang: "desc",
            },
        });

        return entity;
    },

    async getLiveStatus(ctx) {
        const { name } = ctx.query;

        const entity = await strapi.db.query("api::unit.unit").findOne({
            where: {
                name: name,
            },
            select: ["name", "isLive"],
        });

        return entity;
    },

    async updateLiveStatus(ctx) {
        const { name, status } = ctx.request.body;

        const entity = await strapi.db.query("api::unit.unit").update({
            where: {
                name: name,
            },
            data: {
                isLive: status,
            },
            select: ["name", "isLive"],
        });

        entity.message = "SUCCESS";

        return entity;
    },

    async getMap() {
        const entities = await strapi.db.query("api::unit.unit").findMany({
            select: [
                "ext_id",
                "name",
                "logo",
                "position",
                "coloredIcon",
                "bnwIcon",
            ],
        });

        const values = entities.map((entity) => ({
            ext_id: entity.ext_id,
            name: entity.name,
            url: entity.logo,
            position: entity.position,
            coloredIcon: entity.coloredIcon,
            bnwIcon: entity.bnwIcon,
        }));

        return values;
    },

    async createMany(ctx) {
        const { data } = ctx.request.body;

        const result = [];

        for (let i = 0; i < data.length; i++) {
            let data_i = data[i];
            let entity = await strapi.db
                .query("api::unit.unit")
                .create({ data: data_i });
            result.push(entity);
        }

        return result;
    },
}));
