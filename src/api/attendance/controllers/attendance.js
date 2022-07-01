"use strict";

/**
 *  attendance controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { validateYupSchemaSync } = require("@strapi/utils");
const yup = require("yup");
const _ = require("lodash");

const groupPresenceSchema = yup.object().shape({
    attend: yup.array(yup.number()).optional(),
    not_attend: yup.array(yup.number()).optional(),
});

module.exports = createCoreController(
    "api::attendance.attendance",
    ({ strapi }) => ({
        async groupPresence(ctx) {
            validateYupSchemaSync(groupPresenceSchema)(ctx.request.body);
            const { attend = [], not_attend = [] } = ctx.request.body;
            const { eventId } = ctx.params;

            const event = await strapi.db.query("api::event.event").findOne({
                where: { ext_id: eventId },
                select: ["id", "attendance_type"],
            });
            if (!event) return null;
            if (event.attendance_type != "GroupLeader") {
                return ctx.badRequest("wrong attendance method");
            }
            const compabilityNimList = _.concat(attend, not_attend);
            const nim = +ctx.state.user.username;
            const compatibleListPromise = compabilityNimList.map((each) =>
                strapi
                    .service("api::attendance.attendance")
                    .isCompatible(nim, each)
            );
            const compatibleList = await Promise.all(compatibleListPromise);

            if (_.every(compatibleList, (each) => !!each)) {
                if (!_.isEmpty(attend)) {
                    const attendPromises = attend.map((each) =>
                        strapi
                            .service("api::attendance.attendance")
                            .addAttendance(each, event)
                    );
                    await Promise.all(attendPromises);
                }

                if (!_.isEmpty(not_attend)) {
                    const notAttendPromises = not_attend.map((each) =>
                        strapi
                            .service("api::attendance.attendance")
                            .deleteAttendance(each, event)
                    );
                    await Promise.all(notAttendPromises);
                }
                return {};
            }

            return ctx.badRequest();
        },
        async selfPresence(ctx) {
            const { eventId } = ctx.params;

            const event = await strapi.db.query("api::event.event").findOne({
                where: { ext_id: eventId },
                select: ["id", "attendance_type"],
            });
            if (!event) return null;
            if (event.attendance_type != "Self") {
                return ctx.badRequest("wrong attendance method");
            }
            const nim = +ctx.state.user.username;
            const attendance = await strapi
                .service("api::attendance.attendance")
                .addAttendance(nim, event);

            return { attendance: attendance.createdAt };
        },

        async getPresence(ctx) {
            const { eventId } = ctx.params;

            const event = await strapi.db.query("api::event.event").findOne({
                where: { ext_id: eventId },
                select: ["id"],
            });
            if (!event) return null;

            const nim = +ctx.state.user.username;
            const user = await strapi.db
                .query("plugin::users-permissions.user")
                .findOne({ where: { username: nim }, select: ["id"] });

            if (!user) return null;

            const attendance = await strapi.db
                .query("api::attendance.attendance")
                .findOne({
                    where: {
                        event: event.id,
                        user: user.id,
                    },
                });
            const status = !!attendance;
            return { attendance: status ? attendance.createdAt : null };
        },

        async getGroupPresence(ctx) {
            const { eventId } = ctx.params;
            const nim = +ctx.state.user.username;
            const event = await strapi.db.query("api::event.event").findOne({
                where: { ext_id: eventId },
                select: ["id"],
            });
            if (!event) return null;

            const groups = await strapi
                .service("api::group.group")
                .getGroupLeadersByNim(nim);
            if (_.isEmpty(groups)) return null;

            const groupObject = await strapi
                .service("api::group.group")
                .getAllMembersByGroupsID(groups);

            const attendances = await strapi.db
                .query("api::attendance.attendance")
                .findMany({
                    populate: ["user"],
                    where: {
                        event: event.id,
                        user: groupObject.userIds,
                    },
                });

            const attended = [];
            attendances.forEach((each) => {
                attended.push(each.user.id);
            });

            const result = groupObject.result;
            Object.keys(result).forEach((key) => {
                result[key].forEach((member, idx) => {
                    if (_.includes(attended, member.id)) {
                        result[key][idx].status = true;
                    } else {
                        result[key][idx].status = false;
                    }
                });
            });

            return result;
        },
    })
);
