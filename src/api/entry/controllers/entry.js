"use strict";

/**
 *  entry controller
 */

const _ = require("lodash");
const { createCoreController } = require("@strapi/strapi").factories;
const isObject = (val) => val instanceof Object;
const traverseObject = (data, fn) => {
    if (!data) return;

    if (Array.isArray(data)) {
        data.forEach((each) => traverseObject(each, fn));
        return;
    }

    if (!isObject(data)) return;

    Object.keys(data).forEach((each) => traverseObject(data[each], fn));

    fn(data);
};

module.exports = createCoreController("api::entry.entry", ({ strapi }) => ({
    async findOrCreate(ctx) {
        const { topicId } = ctx.params;
        const { username } = ctx.state.user;

        const topic = await strapi.db.query("api::topic.topic").findOne({
            where: { ext_id: topicId },
            select: ["id", "start"],
            populate: ["questions"],
        });
        if (!topic) return null;

        if (new Date() < topic.start) {
            return ctx.badRequest("not started yet");
        }

        const user = await strapi.db
            .query("plugin::users-permissions.user")
            .findOne({ where: { username: username }, select: ["id"] });

        if (!user) return null;

        var entity = await strapi.db.query("api::entry.entry").findOne({
            where: {
                topic: topic.id,
                user: user.id,
            },
            populate: ["topic"],
        });

        if (!entity) {
            entity = await strapi.db.query("api::entry.entry").create({
                data: {
                    topic: topic.id,
                    user: user.id,
                },
                populate: ["topic"],
            });
        }

        entity.topic.questions = topic.questions;

        traverseObject(entity.topic, (x) => {
            if (!x["private_metadata"]) return;

            delete x["private_metadata"];
        });

        return entity;
    },

    async getEntryByTopicForMyGroup(ctx) {
        const { topicId } = ctx.params;
        const { page = 1, pageSize = 10, isSubmitted = true } = ctx.query;
        if (page <= 0) return null;

        const topic = await strapi.db.query("api::topic.topic").findOne({
            where: { ext_id: topicId },
            select: ["id"],
        });
        if (!topic) return null;

        const nim = +ctx.state.user.username;

        const groups = await strapi
            .service("api::group.group")
            .getGroupLeadersByNim(nim);
        if (_.isEmpty(groups)) return null;

        const groupObject = await strapi
            .service("api::group.group")
            .getAllMembersByGroupsID(groups);

        const [, count] = await strapi.db
            .query("api::entry.entry")
            .findWithCount({
                where: {
                    $and: [
                        { topic: topic.id },
                        { submit_time: { $notNull: true } },
                        {
                            user: {
                                id: {
                                    $in: groupObject.userIds,
                                },
                            },
                        },
                    ],
                },
                select: ["id"],
            });

        const entity = await strapi.db.query("api::entry.entry").findMany({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            orderBy: { submit_time: "asc" },
            where: {
                $and: [
                    { topic: topic.id },
                    { submit_time: { $notNull: isSubmitted } },
                    {
                        user: {
                            id: {
                                $in: groupObject.userIds,
                            },
                        },
                    },
                ],
            },
            select: ["ext_id", "submit_time", "has_been_checked"],
            populate: {
                user: {
                    select: ["username", "name"],
                },
            },
        });

        const pageCount = Math.ceil(count / pageSize);
        const nimGroupMap = {};
        Object.keys(groupObject.result).forEach((groupName) => {
            groupObject.result[groupName].forEach((eachUser) => {
                nimGroupMap[eachUser.nim] = groupName;
            });
        });

        const translatedEntity = entity.map((each) => {
            const u = each.user;
            delete each.user;
            return {
                ...each,
                ...u,
                group: nimGroupMap[+u.username],
            };
        });

        return {
            data: translatedEntity,
            metadata: {
                page: +page,
                pageSize,
                total: count,
                pageCount,
            },
        };
    },

    async getEntryByTopic(ctx) {
        const { topicId } = ctx.params;
        const {
            page = 1,
            pageSize = 10,
            isSubmitted = true,
            isChecked = false,
        } = ctx.query;
        if (page <= 0) return null;

        const topic = await strapi.db.query("api::topic.topic").findOne({
            where: { ext_id: topicId },
            select: ["id"],
        });
        if (!topic) return null;
        const [_, count] = await strapi.db
            .query("api::entry.entry")
            .findWithCount({
                where: {
                    $and: [
                        { topic: topic.id },
                        { submit_time: { $notNull: true } },
                        { has_been_checked: isChecked },
                    ],
                },
                select: ["id"],
            });
        const entity = await strapi.db.query("api::entry.entry").findMany({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            orderBy: { submit_time: "asc" },
            where: {
                $and: [
                    { topic: topic.id },
                    { submit_time: { $notNull: isSubmitted } },
                    { has_been_checked: isChecked },
                ],
            },
            select: ["ext_id", "submit_time", "has_been_checked"],
            populate: {
                user: {
                    select: ["username", "name"],
                },
            },
        });

        const nimList = [];
        entity.forEach((each) => {
            nimList.push(+each.user.username);
        });
        const nimGroupMap = {};
        for (var i = 0; i < nimList.length; i++) {
            const nim = nimList[i];
            nimGroupMap[nim] = await strapi
                .service("api::group.group")
                .getFirstGroupNameByNim(nim);
        }

        const pageCount = Math.ceil(count / pageSize);

        const translatedEntity = entity.map((each) => {
            const u = each.user;
            delete each.user;
            return {
                ...each,
                ...u,
                group: nimGroupMap[+u.username],
            };
        });

        return {
            data: translatedEntity,
            metadata: {
                page: +page,
                pageSize,
                total: count,
                pageCount,
            },
        };
    },

    async getEntry(ctx) {
        const { entryId } = ctx.params;

        const entity = await strapi.db.query("api::entry.entry").findOne({
            where: {
                ext_id: entryId,
            },
            populate: {
                user: {
                    select: ["username", "name", "faculty", "campus", "sex"],
                },
                topic: {
                    populate: ["questions"],
                },
            },
        });

        return entity;
    },

    async putScore(ctx) {
        const { entryId } = ctx.params;
        const { scores = {} } = ctx.request.body;

        const entity = await strapi.db.query("api::entry.entry").findOne({
            where: {
                $and: [
                    {
                        ext_id: entryId,
                    },
                ],
            },
            select: ["events"],
        });
        if (entity.events == null) {
            entity.events = [];
        }
        const saveEvents = entity.events.filter(
            (each) => each.action === "Score"
        );
        const events = entity.events.filter((each) => each.action !== "Score");
        if (saveEvents.length >= 3) {
            entity.events = events.concat(saveEvents.slice(1));
        }
        entity.events.push({ action: "Score", timestamp: new Date(), scores });

        const updatedEntity = await strapi.db.query("api::entry.entry").update({
            where: {
                $and: [
                    { ext_id: entryId },
                    { submit_time: { $notNull: true } },
                ],
            },
            data: {
                scores: scores,
                has_been_checked: true,
                events: entity.events,
            },
        });

        return updatedEntity;
    },

    async putAnswer(ctx) {
        const { entryId } = ctx.params;
        const { username } = ctx.state.user;
        const { answers = {} } = ctx.request.body;

        const entity = await strapi.db.query("api::entry.entry").findOne({
            where: {
                $and: [
                    {
                        ext_id: entryId,
                    },
                    {
                        user: {
                            username: username,
                        },
                    },
                ],
            },
            select: ["events"],
        });
        if (entity.has_been_checked) {
            return ctx.badRequest("sudah dicek tidak bisa ganti jawaban.");
        }
        if (entity.events == null) {
            entity.events = [];
        }
        const saveEvents = entity.events.filter(
            (each) => each.action === "Save"
        );
        const events = entity.events.filter((each) => each.action !== "Save");
        if (saveEvents.length >= 5) {
            entity.events = events.concat(saveEvents.slice(1));
        }
        entity.events.push({ action: "Save", timestamp: new Date(), answers });

        const updateEntity = await strapi.db.query("api::entry.entry").update({
            where: {
                $and: [
                    {
                        ext_id: entryId,
                    },
                    {
                        user: {
                            username: username,
                        },
                    },
                    {
                        submit_time: {
                            $null: true,
                        },
                    },
                ],
            },
            data: {
                answers,
                events: entity.events,
            },
        });

        return updateEntity;
    },

    async submitEntry(ctx) {
        const { entryId } = ctx.params;
        const { username } = ctx.state.user;
        const { answers = {} } = ctx.request.body;

        const entity = await strapi.db.query("api::entry.entry").findOne({
            where: {
                $and: [
                    {
                        ext_id: entryId,
                    },
                    {
                        user: {
                            username: username,
                        },
                    },
                ],
            },
            select: ["events"],
        });
        if (entity.events == null) {
            entity.events = [];
        }
        const saveEvents = entity.events.filter(
            (each) => each.action === "Submit"
        );
        const events = entity.events.filter((each) => each.action !== "Submit");
        if (saveEvents.length >= 3) {
            entity.events = events.concat(saveEvents.slice(1));
        }
        entity.events.push({
            action: "Submit",
            timestamp: new Date(),
            answers,
        });
        const updatedEntity = await strapi.db.query("api::entry.entry").update({
            where: {
                $and: [
                    {
                        ext_id: entryId,
                    },
                    {
                        user: {
                            username: username,
                        },
                    },
                ],
            },
            populate: {
                user: true,
            },
            data: {
                submit_time: new Date(),
                answers,
                events: entity.events,
            },
        });

        return updatedEntity;
    },

    async editEntry(ctx) {
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
                            username: username,
                        },
                    },
                ],
            },
            select: ["events"],
        });
        if (entity.has_been_checked) {
            return ctx.badRequest("sudah dicek tidak bisa unsubmit.");
        }
        if (!entity.events) {
            entity.events = [];
        }
        const saveEvents = entity.events.filter(
            (each) => each.action === "Unsubmit"
        );
        const events = entity.events.filter(
            (each) => each.action !== "Unsubmit"
        );
        if (saveEvents.length >= 3) {
            entity.events = events.concat(saveEvents.slice(1));
        }
        entity.events.push({ action: "Unsubmit", timestamp: new Date() });

        const updatedEntity = await strapi.db.query("api::entry.entry").update({
            where: {
                $and: [
                    {
                        ext_id: entryId,
                    },
                    {
                        user: {
                            username: username,
                        },
                    },
                ],
            },
            populate: {
                user: true,
            },
            data: {
                submit_time: null,
                events: entity.events,
            },
        });

        return updatedEntity;
    },
}));
