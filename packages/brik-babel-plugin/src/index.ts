import type { ConfigAPI, PluginObj } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';

export default declare((api: ConfigAPI): PluginObj => {
  api.assertVersion(7);
  return {
    name: 'brik-babel-plugin',
    visitor: {},
  };
});
