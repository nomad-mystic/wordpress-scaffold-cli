const fs = require("fs");

const {
    whereAmI
} = require('./path-utils');


const updateClassListPaths = (pathToJson, arrayOfUpdateValues) => {

    if (!pathToJson || !arrayOfUpdateValues) {
        return null;
    }

    // Get our class lists
    const classListContents = fs.readFileSync(pathToJson, 'utf8');
    const classListJson = JSON.parse(classListContents);

    for (let namespace = 0; namespace < classListJson.length; namespace++) {
        if (classListJson[namespace] && typeof classListJson[namespace] !== 'undefined') {
            let jsonNamespace = classListJson[namespace].namespace
            let namespaceObject = classListJson[namespace];

            for (const updateValue of arrayOfUpdateValues) {
                if (updateValue.namespace === jsonNamespace) {

                    namespaceObject.path = updateValue.path;

                }
            }
        }
    }

    // console.log(classListJson);

    fs.writeFileSync(pathToJson, JSON.stringify(classListJson));
};

module.exports = {
    updateClassListPaths,
}
