"use strict";

/**
 *  topic controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { validateYupSchemaSync } = require("@strapi/utils");
const yup = require("yup");

const createSchema = yup.object().shape({
    title: yup.string().required(),
    start: yup
        .string()
        .test(
            (dateString) => new Date(dateString).toString() !== "Invalid Date"
        )
        .required(),
    end: yup
        .string()
        .test(
            (dateString) => new Date(dateString).toString() !== "Invalid Date"
        )
        .required(),
    score_released: yup.boolean().optional(),
});

module.exports = createCoreController("api::topic.topic", {
    async findOne(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::topic.topic").findOne({
            where: { ext_id: id },
        });
        return entity;
    },

    async delete(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::topic.topic").findOne({
            where: { ext_id: id },
        });
        return entity;
    },

    async create(ctx) {
        validateYupSchemaSync(createSchema)(ctx.request.body);
        const { title, start, end } = ctx.request.body;
        const entity = await strapi.db.query("api::topic.topic").create({
            data: {
                title,
                end,
                start,
            },
        });
        return entity;
    },

    async update(ctx) {
        validateYupSchemaSync(createSchema)(ctx.request.body);
        const { id } = ctx.params;
        const { title, start, end, score_released = false } = ctx.request.body;

        const entity = await strapi.db.query("api::topic.topic").create({
            where: { ext_id: id },
            data: {
                title,
                end,
                start,
                score_released,
            },
        });
        return entity;
    },
});
