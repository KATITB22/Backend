'use strict';

/**
 *  ohu controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::ohu.ohu', ({ strapi }) => ({
    async find(ctx) {
        const { page = 1, search = "" } = ctx.query;
        const [entity, count] = await strapi.db.query('api::ohu.ohu').findWithCount({
        limit: 10,
        offset: (page - 1) * 10,
        orderBy: { score: 'desc' },
        select: ['score'],
        populate: {
            user: {
                select: ['username', 'name']
            }
        },
        where: {
            $or: [
                {
                    user: { username: { $containsi: search } }
                },
                {
                    user: { name: { $containsi: search } }
                }
            ]
        }
        });

        return {
            data: entity,
            metadata: {
                total: count,
                pageCount: Math.ceil(count / 10)
            }
        }
    },

    async update(ctx) {
        const { username, score } = ctx.request.body;
        
        const entity = await strapi.db.query('api::ohu.ohu').update({
            populate: {
                user: {
                    select: ['username', 'name']
                }
            },
            where: { user: { username } },
            data: { score }
        })

        return entity;
    }
}));
