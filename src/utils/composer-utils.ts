// Core Modules
import fs from 'fs';

// Community Modules
import fse from 'fs-extra';

// Packages Modules
import PathUtils from './path-utils.js';

/**
 * @description Extract composer.json values
 * @public
 * @author Keith Murphy | nomadmystics@gmail.com
 *
 * @return {Promise<any[] | void>}
 */
export const getComposerPropertyInfo = async (): Promise<any[]> => {
    const whereAmI: string = await PathUtils.whereAmI();
    const composerExists: boolean = fse.pathExistsSync(`${whereAmI}/composer.json`);
    let propertyValues = [];

    // For each of the folders in the classes folder update class-list.json file with their paths
    // Use the paths and namespaces from the composer.json and update our json
    // @todo This might be used in heal command? and if they install another theme!
    //      Change the name prop and paths
    if (composerExists) {

        // Get our file in memory
        const composerContents: string = fs.readFileSync(`${whereAmI}/composer.json`, 'utf8');
        let composerJson = JSON.parse(composerContents);

        if (composerJson && typeof composerJson.autoload !== 'undefined' && typeof composerJson.autoload['psr-4'] !== 'undefined') {
            const Psr4 = composerJson.autoload['psr-4'];

            for (let namespaceValue in Psr4) {
                if (Object.hasOwn(Psr4, namespaceValue)) {
                    let namespaceName: string = namespaceValue;
                    let namespacePath = Psr4[namespaceValue][0];

                    let namespace = null;
                    let path = null;

                    // Build our values for the final object
                    if (namespaceName && typeof namespaceName !== 'undefined') {

                        namespace = namespaceName.replaceAll('\\', '');

                    }

                    if (namespacePath && typeof namespacePath !== 'undefined' && namespacePath.length > 0) {

                        path = namespacePath[0];

                    }

                    // Make sure we have our properties
                    if (namespace && path) {
                        propertyValues.push({
                            namespace: namespace,
                            path: namespacePath,
                        });
                    }

                }
            } // End for...in

            return propertyValues
        } // End sanity check
    } // End sanity check

    return [];
};

// /**
//  * @description
//  *
//  * @param {string} replaceValue
//  */
// const updateComposerInfo = (replaceValue) => {
//
// };

// module.exports = {
//     getComposerPropertyInfo,
//     updateComposerInfo,
// }
