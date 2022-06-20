function isObject(val) {
    return val instanceof Object;
}

const { sanitize } = require("@strapi/utils");

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

const removeIdField = (data) => {
    traverseObject(data, (obj) => {
        if (!obj["id"]) return;

        delete obj["id"];
    });
};

const removeExtIdField = (data) => {
    traverseObject(data, (obj) => {
        if (!obj["ext_id"]) return;

        delete obj["ext_id"];
    });
};

const addExternalIdAsId = (data) => {
    traverseObject(data, (obj) => {
        if (!obj["ext_id"]) return;

        obj["id"] = obj["ext_id"];
        delete obj["ext_id"];
    });
};

module.exports = () => {
    return async (context, next) => {
        const { request } = context;
        if (!request.url.includes("/api/")) {
            await next();
            return;
        }
        removeExtIdField(request.body);
        await next();
        const { response } = context;
        removeIdField(response.body);
        addExternalIdAsId(response.body);
    };
};
