module.exports = ({ env }) => {
    const config = {
        connection: {
            client: "postgres",
            connection: {
                host: env("DATABASE_HOST", "127.0.0.1"),
                port: env.int("DATABASE_PORT", 5432),
                database: env("DATABASE_NAME", "KAT"),
                user: env("DATABASE_USERNAME", "postgres"),
                password: env("DATABASE_PASSWORD", "password"),
                ssl: false,
            },
        },
    };
    const production = env.bool("PRODUCTION", false);
    if (production) {
        config.ssl = {
            rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false),
        };
    }

    return config;
};
