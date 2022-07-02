"use strict";

/**
 *  entry controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
    "api::entry.entry",
    ({ strapi }) => ({
        async create() {
            const { topicId } = ctx.params;
            const { username } = ctx.state.user;

            const user = await strapi.db
                .query("plugin::users-permissions.user")
                .findOne({ where: { username: username }, select: ["id"] });

            const entity = await strapi.db.query("api::entry.entry").create({
                data: {
                    topic: topicId,
                    user: user.id,
                    answers: {},
                    scores: {},
                    events: {},
                    has_been_checked: false
                }
            })

            return entity
        },

        async getEntry(ctx) {
            const { entryId } = ctx.params;
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
                const entity = await strapi.db.query("api::entry.entry").create({
                    data: {}
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
