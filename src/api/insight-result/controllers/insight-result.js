'use strict';

/**
 *  insight-result controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::insight-result.insight-result', ({ strapi }) => ({
    async createBulk(ctx) {
        const { data } = ctx.request.body;

        let insightResult = []

        for (let value of data) {
            const { username, images } = value;

            const user = await strapi.db
                .query("plugin::users-permissions.user")
                .findOne({
                    where: { username: username },
                    select: ["id"],
                });

            if (!user) return ctx.badRequest("User not found", { username: username });

            for (let image of images) {
                const result = await strapi.db
                    .query("api::insight-result.insight-result")
                    .create({
                        data: {
                            user: user.id,
                            image_url: image.url,
                            page: image.page
                        }
                    })
                insightResult.push(result)
            }
        }

        return {
            data: insightResult
        };
    },

    async find(ctx) {
        const result = await strapi.db
            .query('api::insight-result.insight-result')
            .findMany({
                where: {
                    user: ctx.state.user.id
                },
                select: ["image_url", "page"]
            })


        if (!result) {
            return {
                images: []
            }
        }

        return result
    }
}));
