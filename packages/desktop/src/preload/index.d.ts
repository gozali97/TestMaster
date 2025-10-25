declare const api: {
    readFile: (filePath: string) => Promise<any>;
    writeFile: (filePath: string, content: string) => Promise<any>;
    getProjectPath: () => Promise<any>;
    project: {
        open: (projectPath: string) => void;
        save: (projectData: any) => void;
    };
    test: {
        start: (testId: string) => void;
        stop: () => void;
    };
    recorder: {
        start: (config: any) => void;
        stop: () => void;
    };
};
export type ElectronAPI = typeof api;
export {};
//# sourceMappingURL=index.d.ts.map