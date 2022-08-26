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
        {
            method: "GET",
            handler: "unit.findParticipant",
            path: "/units/participant",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "unit.getRecommendation",
            path: "/units/recommendation",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "GET",
            handler: "unit.getLiveStatus",
            path: "/units/live",
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: "PUT",
            handler: "unit.updateLiveStatus",
            path: "/units/live",
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
