const { v4: uuid } = require("uuid");

module.exports = {
    beforeCreate(event) {
        event.params.data.ext_id = uuid();
    },
};
