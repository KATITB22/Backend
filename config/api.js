module.exports = {
    responses: {
        privateAttributes: ["id", "password"],
    },
    rest: {
        defaultLimit: 25,
        maxLimit: 100,
        withCount: true,
    },
};
