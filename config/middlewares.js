module.exports = [
    "strapi::errors",
    "strapi::security",
    {
        name: "strapi::cors",
        config: {
            enabled: true,
            origin: "*",
            header: "*",
            credentials: true,
        },
    },
    "strapi::poweredBy",
    "strapi::logger",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
    "global::ext_id",
];
