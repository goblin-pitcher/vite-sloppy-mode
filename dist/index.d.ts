import { GeneratorResult } from '@babel/generator';

interface sloppyModeParams {
    include?: RegExp | RegExp[];
    exclude?: RegExp | RegExp[];
}
declare const viteSloppyMode: (params?: sloppyModeParams) => {
    name: string;
    transform: (code: string, id: string) => Promise<GeneratorResult>;
};

export { viteSloppyMode as default };
