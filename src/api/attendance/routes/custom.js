"use strict";

module.exports = {
    routes: [
        {
            method: "POST",
            handler: "attendance.groupPresence",
            path: "/attendances/group/:eventId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            handler: "attendance.selfPresence",
            path: "/attendances/self/:eventId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "attendance.getPresence",
            path: "/attendances/self/:eventId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "attendance.getGroupPresence",
            path: "/attendances/group/:eventId",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
