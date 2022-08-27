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
            
            insightResult.push({
                user: user.id,
                images: images
            })
        }

        const result = await strapi.db
            .query("api::insight-result.insight-result")
            .createMany({
                data: insightResult
            })

        return {
            count: result,
            data: insightResult
        };
    },

    async find(ctx) {
        const result = await strapi.db
            .query('api::insight-result.insight-result')
            .findOne({
                where: {
                    user: ctx.state.user.id
                }
            })


        if (!result) {
            return {
                images: []
            }
        }

        return result
    }
}));
