"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Core Modules
const fs = require('fs');
// Community modules
const uglifyJS = require('uglify-js');
const { globSync } = require('glob');
// Package Modules
const packageRoot = require('../../package-root.js');
/**
 * @todo Maybe do this?
 * @class ProductionBuild
 */
class ProductionBuild {
    /**
     * @description
     * @public
     *
     * @return void
     */
    static minifyProduction = () => {
        const jsFiles = globSync(`${packageRoot.packageRootDir}/src/**/*.js`, {
            ignore: 'node_modules/**',
            absolute: true,
        });
        if (jsFiles && typeof jsFiles !== 'undefined' && jsFiles.length > 0) {
            for (let file = 0; file < jsFiles.length; file++) {
                if (jsFiles[file] && typeof jsFiles[file] !== 'undefined') {
                    console.log(fs.readFileSync(jsFiles[file], 'utf-8'));
                    uglifyJS.minify(fs.readFileSync(jsFiles[file], 'utf-8'), {});
                }
            }
        }
    };
}
exports.default = ProductionBuild;
ProductionBuild.minifyProduction();
