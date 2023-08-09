// Community modules
import { pascalCase, pascalCaseTransformMerge } from 'pascal-case';
/**
 * @class StringUtils
 */
export default class StringUtils {
    /**
     * @description Replace spaces in a string with dashes
     * @public
     * @author Keith Murphy | nomadmystics@gmail.com
     *
     * @param {string} replaceString
     * @return {Promise<string>}
     */
    static addDashesToString = async (replaceString) => {
        if (replaceString === '') {
            return '';
        }
        return replaceString.replaceAll(' ', '-').toLowerCase();
    };
    /**
     * @description Replace dashes in a string with underscores
     * @public
     * @author Keith Murphy | nomadmystics@gmail.com
     *
     * @param {string} replaceString
     * @return {Promise<string>}
     */
    static capAndSnakeCaseString = async (replaceString) => {
        let snakeCaseString = replaceString.replaceAll('-', '_');
        return snakeCaseString.toUpperCase();
    };
    /**
     * @description Transform a string into pascal case
     * @public
     * @author Keith Murphy | nomadmystics@gmail.com
     * @uses https://www.npmjs.com/package/pascal-case
     *
     * @param {string} transformString
     * @return {Promise<string>}
     */
    static pascalCaseString = async (transformString) => {
        return pascalCase(transformString, {
            transform: pascalCaseTransformMerge,
        });
    };
    /**
     * @description Transform a camel case string into a dashed one
     * @public
     * @author Keith Murphy | nomadmystics@gmail.com
     * @link https://gist.github.com/youssman/745578062609e8acac9f?permalink_comment_id=2304728
     *
     * @param {string} replaceString: string
     * @returns {string}
     */
    static camelCaseToDash = async (replaceString) => {
        return replaceString.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
    };
}
