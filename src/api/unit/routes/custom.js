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
        },
        {
            method: "GET",
            handler: "unit.getShowcase",
            path: "/units/showcase",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "unit.getMap",
            path: "/units/map",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
