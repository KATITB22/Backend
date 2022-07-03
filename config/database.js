const configFactory =
    (isProd) =>
    ({ env }) => {
        const config = {
            connection: {
                client: "postgres",
                debug: false,
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

        if (isProd) {
            config.connection.connection.ssl = {
                rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false),
            };
        } else {
            config.connection.debug = true;
        }

        return config;
    };

module.exports = configFactory(!!process.env.PRODUCTION);
