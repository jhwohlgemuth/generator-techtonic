/* @flow */
type Config = {
    isNative: boolean,
    isWebapp: boolean,
    moduleFormat: string,
    pluginDirectory: string,
    projectName: string,
    sourceDirectory: string,
    userName: string,
    useAmd: boolean,
    useAria: boolean,
    useBrowserify: boolean,
    useHandlebars: boolean,
    useImagemin: boolean,
    useJest: boolean,
    useLess: boolean,
    useRust: boolean,
    useSass: boolean,
    useWebpack: boolean
};
type GeneratorConfig = {
    defaults: Function,
    getAll: () => Config,
    get: (val: string) => any,
    set: (name: mixed, val?: mixed) => void
};
export type ProjectGenerator = {
    config: GeneratorConfig,
    destinationPath: (path: string) => string,
    log: (message: string) => void,
    npmInstall: (dependencies?: Array<mixed>, options?: {save?: boolean, saveDev?: boolean}) => void,
    options: {
        defaults: boolean,
        name: string,
        slim: boolean,
        src: string,
        useBrowserify: boolean,
        useJest: boolean,
        useWebpack: boolean
    },
    prompt: Function,
    sourceDirectory: string,
    use: {
        projectName: string,
        sourceDirectory: string
    }
};
export type WebappGenerator = {
    config: GeneratorConfig,
    destinationPath: (path: string) => string,
    log: (message: string) => void,
    npmInstall: (dependencies?: string[], options?: {save?: boolean, saveDev?: boolean}) => void,
    option: Function,
    options: {
        cssPreprocessor: string,
        defaults: boolean,
        skipAria: boolean,
        skipImagemin: boolean,
        slim: boolean,
        templateTechnology: string,
        useBrowserify: boolean,
        useJest: boolean,
        useRust: boolean,
        useWebpack: boolean
    },
    prompt: Function,
    use: {
        aria: boolean,
        imagemin: boolean,
        moduleData: string
    },
    user: {
        git: {
            name: Function
        }
    }
};
export type ServerGenerator = {
    datasources: Object,
    enableGraphiql: boolean,
    graphqlPort: string,
    httpPort: string,
    httpsPort: string,
    markdownSupport: boolean,
    options: {
        defaults: boolean,
        http: string,
        https: string,
        graphql: string,
        ws: string
    },
    prompt: Function,
    useJest?: boolean,
    websocketPort: string
};
export type PluginGenerator = {
    async: Function,
    config: GeneratorConfig,
    defineArguments: string,
    dependencies: string[],
    depList: string[],
    iifeArguments: string,
    options: {
        alias: string,
        customDependency: string,
        name: string
    },
    pluginName: string,
    prompt: Function,
    requireStatements: string,
    use: {
        backbone?: boolean,
        underscore?: boolean,
        marionette?: boolean
    },
    user: {
        git: {
            name: Function
        }
    },
    userName: string
};
export type NativeGenerator = {
    composeWith: Function,
    config: GeneratorConfig,
    destinationPath: (path: string) => string,
    log: (message: string) => void,
    moduleFormat: string,
    npmInstall: (dependencies: string[], options?: {save?: boolean, saveDev?: boolean}) => void,
    option: Function,
    options: {
        skipWebapp: boolean
    },
    user: {
        git: {
            name: Function
        }
    }
}
