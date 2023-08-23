#!/usr/bin/env node

// Community modules
import 'dotenv/config';

// Package modules
// Classes
import InquirerCli from '../cli/inquirer-cli.js';
import AbstractScaffold from '../abstract/AbstractScaffold.js';
import updateInternalJson, { ProjectJson } from '../scaffold/common/update-internal-json.js';

// Utils
import PathUtils from '../utils/path-utils.js';
import DebugUtils from '../utils/debug-utils.js';
import StringUtils from '../utils/string-utils.js';

// Interfaces
import PluginAnswers from '../interfaces/plugin/interface-plugin-anwsers.js';
import PluginAnswerValues from '../interfaces/plugin/interface-plugin-answer-values.js';
import PluginConfig from '../interfaces/plugin/interface-plugin-config.js';
import ScaffoldCopyFolders from '../interfaces/common/interface-scaffold-copy-folders.js';
import ScaffoldJsonUpdates from '../interfaces/common/interface-scaffold-json-updates.js';

// Functions
import getPluginOptions from '../config/plugin-options.js';
import UpdateTypeFiles from '../scaffold/common/update-type-files.js';
import MessagingUtils from '../utils/messaging-utils.js';
import CreateObjectArrays from '../scaffold/common/create-object-arrays.js';
import fse from "fs-extra";

/**
 * @classdesc Scaffold a new theme based on user's inputs
 * @class ScaffoldTheme
 * @extends AbstractScaffold
 * @author Keith Murphy | nomadmystics@gmail.com
 */
class ScaffoldPlugin extends AbstractScaffold {
    /**
     * @type boolean
     * @private
     */
    private static isDebugFullMode: boolean = false;

    /**
     * @type string
     * @private
     */
    private static whereAmI: string = '';

    /**
     * @type boolean
     * @private
     */
    private static composerExists: boolean | any = false;

    /**
     * @type boolean
     * @private
     */
    private static packageExists: boolean | any = false;

    private static pluginValues: PluginAnswerValues;

    /**
     * {@inheritDoc AbstractScaffold}
     */
    public static initializeScaffolding = async (): Promise<void> => {
        try {
            // Gather our location
            this.whereAmI = await PathUtils.whereAmI();

            // Enable debug mode?
            this.isDebugFullMode = await DebugUtils.isDebugFullMode();

            // Bail early
            await PathUtils.checkForWordPressInstall();

            // Get our answers
            const answers: PluginAnswers | void = await InquirerCli.performPromptsTasks(await getPluginOptions()).catch((err) => console.error(err));

            // Start the scaffolding process
            await this.scaffoldFiles(answers);

        } catch (err: any) {
            console.log('ScaffoldTheme.performScaffolding()');
            console.error(err);
        }
    };

    /**
     * {@inheritDoc AbstractScaffold}
     */
    protected static scaffoldFiles = async (answers: PluginAnswers | any): Promise<void> => {
        try {
            // Build the values we need
            this.pluginValues = await this.buildValueObject(answers);

            // Validate we aren't overwriting another plugin with the same name
            await PathUtils.validateIsPathWithDisplay(this.pluginValues.finalPath, 'There is already a plugin with that name. Please use another name.', true);

            // Create our checks before we start the copy process
            this.composerExists = PathUtils.validateIsPath(`${this.pluginValues.finalPath}/composer.json`);
            this.packageExists = PathUtils.validateIsPath(`${this.pluginValues.finalPath}/package.json`);

            // Update the internal JSON files
            let pluginConfig = await this.updateProjectConfig(this.pluginValues);

            // Update the individual files we need to scaffold
            await this.performScaffold(this.pluginValues, pluginConfig);

            await this.displayEndingMessages(this.pluginValues);

        } catch (err: any) {
            console.log('ScaffoldTheme.scaffoldFiles()');
            console.error(err);
        }
    };

