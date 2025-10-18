declare module '@babel/helper-plugin-utils';
declare module '@babel/core' {
  export interface ConfigAPI {
    assertVersion: (range: number | string) => void;
  }
  export interface PluginObj {
    name?: string;
    visitor?: Record<string, any>;
  }
}


