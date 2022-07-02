"use strict";

module.exports = {
    routes: [
        {
            method: "GET",
            handler: "event.findMinified",
            path: "/events/minified",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
