"use strict";

/**
 *  link-group controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
    "api::link-group.link-group",
    ({ strapi }) => ({
        async findOne(ctx) {
            const { id } = ctx.params;

            const entity = await strapi.db
                .query("api::link-group.link-group")
                .findOne({
                    populate: {
                        links: {
                            select: ["url", "display_text", "priority"],
                        },
                    },
                    where: { slug: id, released: true },
                });

            if (entity.links) {
                entity.links.sort((a, b) => {
                    if (!a) a = 0;
                    if (!b) b = 0;
                    return b.priority - a.priority;
                });
            }
            return entity;
        },
    })
);
