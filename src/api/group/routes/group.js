"use strict";

/**
 * group router.
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::group.group", {
    only: ["find", "findOne", "delete"],
    config: {
        find: {
            policies: [],
            middlewares: [],
        },
        findOne: {
            policies: [],
            middlewares: [],
        },
    },
});
