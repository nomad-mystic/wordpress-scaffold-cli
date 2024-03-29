import shell from 'shelljs';

/**
 * @description Utils for checking system level functions
 * @class CheckDepends
 */
export default class CheckDepends {
    /**
     * @description Check for system dependency, if it doesn't exist exit
     * @public
     *
     * @param {string} dependency Which dependency to check for
     * @param {string} message Display a message to the user
     * @param {boolean} exit Should we exit the process?
     * @return {string|void}
     */
    public static dependencyInstalled(dependency: string, message: string, exit: boolean = true): shell.ShellString | null {
        const check: shell.ShellString | null = shell.which(dependency);

        // Display message
        if (!check || check.code !== 0) {
            shell.echo(message);

            // Should we end the process?
            if (exit) {
                shell.exit(1);
            }
        }

        // string or Null
        return check;
    };
}
