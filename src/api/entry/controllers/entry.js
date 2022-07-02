"use strict";

/**
 *  entry controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
    "api::entry.entry",
    ({ strapi }) => ({
        async create(ctx) {
            const { topicId } = ctx.params;
            const { username } = ctx.state.user;

            const topic = await strapi.db.query("api::topic.topic").findOne({
                where: { ext_id: topicId },
                select: ["id"],
            });

            const user = await strapi.db
                .query("plugin::users-permissions.user")
                .findOne({ where: { username: username }, select: ["id"] });

            const entity = await strapi.db.query("api::entry.entry").create({
                data: {
                    topic: topic.id,
                    user: user.id,
                    answers: {},
                    scores: {},
                    events: {},
                    has_been_checked: false
                },
                populate: {
                    topic: true
                }
            })

            return entity
        },

        async getEntry(ctx) {
            const { topicId, entryId } = ctx.params;
            const { username } = ctx.state.user;

            const entity = await strapi.db.query("api::entry.entry").findOne({
                where: { 
                    $and: [
                        {
                            ext_id: entryId,
                        },
                        {
                            user: {
                                username: username
                            }
                        }
                    ]
                },
                populate: {
                    user: true
                }
            });

            if (entity) {
                return entity;
            } else {
                const topic = await strapi.db.query("api::topic.topic").findOne({
                    where: { ext_id: topicId },
                    select: ["id"],
                });
    
                const user = await strapi.db
                    .query("plugin::users-permissions.user")
                    .findOne({ where: { username: username }, select: ["id"] });
    
                const entity = await strapi.db.query("api::entry.entry").create({
                    data: {
                        topic: topic.id,
                        user: user.id,
                        answers: {},
                        scores: {},
                        events: {},
                        has_been_checked: false
                    },
                    populate: {
                        topic: true
                    }
                })
    
                return entity
            }
        },

        async putScore(ctx) {
            const { entryId } = ctx.params;
            const { username } = ctx.state.user;
            const { scores } = ctx.request.body;

            const entity = await strapi.db.query("api::entry.entry").update({
                where: { 
                    $and: [
                        {
                            ext_id: entryId,
                        },
                        {
                            user: {
                                username: username
                            }
                        }
                    ]
                },
                populate: {
                    user: true
                },
                data: {
                    scores: scores,
                    has_been_checked: true
                }
            });

            return entity;
        },

        async putAnswer(ctx) {
            const { entryId } = ctx.params;
            const { username } = ctx.state.user;
            const { answers } = ctx.request.body;

            const entity = await strapi.db.query("api::entry.entry").update({
                where: { 
                    $and: [
                        {
                            ext_id: entryId,
                        },
                        {
                            user: {
                                username: username
                            }
                        }
                    ]
                },
                populate: {
                    user: true
                },
                data: {
                    answers: answers,
                }
            });

            return entity;
        },

        async submitEntry(ctx) {
            const { entryId } = ctx.params;
            const { username } = ctx.state.user;

            const entity = await strapi.db.query("api::entry.entry").update({
                where: { 
                    $and: [
                        {
                            ext_id: entryId,
                        },
                        {
                            user: {
                                username: username
                            }
                        }
                    ]
                },
                populate: {
                    user: true
                },
                data: {
                    submit_time: new Date(),
                }
            });

            return entity;
        }
    })    
);