    // @todo Refactor into helper method {MessagingUtils.displayEndingMessages}
    private static displayEndingMessages = async (values: PluginAnswerValues): Promise<void> => {
        try {
            // Let the user know it has been created
            await MessagingUtils.displayColoredMessage(`Your ${values.name} plugin has been scaffold! \n`, 'green');
            await MessagingUtils.displayColoredMessage(`Check: ${values.finalPath} \n`, 'yellow');


            if (!this.composerExists || !this.packageExists) {
                await MessagingUtils.displayColoredMessage(`Don\'t forget to run these commands in the root of the ${values.type}`, 'yellow');
            }

            if (!this.composerExists) {
                await MessagingUtils.displayColoredMessage(`$ composer run-script auto-load-classes`, 'green');
            }

            if (!this.packageExists) {
                await MessagingUtils.displayColoredMessage(`$ nvm use && npm install`, 'green');
            }

        } catch (err: any) {
            console.log('displayEndingMessages()');
            console.error(err);
        }
    };

    /**
     * @description Build an object of our needed values for scaffolding the plugin
     * @private
     * @author Keith Murphy | nomadmystics@gmail.com
     * @todo refactor into Abstract class method in theme and project
     *
     * @param {PluginAnswers | any} answers
     * @return {Promise<PluginAnswerValues | any>}
     */
    private static buildValueObject = async (answers: PluginAnswers | any): Promise<PluginAnswerValues | any> => {
        try {
            // Absolute path of the themes folder
            const pluginsPath: string | undefined = await PathUtils.getPluginsFolderPath();

            // User inputs
            const projectName: string = answers.projectName ? answers.projectName : '';
            const name: string =  answers.name ? answers.name.trim() : '';
            const description: string = answers.description ? answers.description.trim() : '';
            const pluginFrontEndFramework: string = answers.pluginFrontEndFramework ? answers.pluginFrontEndFramework : '';
            const siteUrl: string = answers.siteUrl;
            const devSiteUrl: string = answers.devSiteUrl;

            // Make folder "safe" if there are spaces
            const safeName: string = await StringUtils.addDashesToString(name);

            // Create the finalized path for the scaffolded theme
            const finalPluginPath: string = `${pluginsPath}/${safeName}`;

            // Create our string modification
            const capAndSnakeCasePlugin: string = await StringUtils.capAndSnakeCaseString(safeName);

            const pluginNamespace: string =  await StringUtils.pascalCaseString(safeName);

            return {
                type: 'plugin',
                projectName: projectName,
                name: name,
                safeName: safeName,
                pluginsPath: pluginsPath,
                finalPath: finalPluginPath,
                description: description,
                pluginFrontEndFramework: pluginFrontEndFramework,
                siteUrl: siteUrl,
                devSiteUrl: devSiteUrl,
                capAndSnakeCasePlugin: capAndSnakeCasePlugin,
                namespace: pluginNamespace,
            };

        } catch (err: any) {
            console.log('ScaffoldTheme.buildValueObject()');
            console.error(err);
        }
    };

    /**
     * @description Update our project config object based on user inputs
     * @public
     * @author Keith Murphy | nomadmystics@gmail.com
     * @todo refactor into Abstract class method in theme and project
     *
     * @param {PluginAnswerValues} pluginValues
     * @return {Promise<PluginConfig | any>}
     */
    private static updateProjectConfig = async (pluginValues: PluginAnswerValues): Promise<PluginConfig | any> => {
        try {
            let {
                projectName,
                name,
                finalPath,
                description,
                pluginFrontEndFramework,
            } = pluginValues;

            let configUpdates: PluginConfig = {
                'plugin-name': name,
                'plugin-path': finalPath,
                'plugin-description': description,
                'plugin-front-end-framework': pluginFrontEndFramework,
            };

            if (projectName && typeof projectName !== 'undefined') {
                configUpdates['project-name'] = projectName;
                configUpdates['project-namespace'] = await StringUtils.pascalCaseString(projectName);
            }

            // Update our config before we scaffold plugin, so we can use it in our scaffold functions
            configUpdates = await ProjectJson.update(configUpdates, 'plugin');

            return configUpdates;

        } catch (err: any) {
            console.log('ScaffoldPlugin.updateProjectConfig()');
            console.error(err);
        }
    };

