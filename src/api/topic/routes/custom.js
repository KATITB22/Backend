"use strict";

module.exports = {
    routes: [
        {
            method: "GET",
            handler: "topic.findOneWithPrivate",
            path: "/topics/:id/complete",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
