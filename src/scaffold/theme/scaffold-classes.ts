// Community modules
import { glob } from 'glob';

// Package Modules
// Interfaces
import InterfaceScaffoldJsonUpdates from '../../interfaces/common/interface-scaffold-json-updates.js';
import InterfaceThemeAnswerValues from '../../interfaces/theme/interface-theme-answer-values.js';

// Functions
import { updateScaffoldFile } from '../common/update-scaffold-file.js';

/**
 * @description For each of the PHP classes scaffolded update the "namespace" value
 * @public
 * @author Keith Murphy | nomadmystics@gmail.com
 *
 * @param {InterfaceThemeAnswerValues} values
 * @return void
 */
const updateScaffoldClasses = async (values: InterfaceThemeAnswerValues): Promise<void> => {
    try {
        let {
            finalPath,
            projectNamespace,
        } = values;

        let updateObjectsArray: Array<InterfaceScaffoldJsonUpdates> = [];

        // Create our checks before we start the copy process
        const phpFiles = glob.sync(`${ finalPath }/classes/**/*.php`, {
            nodir: true,
        });

        let classFileUpdates: InterfaceScaffoldJsonUpdates[] = [];

        // For each of the classes we scaffold replace their namespace names
        if (phpFiles && typeof phpFiles !== 'undefined' && phpFiles.length > 0) {
            for (let classPath: number = 0; classPath < phpFiles.length; classPath++) {

                if (phpFiles[classPath] && typeof phpFiles[classPath] !== 'undefined') {
                    let classObject: InterfaceScaffoldJsonUpdates = {};

                    // Extract the information we need
                    const afterLastSlash = phpFiles[classPath].substring(phpFiles[classPath].lastIndexOf('/') + 1);
                    const beforeLastSlash = phpFiles[classPath].match(/^(.*[\\\/])/);

                    // @todo Check this
                    classObject.updatePath = beforeLastSlash ? beforeLastSlash[0].slice(0, -1) : finalPath + 'classes';

                    classObject.fileName = afterLastSlash;
                    classObject.stringToUpdate = 'PASCAL_NAME';
                    classObject.updateString = projectNamespace;

                    classFileUpdates.push(classObject);
                }
            }

            updateObjectsArray.push(...classFileUpdates);
        }

        // Update our files based on object properties
        for (let update: number = 0; update < updateObjectsArray.length; update++) {
            if (updateObjectsArray[update] && typeof updateObjectsArray[update] !== 'undefined') {

                updateScaffoldFile(
                    updateObjectsArray[update].updatePath,
                    updateObjectsArray[update].fileName,
                    updateObjectsArray[update].stringToUpdate,
                    updateObjectsArray[update].updateString,
                );

            }
        }
    } catch (err) {

        console.log('updateScaffoldClasses()');
        console.error(err);

    }
};

export default updateScaffoldClasses;
