"use strict";

/**
 * attendance service.
 */

const assert = require("assert-plus");
const _ = require("lodash");
const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
    "api::attendance.attendance",
    ({ strapi }) => ({
        async isCompatible(nimMentor, nimMember) {
            assert.number(nimMentor);
            assert.number(nimMember);

            const mentor = await strapi
                .service("api::group.group")
                .getGroupLeadersByNim(nimMentor);
            if (!mentor) return false;

            const member = await strapi
                .service("api::group.group")
                .getGroupMembersByNim(nimMember);

            if (!member) return false;
            const intersect = _.intersection(mentor, member);
            if (_.isEmpty(intersect)) return false;

            return true;
        },

        async addAttendance(nimMember, event) {
            assert.number(nimMember);
            assert.object(event);
            assert.number(event.id);

            const user = await strapi.db
                .query("plugin::users-permissions.user")
                .findOne({ where: { username: nimMember }, select: ["id"] });

            if (!user) return null;
            const attendance = await strapi.db
                .query("api::attendance.attendance")
                .findOne({
                    where: {
                        event: event.id,
                        user: user.id,
                    },
                });

            if (!attendance) {
                const createAttendance = await strapi.db
                    .query("api::attendance.attendance")
                    .create({
                        data: {
                            event: event.id,
                            user: user.id,
                        },
                    });
                return createAttendance;
            }
            return attendance;
        },

        async deleteAttendance(nimMember, event) {
            assert.number(nimMember);
            assert.object(event);
            assert.number(event.id);

            const user = await strapi.db
                .query("plugin::users-permissions.user")
                .findOne({ where: { username: nimMember }, select: ["id"] });

            if (!user) return null;
            const attendance = await strapi.db
                .query("api::attendance.attendance")
                .delete({
                    where: {
                        event: event.id,
                        user: user.id,
                    },
                });
            return attendance;
        },
    })
);
