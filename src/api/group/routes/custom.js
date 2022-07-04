"use strict";

module.exports = {
    routes: [
        {
            method: "DELETE",
            handler: "group.deleteAll",
            path: "/groups",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            handler: "group.createGroup",
            path: "/groups",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "group.findOneWithName",
            path: "/groups/:id/with-name",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "group.getMyUser",
            path: "/users/my-account",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            handler: "group.registerUserBulk",
            path: "/users/createBulk",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "POST",
            handler: "group.updateMyUser",
            path: "/users/my-account",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
