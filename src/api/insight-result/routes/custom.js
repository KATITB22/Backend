"use strict";

module.exports = {
    routes: [
        {
            method: "POST",
            handler: "insight-result.createBulk",
            path: "/insight-results/createBulk",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}