"use strict";

/**
 * question service.
 */

const { createCoreService } = require("@strapi/strapi").factories;
const _ = require("lodash");
const assert = require("assert-plus");

module.exports = createCoreService("api::question.question", ({ strapi }) => ({
    async createQuestions(topicId, questions) {
        assert.number(topicId);
        assert.arrayOfObject(questions);

        const promises = questions.map(async (each) =>
            this.createQuestion(each, topicId)
        );

        return Promise.all(promises);
    },

    async createQuestion(question, topicId) {
        assert.number(topicId);

        const data = {
            question_no: question.question_no,
            content: question.question,
            metadata: question.metadata,
            private_metadata: question.hidden_metadata,
            score: question.score,
            topic: topicId,
        };

        const entity = await strapi.db.query("api::question.question").create({
            data,
        });
        return entity;
    },
}));