    /**
     * @description
     * @private
     * @author Keith Murphy | nomadmystics@gmail.com
     * @todo refactor into Abstract class method in theme and project
     *
     * @param {PluginAnswerValues} pluginValues
     * @param {PluginConfig} pluginConfig
     * @return {Promise<void>}
     */
    private static performScaffold = async (pluginValues: PluginAnswerValues, pluginConfig: PluginConfig): Promise<void> => {
        try {
            const updateObjectsArray: Array<ScaffoldJsonUpdates> = await this.buildUpdateObjectArray(pluginValues);

            const foldersToCopy: Array<ScaffoldCopyFolders> = await this.buildFoldersToCopy(pluginValues);

            await UpdateTypeFiles.copyFiles(foldersToCopy);

            await UpdateTypeFiles.updateFiles(pluginValues, updateObjectsArray);

            await UpdateTypeFiles.updateClassFiles(pluginValues);

            await UpdateTypeFiles.updateWebpack(pluginValues, 'plugin');

        } catch (err: any) {
            console.log('ScaffoldPlugin.performScaffold()');
            console.error(err);
        }
    };

    /**
     * @description
     * @private
     * @author Keith Murphy | nomadmystics@gmail.com
     *
     * @param {PluginAnswerValues} pluginValues
     * @return {Promise<Array<ScaffoldCopyFolders> | any>}
     */
    private static buildFoldersToCopy = async (pluginValues: PluginAnswerValues): Promise<Array<ScaffoldCopyFolders> | any> => {
        try {

            const foldersToCopy: Array<ScaffoldCopyFolders> = [
                {
                    source: 'scaffolding/plugin',
                    destination: `${pluginValues.finalPath}`,
                },
                {
                    source: 'scaffolding/common/classes',
                    destination: `${pluginValues.finalPath}/classes`,
                },
                {
                    source: `scaffolding/common/front-end-scaffolding/${pluginValues.pluginFrontEndFramework?.toLowerCase()}/js`,
                    destination: `${pluginValues.finalPath}/src/js`,
                },
                {
                    source: `scaffolding/common/front-end-scaffolding/${pluginValues.pluginFrontEndFramework?.toLowerCase()}/project-root`,
                    destination: `${pluginValues.finalPath}`,
                },
                {
                    source: 'scaffolding/common/project-root',
                    destination: `${pluginValues.finalPath}`,
                },
            ];

            return foldersToCopy;

        } catch (err: any) {
            console.log('ScaffoldPlugin.buildFoldersToCopy()');
            console.error(err);
        }
    };

    /**
     * @description
     * @private
     * @author Keith Murphy | nomadmystics@gmail.com
     *
     * @param {PluginAnswerValues} pluginValues
     * @return {Promise<Array<ScaffoldJsonUpdates> | any>}
     */
    private static buildUpdateObjectArray = async (pluginValues: PluginAnswerValues): Promise<Array<ScaffoldJsonUpdates> | any> => {
        try {

            const updateObjectsArray: Array<ScaffoldJsonUpdates> = [
                {
                    fileName: 'plugin-name.php',
                    stringToUpdate: 'SCAFFOLD_NAME',
                    updateString: pluginValues.safeName,
                },
                {
                    fileName: 'plugin-name.php',
                    stringToUpdate: 'SCAFFOLD_DESCRIPTION',
                    updateString: pluginValues.description,
                },
                {
                    fileName: 'plugin-name.php',
                    stringToUpdate: 'SCAFFOLD_DESCRIPTION',
                    updateString: pluginValues.description,
                },
                {
                    fileName: 'plugin-name.php',
                    stringToUpdate: 'CAPS_AND_SNAKE_NAME',
                    updateString: pluginValues.capAndSnakeCasePlugin,
                },
                {
                    fileName: 'webpack.config.js',
                    stringToUpdate: 'SCAFFOLD_NAME',
                    updateString: pluginValues.name,
                },
            ];

            const composerObjects: Array<ScaffoldJsonUpdates> | any = await CreateObjectArrays.createComposerObjects(pluginValues, this.composerExists);

            if (!this.composerExists) {
                updateObjectsArray.push(...composerObjects);
            }

            const packageObjects: Array<ScaffoldJsonUpdates> | any = await CreateObjectArrays.createPackageObjects(pluginValues, this.packageExists);

            if (!this.packageExists) {
                updateObjectsArray.push(...packageObjects);
            }

            return updateObjectsArray;

        } catch (err: any) {
            console.log('ScaffoldPlugin.buildUpdateObjectArray()');
            console.error(err);
        }
    };
}

ScaffoldPlugin.initializeScaffolding().catch(err => console.error(err));

