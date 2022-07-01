const configFactory =
    (isDev) =>
    ({ env }) => {
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

        if (isDev) {
            config.connection.connection.ssl = {
                rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false),
            };
        }

        return config;
    };

module.exports = configFactory(!!process.env.PRODUCTION);
