"use strict";

/**
 * group service.
 */

const { createCoreService } = require("@strapi/strapi").factories;
const assert = require("assert-plus");

module.exports = createCoreService("api::group.group", ({ strapi }) => ({
    async deleteAll() {
        const deleted = await strapi.db
            .query("api::group.group")
            .deleteMany({});
        return deleted;
    },

    async mapNimToIds(nim) {
        assert.array(nim);

        const idsPromises = nim.map((each) =>
            strapi.db
                .query("plugin::users-permissions.user")
                .findOne({ where: { username: +each } })
        );
        const ids = await Promise.all(idsPromises);
        return ids;
    },
}));
