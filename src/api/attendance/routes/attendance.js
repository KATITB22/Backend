"use strict";

/**
 * attendance router.
 */

const { createCoreRouter } = require("@strapi/strapi").factories;

module.exports = createCoreRouter("api::attendance.attendance", {
    only: [],
});
