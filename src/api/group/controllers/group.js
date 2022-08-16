"use strict";

/**
 *  group controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const _ = require("lodash");
const yup = require("yup");
const { validateYupSchemaSync, sanitize } = require("@strapi/utils");

const getService = (name) => {
    return strapi.plugin("users-permissions").service(name);
};

const sanitizeUser = (user, ctx) => {
    const { auth } = ctx.state;
    const userSchema = strapi.getModel("plugin::users-permissions.user");

    return sanitize.contentAPI.output(user, userSchema, { auth });
};

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
            "FTSL",
            "FTTM",
            "FTTM-C",
            "SAPPK",
            "SBM",
            "SF",
            "SITH",
            "SITH-R",
            "SITH-S",
            "STEI",
            "STEI-K",
            "STEI-R",
            "-"
        ])
        .required(),
    password: yup.string().optional(),
    new_password: yup.string().optional(),
});

module.exports = createCoreController("api::group.group", ({ strapi }) => ({
    async registerUserBulk(ctx) {
        const { data } = ctx.request.body;

        let response = [];

        for (let value of data) {
            const { username, name, roleName, faculty, campus, sex, password } =
                value;

            let params = {};
            let userRes;

            params.username = username;
            params.name = name;
            params.faculty = faculty;
            params.campus = campus;
            params.sex = sex;
            params.password = password;
            params.email = "unknown@gmail.com";
            params.provider = "local";

            //const roleName dari body
            const role = await strapi
                .query("plugin::users-permissions.role")
                .findOne({ where: { name: roleName } });

            if (!role) {
                return ctx.badRequest("Role not found", { role: params.role });
            }

            params.role = role.id;

            try {
                const user = await getService("user").add(params);

                const sanitizedUser = await sanitizeUser(user, ctx);

                userRes = sanitizedUser;
            } catch (err) {
                if (_.includes(err.message, "username")) {
                    return ctx.badRequest("Username is taken", {
                        username: params.username,
                    });
                } else if (_.includes(err.message, "email")) {
                    return ctx.badRequest("Email already taken", {
                        email: params.email,
                    });
                } else {
                    return ctx.badRequest(err.message, { params: params });
                }
            }

            response.push(userRes);
        }

        return ctx.send({
            data: response,
        });
    },

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
        const {
            campus,
            sex,
            faculty,
            password = "",
            new_password = "",
        } = ctx.request.body;

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
        if (password && new_password) {
            const validPassword = await getService("user").validatePassword(
                password,
                user.password
            );
            if (!validPassword) {
                return ctx.badRequest("Wrong old password!");
            }

            await getService("user").edit(entity.id, {
                password: new_password,
            });
        }
        const sanitizedUser = await sanitizeUser(entity, ctx);
        return sanitizedUser;
    },

    async deleteAll() {
        return await strapi.service("api::group.group").deleteAll();
    },

    async getMyGroup(ctx) {
        const { user } = ctx.state;

        if (!user) return null;

        const { username } = user;

        const entity = await strapi.db.query("api::group.group").findOne({
            populate: {
                members: {
                    select: ["username", "name", "faculty", "campus"],
                },
                leaders: {
                    select: ["username", "name", "faculty", "campus"],
                },
            },
            where: {
                $or: [
                    {
                        members: {
                            username: username
                        }
                    },
                    {
                        leaders: {
                            username: username
                        }
                    }
                ]
            }
        })

        return entity;
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
