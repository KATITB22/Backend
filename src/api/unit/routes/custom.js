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
            handler: "unit.getLiveStatus",
            path: "/units/status/:unit",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            handler: "unit.updateLiveStatus",
            path: "/units/status/:unit",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
