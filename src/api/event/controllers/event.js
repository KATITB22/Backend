"use strict";

/**
 *  event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { validateYupSchemaSync } = require("@strapi/utils");
const yup = require("yup");

const createSchema = yup.object().shape({
    title: yup.string().required(),
    attendance_start: yup
        .string()
        .test(
            (dateString) => new Date(dateString).toString() !== "Invalid Date"
        )
        .required(),
    attendance_end: yup
        .string()
        .test(
            (dateString) => new Date(dateString).toString() !== "Invalid Date"
        )
        .required(),
    attendance_type: yup.string().oneOf(["Self", "GroupLeader"]).required(),
});

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
    async findMinified() {
        const entities = await strapi.db.query("api::event.event").findMany({
            orderBy: ["attendance_start"],
            select: [
                "title",
                "attendance_start",
                "attendance_end",
                "attendance_type",
                "ext_id",
            ],
        });
        const result = Array.isArray(entities)
            ? entities.map((each) => ({
                  ext_id: each.ext_id,
                  title: each.title,
                  start: each.attendance_start,
                  end: each.attendance_end,
                  type: each.attendance_type,
              }))
            : [];
        return {
            data: result,
        };
    },

    async findOne(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::event.event").findOne({
            where: { ext_id: id },
        });
        return entity;
    },

    async delete(ctx) {
        const { id } = ctx.params;

        const entity = await strapi.db.query("api::event.event").delete({
            where: { ext_id: id },
        });
        return entity;
    },

    async create(ctx) {
        validateYupSchemaSync(createSchema)(ctx.request.body);
        const {
            title,
            attendance_start = new Date(),
            attendance_end = new Date(),
            attendance_type,
        } = ctx.request.body;

        const entity = await strapi.db.query("api::event.event").create({
            data: {
                title,
                attendance_end,
                attendance_start,
                attendance_type,
            },
        });
        return entity;
    },

    async update(ctx) {
        validateYupSchemaSync(createSchema)(ctx.request.body);
        const { id } = ctx.params;
        const {
            title,
            attendance_start = new Date(),
            attendance_end = new Date(),
            attendance_type,
        } = ctx.request.body;

        const entity = await strapi.db.query("api::event.event").update({
            where: { ext_id: id },
            data: {
                title,
                attendance_end,
                attendance_start,
                attendance_type,
            },
        });
        return entity;
    },
}));
