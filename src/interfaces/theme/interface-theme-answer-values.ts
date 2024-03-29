import InterfaceAnswerValues from '../common/interface-answer-values.js';

export default interface InterfaceThemeAnswerValues extends InterfaceAnswerValues {
    themesPath?: string;
    frontEndFramework?: string;
    siteUrl?: string;
    devSiteUrl?: string;
    safeThemeName?: string;
    capAndSnakeCaseTheme?: string;
    type?: 'theme';
}
