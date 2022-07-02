"use strict";

/**
 *  topic controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { validateYupSchemaSync } = require("@strapi/utils");
const yup = require("yup");

const questionSchema = yup.object().shape({
    hidden_metadata: yup
        .object()
        .required()
        .shape({
            correct_answer: yup.string().optional().nullable(true),
        }),
    metadata: yup
        .object()
        .required()
        .shape({
            type: yup
                .string()
                .required()
                .oneOf(["ISIAN", "PILIHAN GANDA", "ESSAY"]),
        }),
    question: yup.string().required(),
    question_no: yup.number().required(),
    score: yup.number().required().default(100).max(10000).min(0),
});
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
    questions: yup.array(questionSchema).required(),
});
const updateSchema = yup.object().shape({
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
    score_released: yup.boolean().required(),
});

const isObject = (val) => val instanceof Object;
const traverseObject = (data, fn) => {
    if (!data) return;

    if (Array.isArray(data)) {
        data.forEach((each) => traverseObject(each, fn));
        return;
    }

    if (!isObject(data)) return;

    Object.keys(data).forEach((each) => traverseObject(data[each], fn));

    fn(data);
};

module.exports = createCoreController("api::topic.topic", ({ strapi }) => ({
    async findOne(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::topic.topic").findOne({
            populate: ["questions"],
            where: { ext_id: id },
        });
        traverseObject(entity.questions, (x) => {
            if (!x["private_metadata"]) return;

            delete x["private_metadata"];
        });
        return entity;
    },

    async findOneWithPrivate(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::topic.topic").findOne({
            populate: ["questions"],
            where: { ext_id: id },
        });
        return entity;
    },

    async delete(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::topic.topic").delete({
            where: { ext_id: id },
        });
        return entity;
    },

    async create(ctx) {
        validateYupSchemaSync(createSchema)(ctx.request.body);
        const { title, start, end, questions } = ctx.request.body;
        const entity = await strapi.db.query("api::topic.topic").create({
            data: {
                title,
                end,
                start,
            },
        });
        const questionEntities = strapi
            .service("api::question.question")
            .createQuestions(entity.id, questions);

        return {
            ...entity,
            questions: questionEntities,
        };
    },

    async update(ctx) {
        validateYupSchemaSync(updateSchema)(ctx.request.body);
        const { id } = ctx.params;
        const { title, start, end, score_released = false } = ctx.request.body;

        const entity = await strapi.db.query("api::topic.topic").update({
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
}));
