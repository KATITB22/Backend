"use strict";

module.exports = {
    routes: [
        {
            method: "POST",
            handler: "entry.findOrCreate",
            path: "/entries/:topicId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "entry.getEntryByTopic",
            path: "/entries/:topicId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "entry.getEntryByTopicForMyGroup",
            path: "/entries/:topicId/group",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "entry.getEntry",
            path: "/entries/:entryId/entry",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            handler: "entry.putScore",
            path: "/entries/:entryId/score",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            handler: "entry.putAnswer",
            path: "/entries/:entryId/answer",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            handler: "entry.submitEntry",
            path: "/entries/:entryId/submit",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            handler: "entry.editEntry",
            path: "/entries/:entryId/edit",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
