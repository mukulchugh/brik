import type { ConfigAPI, PluginObj } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import * as t from '@babel/types';

export default declare((api: ConfigAPI): PluginObj => {
  api.assertVersion(7);
  return {
    name: 'brik-babel-plugin',
    visitor: {
      JSXElement(path: any) {
        const { node } = path;
        const name = (node.openingElement.name as t.JSXIdentifier).name;

        // Only transform Brik components
        if (!name.startsWith('Brik')) return;

        // Convert BrikStack axis prop
        if (name === 'BrikStack') {
          const attrs = node.openingElement.attributes;
          const axisAttr = attrs.find(
            (attr: any): attr is t.JSXAttribute =>
              t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'axis',
          );

          if (axisAttr && t.isStringLiteral(axisAttr.value)) {
            // Convert 'row' to 'horizontal' and 'column' to 'vertical'
            if (axisAttr.value.value === 'row') {
              axisAttr.value.value = 'horizontal';
            } else if (axisAttr.value.value === 'column') {
              axisAttr.value.value = 'vertical';
            }
          }
        }
      },
    },
  };
});
