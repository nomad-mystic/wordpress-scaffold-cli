"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
// Community Modules
require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const fuzzy = require('fuzzy');
const { readdirSync } = require('fs');
const { random } = require('lodash');
// Enable debug mode?
const isDebugMode = !!((_a = process.env) === null || _a === void 0 ? void 0 : _a.DEBUG);
const wordPressDebugPath = !!((_b = process.env) === null || _b === void 0 ? void 0 : _b.WORDPRESS_PATH);
class PathUtils {
    /**
     * @description Gets the current path
     * @public
     *
     * @return string
     */
    static whereAmI() {
        if (isDebugMode && wordPressDebugPath) {
            return path.resolve(process.env.WORDPRESS_PATH);
        }
        else {
            return path.resolve(process.cwd());
        }
    }
    /**
     * @description  Check if the users is the root of the project or another folder
     * @public
     *
     * @return bool
     */
    static isWordpressInstall() {
        return fs.pathExistsSync(`${this.whereAmI()}/wp-admin/admin-ajax.php`);
    }
    /**
     * @description
     *
     * @return string
     */
    static getThemesFolderPath() {
        return path.resolve(`${this.whereAmI()}/wp-content/themes`);
    }
    ;
    /**
     * @description Get all folder names in the theme directory
     *
     * @return array
     */
    static getThemeFolderNames() {
        // Theme path
        const themePath = this.getThemesFolderPath();
        // Just get the top level folder names
        const getDirectories = readdirSync(themePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        return getDirectories;
    }
    ;
}
exports.default = PathUtils;
/**
 * @description Gets the current path
 *
 * @return string
 */
const whereAmI = function () {
    if (isDebugMode && wordPressDebugPath) {
        return path.resolve(process.env.WORDPRESS_PATH);
    }
    else {
        return path.resolve(process.cwd());
    }
};
/**
 * @description  Check if the users is the root of the project or another folder
 *
 * @return bool
 */
const isWordpressInstall = function () {
    return fs.pathExistsSync(`${whereAmI()}/wp-admin/admin-ajax.php`);
};
/**
 * @description
 *
 * @return string
 */
const getThemesFolderPath = function () {
    return path.resolve(`${whereAmI()}/wp-content/themes`);
};
// /**
//  * @description Get all folder names in the theme directory
//  *
//  * @return array
//  */
// const getThemeFolderNames = function() {
//     // Theme path
//     const themePath = getThemesFolderPath();
//
//     // Just get the top level folder names
//     const getDirectories = readdirSync(themePath, { withFileTypes: true })
//         .filter(dirent => dirent.isDirectory())
//         .map(dirent => dirent.name);
//
//     return getDirectories;
// };
// /**
//  * @description Search the custom folder for module names
//  *
//  * @param {string} answersSoFar
//  * @param {string} input
//  * @return {Promise<unknown>}
//  */
// const searchFolderNames = function(answersSoFar, input) {
//     const moduleNames = getThemeFolderNames();
//
//     input = input || '';
//
//     // Use fuzzy logic to based on the custom folders names and return for usage in adding to our module
//     return new Promise(function (resolve) {
//         setTimeout(function () {
//             let fuzzyResult = fuzzy.filter(input, moduleNames);
//
//             resolve(
//                 fuzzyResult.map(function (el) {
//                     return el.original;
//                 })
//             );
//         }, random(30, 500));
//     });
// }
// module.exports = {
//     whereAmI,
//     isWordpressInstall,
//     getThemesFolderPath,
//     getThemeFolderNames,
//     searchFolderNames,
// };
