"use strict";

module.exports = {
    routes: [
        {
            method: "POST",
            handler: "entry.create",
            path: "/entry/:topicId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "entry.getEntry",
            path: "/entry/:entryId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            handler: "entry.putScore",
            path: "/entry/score/:entryId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            handler: "entry.putAnswer",
            path: "/entry/answer/:entryId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            handler: "entry.submitEntry",
            path: "/entry/submit/:entryId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};