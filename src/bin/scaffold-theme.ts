#!/usr/bin/env node

// Community modules
import 'dotenv/config';

import colors from 'colors';

// Package modules
// Classes
import InquirerCli from '../cli/inquirer-cli.js';
import AbstractScaffold from '../abstract/abstract-scaffold.js';

// Utils
import PathUtils from '../utils/path-utils.js';
import DebugUtils from '../utils/debug-utils.js';
import StringUtils from '../utils/string-utils.js';

// Interfaces
import InterfaceThemeAnswers from '../interfaces/theme/interface-theme-answers.js';
import InterfaceThemeConfig from '../interfaces/theme/interface-theme-config.js';
import InterfaceThemeAnswerValues from '../interfaces/theme/interface-theme-answer-values.js';

// Functions
import updateInternalJson from '../scaffold/common/update-internal-json.js';
import getThemeOptions from '../config/theme-options.js';
import scaffoldTheme from '../scaffold/theme/scaffold-theme.js';
import scaffoldThemeRoot from '../scaffold/theme/scaffold-root.js';
import updateScaffoldClasses from '../scaffold/theme/scaffold-classes.js';

/**
 * @classdesc Scaffold a new theme based on user's inputs
 * @class ScaffoldTheme
 * @extends AbstractScaffold
 * @author Keith Murphy | nomadmystics@gmail.com
 */
class ScaffoldTheme extends AbstractScaffold {
    private static isDebugFullMode: boolean = false;
    private static whereAmI: string = '';

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

            const answers: InterfaceThemeAnswers | void = await InquirerCli.performPromptsTasks(await getThemeOptions()).catch((err) => console.error(err));

            await this.scaffoldFiles(answers);

        } catch (err: any) {
            console.log('ScaffoldTheme.performScaffolding()');
            console.error(err);
        }
    };

    /**
     * {@inheritDoc AbstractScaffold}
     */
    protected static scaffoldFiles = async (answers: InterfaceThemeAnswers | any): Promise<void> => {
        try {
            const themeValues: InterfaceThemeAnswerValues  = await this.buildValueObject(answers);

            // Build the theme
            await this.scaffoldTheme(themeValues);

            await this.scaffoldThemeRoot(themeValues);

            await this.updateScaffoldClasses(themeValues);

            // Let the user know it has been created
            console.log(colors.green(`Your ${themeValues.name} theme has been scaffold.`));
            console.log(colors.yellow(`Check: ${themeValues.themesPath}/${themeValues.safeThemeName}`));

        } catch (err: any) {
            console.log('ScaffoldTheme.scaffoldFiles()');
            console.error(err);
        }
    }

    /**
     * @description Build our object of values from the user's answers
     * @private
     * @author Keith Murphy | nomadmystics@gmail.com
     *
     * @param {InterfaceThemeAnswers | any} answers
     * @return {Promise<InterfaceThemeAnswerValues | any>}
     */
    private static buildValueObject = async (answers: InterfaceThemeAnswers | any): Promise<InterfaceThemeAnswerValues | any> => {
        try {
            const configFilePath: string = `${this.whereAmI}/internal/project/project-config.json`;

            // Absolute path of the themes folder
            const themesPath: string | undefined = await PathUtils.getThemesFolderPath();

            // User inputs
            const projectName: string = answers.projectName ? answers.projectName : '';
            const themeName: string =  answers.themeName ? answers.themeName.trim() : '';
            const description: string = answers.description ? answers.description.trim() : '';
            const frontEndFramework: string = answers.frontEndFramework ? answers.frontEndFramework : '';
            const siteUrl: string = answers.siteUrl ? answers.siteUrl : '';
            const devSiteUrl: string = answers.devSiteUrl ? answers.devSiteUrl : '';

            // Make folder "safe" if there are spaces
            const safeThemeName: string = await StringUtils.addDashesToString(themeName);

            // Create the finalized path for the scaffolded theme
            const newThemePath: string = `${themesPath}/${safeThemeName}`;

            // Create our string modification
            const capAndSnakeCaseTheme: string = await StringUtils.capAndSnakeCaseString(safeThemeName);

            let configUpdates: InterfaceThemeConfig = {
                'active-theme': safeThemeName,
                'active-theme-path': newThemePath,
                'absolute-project-folder': this.whereAmI,
                'absolute-themes-folder': themesPath,
                'description': description,
                'front-end-framework': frontEndFramework,
                'site-url': siteUrl,
                'dev-site-url': devSiteUrl,
            };

            if (projectName && typeof projectName !== 'undefined') {
                configUpdates['project-name'] = projectName;
                configUpdates['project-namespace'] = await StringUtils.pascalCaseString(projectName);
            }

            // // Update our config before we scaffold theme, so we can use it in our scaffold functions
            configUpdates = await updateInternalJson(configFilePath, configUpdates);

            return {
                projectName: configUpdates['project-name'],
                name: themeName,
                themesPath: themesPath,
                finalPath: newThemePath,
                description: description,
                frontEndFramework: frontEndFramework,
                siteUrl: siteUrl,
                devSiteUrl: devSiteUrl,
                safeThemeName: safeThemeName,
                capAndSnakeCaseTheme: capAndSnakeCaseTheme,
                projectNamespace: configUpdates['project-namespace'],
            };

        } catch (err: any) {
            console.log('ScaffoldTheme.buildValueObject()');
            console.error(err);
        }
    }

    /**
     * @description Based on a user's answers build our theme files
     * @private
     * @author Keith Murphy | nomadmystics@gmail.com
     *
     * @param {InterfaceThemeAnswerValues} themeValues
     * @return Promise<void>
     */
    private static scaffoldTheme = async (themeValues: InterfaceThemeAnswerValues): Promise<void> => {
        try {

            await scaffoldTheme(themeValues);

        } catch (err: any) {
            console.log('ScaffoldTheme.scaffoldTheme()');
            console.error(err);
        }
    }

    /**
     * @description Based on a user's answers build our theme root
     * @private
     * @author Keith Murphy | nomadmystics@gmail.com
     *
     * @param {InterfaceThemeAnswerValues} themeValues
     * @return Promise<void>
     */
    private static scaffoldThemeRoot = async (themeValues: InterfaceThemeAnswerValues): Promise<void> => {
        try {

            await scaffoldThemeRoot(themeValues);

        } catch (err: any) {
            console.log('ScaffoldTheme.scaffoldThemeRoot()');
            console.error(err);
        }
    }

    /**
     * @description Based on a user's answers build our theme classes
     * @private
     * @author Keith Murphy | nomadmystics@gmail.com
     *
     * @param {InterfaceThemeAnswerValues} themeValues
     * @return Promise<void>
     */
    private static updateScaffoldClasses = async (themeValues: InterfaceThemeAnswerValues): Promise<void> => {
        try {

            await updateScaffoldClasses(themeValues);

        } catch (err: any) {
            console.log('ScaffoldTheme.updateScaffoldClasses()');
            console.error(err);
        }
    }
}

ScaffoldTheme.initializeScaffolding().catch(err => console.error(err));
