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
    ],
};
