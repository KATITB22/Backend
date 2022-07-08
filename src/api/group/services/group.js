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
                .findOne({ where: { username: +each }, select: ["id"] })
        );
        const ids = await Promise.all(idsPromises);
        return ids.map((each) => (each ? each.id : each));
    },

    async getFirstGroupNameByNim(nim) {
        assert.number(nim);

        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: { username: nim },
                select: ["id"],
            });

        if (!user) return "?";

        const groups = await strapi.db.query("api::group.group").findOne({
            where: {
                members: user.id,
            },
            select: ["name"],
            limit: 1,
        });

        if (!groups) return "?";

        return groups.name;
    },

    async getGroupMembersByNim(nim) {
        assert.number(nim);

        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: { username: nim },
                select: ["id"],
            });

        if (!user) return [];

        const groups = await strapi.db.query("api::group.group").findMany({
            where: {
                members: user.id,
            },
            select: ["id"],
            limit: 1,
        });

        if (!groups) return [];

        return groups.map((each) => each.id);
    },

    async getGroupLeadersByNim(nim) {
        assert.number(nim);

        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: { username: nim },
                select: ["id"],
            });

        if (!user) return [];

        const groups = await strapi.db.query("api::group.group").findMany({
            where: {
                leaders: user.id,
            },
            select: ["id"],
        });

        return groups.map((each) => each.id);
    },

    async getAllMembersByGroupsID(groupId) {
        assert.arrayOfNumber(groupId);

        const groups = await strapi.db.query("api::group.group").findMany({
            populate: ["members"],
            where: {
                id: {
                    $in: groupId,
                },
            },
        });
        if (!groups) {
            return {};
        }

        const result = {};
        const userIds = [];
        groups.forEach((group) => {
            const groupMembers = group.members.map((member) => {
                userIds.push(member.id);
                return {
                    nim: member.username,
                    name: member.name,
                    id: member.id,
                };
            });
            result[group.name] = groupMembers;
        });
        return { result, userIds };
    },
}));
