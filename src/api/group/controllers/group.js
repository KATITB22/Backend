"use strict";

/**
 *  group controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const _ = require("lodash");
const yup = require("yup");
const { validateYupSchemaSync } = require("@strapi/utils");

const schema = yup.object().shape({
    name: yup.string().required(),
    leaders: yup.array(yup.number()).required(),
    members: yup.array(yup.number()).required(),
});

const userUpdateSchema = yup.object().shape({
    campus: yup
        .string()
        .oneOf(["Ganesha", "Jatinangor", "Cirebon", "-"])
        .required(),
    sex: yup.string().oneOf(["Male", "Female", "Unknown"]).required(),
    faculty: yup
        .string()
        .oneOf([
            "FITB",
            "FMIPA",
            "FSRD",
            "FTI",
            "FTMD",
            "FTTM",
            "FTSL",
            "SAPPK",
            "SBM",
            "SF",
            "SITH",
            "STEI",
            "-",
        ])
        .required(),
});

module.exports = createCoreController("api::group.group", ({ strapi }) => ({
    async getMyUser(ctx) {
        const { user } = ctx.state;

        if (!user) return null;

        const entity = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({
                where: { id: user.id },
                select: ["username", "name", "faculty", "campus", "sex"],
                populate: {
                    role: {
                        select: ["name"],
                    },
                },
            });
        entity.role = entity.role.name;
        return entity;
    },

    async updateMyUser(ctx) {
        validateYupSchemaSync(userUpdateSchema)(ctx.request.body);
        const { user } = ctx.state;
        const { campus, sex, faculty } = ctx.request.body;

        if (!user) return null;

        const entity = await strapi.db
            .query("plugin::users-permissions.user")
            .update({
                where: { id: user.id },
                data: {
                    campus,
                    sex,
                    faculty,
                },
            });
        return entity;
    },

    async deleteAll() {
        return await strapi.service("api::group.group").deleteAll();
    },

    async createGroup(ctx) {
        validateYupSchemaSync(schema)(ctx.request.body);
        const { name, leaders = [], members = [] } = ctx.request.body;

        const leaderIds = await strapi
            .service("api::group.group")
            .mapNimToIds(leaders);
        const memberIds = await strapi
            .service("api::group.group")
            .mapNimToIds(members);

        if (_.isEmpty(_.filter(leaderIds, (x) => !_.isNull(x)))) {
            return ctx.badRequest("leaders is empty");
        }

        if (_.isEmpty(_.filter(memberIds, (x) => !_.isNull(x)))) {
            return ctx.badRequest("members is empty");
        }

        if (_.some(leaderIds, _.isNull)) {
            return ctx.notFound("unknown nim detected at leaders");
        }

        if (_.some(memberIds, _.isNull)) {
            return ctx.notFound("unknown nim detected at members");
        }

        const entity = await strapi.db.query("api::group.group").create({
            data: {
                name,
                leaders: _.filter(leaderIds, (x) => !_.isNull(x)),
                members: _.filter(memberIds, (x) => !_.isNull(x)),
            },
        });
        return entity;
    },

    async findOne(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::group.group").findOne({
            populate: {
                members: {
                    select: ["username"],
                },
                leaders: {
                    select: ["username"],
                },
            },
            where: { ext_id: id },
        });
        entity.members = entity.members.map((each) => +each.username);
        entity.leaders = entity.leaders.map((each) => +each.username);

        return entity;
    },

    async findOneWithName(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::group.group").findOne({
            populate: {
                members: {
                    select: ["username", "name"],
                },
                leaders: {
                    select: ["username", "name"],
                },
            },
            where: { ext_id: id },
        });
        entity.members = entity.members.map((each) => ({
            username: +each.username,
            name: each.name,
        }));
        entity.leaders = entity.leaders.map((each) => ({
            username: +each.username,
            name: each.name,
        }));

        return entity;
    },

    async delete(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::group.group").delete({
            where: { ext_id: id },
        });
        return entity;
    },
}));
