"use strict";

/**
 *  unit controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

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
        // TODO tambahin filter fakultas?
        const { page = 1, search = "" } = ctx.query;
        const [entity, count] = await strapi.db.query('plugin::users-permissions.user').findWithCount({
            limit: 5,
            offset: (page - 1) * 5,
            orderBy: { score: 'desc', username: 'asc' },
            select: ['username', 'name', 'score'],
            where: {
                $or: [
                    {
                        username: { $containsi: search }
                    },
                    {
                        name: { $containsi: search }
                    }
                ],
                role: {
                    name: 'Participant'
                }
            }
        });

        return {
            data: entity,
            metadata: {
                total: count,
                pageCount: Math.ceil(count / 5)
            }
        }
    },

    async updateScore(ctx) {
        const { username, score } = ctx.request.body;
        
        const entity = await strapi.db.query('plugin::users-permissions.user').update({
            select: ['username', 'name', 'score'],
            where: { username },
            data: { score }
        });
        entity.message = 'SUCCESS';

        return entity;
    }
}));
