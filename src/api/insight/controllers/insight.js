'use strict';

/**
 *  insight controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::insight.insight', ({ strapi }) => ({
    async create(ctx) {
        const { answer } = ctx.request.body

        const createInsight = await strapi.db
            .query('api::insight.insight')
            .create({
                data: {
                    user: ctx.state.user.id,
                    answer: answer,
                }
            })

        return createInsight
    },

    async findOne(ctx) {
        
    }
}));
