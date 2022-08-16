"use strict";

module.exports = {
    routes: [
        {
            method: "GET",
            handler: "unit.getScore",
            path: "/units/score",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            handler: "unit.updateScore",
            path: "/units/score",
            config: {
                policies: [],
                middlewares: [],
            },
        }
    ],
};
