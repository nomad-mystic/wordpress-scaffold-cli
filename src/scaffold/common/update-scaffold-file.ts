// Community
import fs from 'fs';

/**
 * @description This will update the content of a newly scaffold file with users inputs
 *
 * @param {string} updatePath
 * @param {string} fileName
 *
 * @param {string} stringToUpdate
 * @param {string} updateString
 * @return void
 */
export const updateScaffoldFile = (
    updatePath: string | undefined,
    fileName: string | undefined,
    stringToUpdate: any,
    updateString: any
) => {
    let updatedContent = '';

    // MAke sure the files exists before we start updating them
    if (fs.existsSync(`${updatePath}/${fileName}`)) {
        // Get our file in memory
        let fileContents = fs.readFileSync(`${updatePath}/${fileName}`, 'utf8');

        // Replace our file with user input values
        let reg: RegExp = new RegExp(stringToUpdate, 'gm');

        updatedContent = fileContents.replaceAll(reg, updateString);

        // Write our updated values
        fs.writeFileSync(`${updatePath}/${fileName}`, updatedContent);
    }
};
