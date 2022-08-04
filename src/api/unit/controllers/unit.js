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
}));
