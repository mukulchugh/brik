import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { BRIK_DIR, validateRoot, type Node as IRNode, type Root as IRRoot } from '@brik/core';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';

export interface CompileOptions {
  projectRoot: string;
  entries?: string[];
  outDir?: string; // defaults to .brik
  asWidget?: boolean; // mark roots as widgets
}

const ensureDir = async (dir: string) => {
  await fs.mkdirp(dir);
};

function literalToString(
  value: t.StringLiteral | t.NumericLiteral | t.BooleanLiteral,
): string | number | boolean {
  if (t.isStringLiteral(value)) return value.value;
  if (t.isNumericLiteral(value)) return value.value;
  if (t.isBooleanLiteral(value)) return value.value;
  return String((value as any).value ?? '');
}

function styleFromJSX(
  attrs: (t.JSXAttribute | t.JSXSpreadAttribute)[],
): Record<string, unknown> | undefined {
  const styleAttr = attrs.find((a) => t.isJSXAttribute(a) && a.name.name === 'style') as
    | t.JSXAttribute
    | undefined;
  if (!styleAttr || !styleAttr.value) return undefined;
  if (
    t.isJSXExpressionContainer(styleAttr.value) &&
    t.isObjectExpression(styleAttr.value.expression)
  ) {
    const obj: Record<string, unknown> = {};
    for (const prop of styleAttr.value.expression.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        if (
          t.isStringLiteral(prop.value) ||
          t.isNumericLiteral(prop.value) ||
          t.isBooleanLiteral(prop.value)
        ) {
          obj[prop.key.name] = (prop.value as any).value;
        }
      }
    }
    return obj;
  }
  return undefined;
}

function propString(
  attrs: (t.JSXAttribute | t.JSXSpreadAttribute)[],
  name: string,
): string | undefined {
  const attr = attrs.find((a) => t.isJSXAttribute(a) && a.name.name === name) as
    | t.JSXAttribute
    | undefined;
  if (!attr || !attr.value) return undefined;
  if (t.isStringLiteral(attr.value)) return attr.value.value;
  if (t.isJSXExpressionContainer(attr.value) && t.isStringLiteral(attr.value.expression))
    return attr.value.expression.value;
  return undefined;
}

function propNumber(
  attrs: (t.JSXAttribute | t.JSXSpreadAttribute)[],
  name: string,
): number | undefined {
  const attr = attrs.find((a) => t.isJSXAttribute(a) && a.name.name === name) as
    | t.JSXAttribute
    | undefined;
  if (!attr || !attr.value) return undefined;
  if (t.isJSXExpressionContainer(attr.value) && t.isNumericLiteral(attr.value.expression))
    return attr.value.expression.value;
  return undefined;
}

function propBoolean(
  attrs: (t.JSXAttribute | t.JSXSpreadAttribute)[],
  name: string,
): boolean | undefined {
  const attr = attrs.find((a) => t.isJSXAttribute(a) && a.name.name === name) as
    | t.JSXAttribute
    | undefined;
  if (!attr) return undefined;
  if (!attr.value) return true; // Presence without value means true
  if (t.isJSXExpressionContainer(attr.value) && t.isBooleanLiteral(attr.value.expression))
    return attr.value.expression.value;
  return undefined;
}

function extractAction(attrs: (t.JSXAttribute | t.JSXSpreadAttribute)[]): any | undefined {
  const actionAttr = attrs.find((a) => t.isJSXAttribute(a) && a.name.name === 'action') as
    | t.JSXAttribute
    | undefined;
  if (!actionAttr || !actionAttr.value) return undefined;

  if (
    t.isJSXExpressionContainer(actionAttr.value) &&
    t.isObjectExpression(actionAttr.value.expression)
  ) {
    const obj: any = {};
    for (const prop of actionAttr.value.expression.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const key = prop.key.name;
        if (t.isStringLiteral(prop.value)) {
          obj[key] = prop.value.value;
        } else if (t.isNumericLiteral(prop.value)) {
          obj[key] = prop.value.value;
        } else if (t.isBooleanLiteral(prop.value)) {
          obj[key] = prop.value.value;
        } else if (t.isObjectExpression(prop.value)) {
          // Handle nested params object
          const params: any = {};
          for (const p of prop.value.properties) {
            if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
              if (
                t.isStringLiteral(p.value) ||
                t.isNumericLiteral(p.value) ||
                t.isBooleanLiteral(p.value)
              ) {
                params[p.key.name] = (p.value as any).value;
              }
            }
          }
          obj[key] = params;
        }
      }
    }
    return obj;
  }
  return undefined;
}

function normalizeStyle(raw?: Record<string, unknown>) {
  if (!raw) return undefined;
  const style: any = {};
  const layout: any = {};
  const typography: any = {};
  const colors: any = {};
  const borders: any = {};
  const shadows: any = {};

  for (const [k, v] of Object.entries(raw)) {
    // Layout properties
    if (
      [
        'flexDirection',
        'alignItems',
        'justifyContent',
        'gap',
        'padding',
        'paddingHorizontal',
        'paddingVertical',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'margin',
        'marginHorizontal',
        'marginVertical',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'flex',
        'flexGrow',
        'flexShrink',
        'flexBasis',
        'position',
        'top',
        'right',
        'bottom',
        'left',
        'aspectRatio',
        'zIndex',
      ].includes(k)
    ) {
      layout[k] = v;
    }
    // Typography properties
    else if (
      [
        'fontSize',
        'fontWeight',
        'fontFamily',
        'fontStyle',
        'color',
        'numberOfLines',
        'ellipsizeMode',
        'textAlign',
        'textTransform',
        'lineHeight',
        'letterSpacing',
      ].includes(k)
    ) {
      typography[k] = v;
    }
    // Color properties
    else if (['backgroundColor', 'opacity', 'tintColor'].includes(k)) {
      colors[k] = v;
    }
    // Border properties
    else if (
      [
        'borderRadius',
        'borderTopLeftRadius',
        'borderTopRightRadius',
        'borderBottomLeftRadius',
        'borderBottomRightRadius',
        'borderWidth',
        'borderColor',
        'borderStyle',
      ].includes(k)
    ) {
      borders[k] = v;
    }
    // Shadow properties
    else if (
      [
        'shadowColor',
        'shadowOpacity',
        'shadowRadius',
        'shadowOffsetX',
        'shadowOffsetY',
        'elevation',
      ].includes(k)
    ) {
      shadows[k] = v;
    }
  }

  if (Object.keys(layout).length) style.layout = layout;
  if (Object.keys(typography).length) style.typography = typography;
  if (Object.keys(colors).length) style.colors = colors;
  if (Object.keys(borders).length) style.borders = borders;
  if (Object.keys(shadows).length) style.shadows = shadows;

  return Object.keys(style).length ? style : undefined;
}

function buildIRNode(node: t.JSXElement): IRNode | null {
  const name = (node.openingElement.name as t.JSXIdentifier).name;
  const attrs = node.openingElement.attributes;
  const style = normalizeStyle(styleFromJSX(attrs));
  const action = extractAction(attrs);

  // Base properties for all nodes
  const baseProps: any = {};
  if (style) baseProps.style = style;
  if (action) baseProps.action = action;

  if (name === 'BrikText') {
    let text = '' as string | number;
    if (node.children && node.children.length > 0) {
      const first = node.children[0];
      if (t.isJSXText(first)) text = first.value.trim();
      if (t.isJSXExpressionContainer(first) && t.isNumericLiteral(first.expression))
        text = first.expression.value;
      if (t.isJSXExpressionContainer(first) && t.isStringLiteral(first.expression))
        text = first.expression.value;
    }
    return { type: 'Text', text, ...baseProps } as any;
  }

  if (name === 'BrikButton') {
    const label = propString(attrs, 'label') ?? 'Button';
    const variant = propString(attrs, 'variant');
    const size = propString(attrs, 'size');
    const buttonProps: any = { type: 'Button', label, ...baseProps };
    if (variant) buttonProps.variant = variant;
    if (size) buttonProps.size = size;
    return buttonProps;
  }

  if (name === 'BrikImage') {
    const uri = propString(attrs, 'uri') ?? '';
    const resizeMode = propString(attrs, 'resizeMode');
    const placeholder = propString(attrs, 'placeholder');
    const imageProps: any = { type: 'Image', uri, ...baseProps };
    if (resizeMode) imageProps.resizeMode = resizeMode;
    if (placeholder) imageProps.placeholder = placeholder;
    return imageProps;
  }

  if (name === 'BrikStack') {
    const axisProp = propString(attrs, 'axis');
    const axis = axisProp === 'horizontal' ? 'horizontal' : 'vertical';
    const children: IRNode[] = [];
    for (const child of node.children) {
      if (t.isJSXElement(child)) {
        const n = buildIRNode(child);
        if (n) children.push(n);
      }
    }
    return { type: 'Stack', axis: axis as any, children, ...baseProps } as any;
  }

  if (name === 'BrikView') {
    const children: IRNode[] = [];
    for (const child of node.children) {
      if (t.isJSXElement(child)) {
        const n = buildIRNode(child);
        if (n) children.push(n);
      } else if (t.isJSXText(child) && child.value.trim().length) {
        children.push({ type: 'Text', text: child.value.trim() } as any);
      }
    }
    return { type: 'View', children, ...baseProps } as any;
  }

  if (name === 'BrikSpacer') {
    const flex = propNumber(attrs, 'flex');
    const spacerProps: any = { type: 'Spacer', ...baseProps };
    if (flex !== undefined) spacerProps.flex = flex;
    return spacerProps;
  }

  if (name === 'BrikProgressBar') {
    const progress = propNumber(attrs, 'progress') ?? 0;
    const indeterminate = propBoolean(attrs, 'indeterminate');
    const progressProps: any = { type: 'ProgressBar', progress, ...baseProps };
    if (indeterminate) progressProps.indeterminate = indeterminate;
    return progressProps;
  }

  if (name === 'BrikList') {
    // For now, we'll just parse basic list properties
    // Full list rendering would need more complex template handling
    const horizontal = propBoolean(attrs, 'horizontal');
    const listProps: any = { type: 'List', items: [], renderItem: 'default', ...baseProps };
    if (horizontal) listProps.horizontal = horizontal;
    return listProps;
  }

  return null;
}

// Helper to detect if a function has @brik-activity JSDoc comment
function hasActivityComment(path: any): boolean {
  const comments = path.node.leadingComments;
  if (!comments) return false;
  return comments.some((comment: any) => comment.value.includes('@brik-activity'));
}

// Helper to parse Live Activity configuration from return statement
function parseLiveActivityConfig(returnStatement: t.ReturnStatement): any | null {
  if (!returnStatement.argument || !t.isObjectExpression(returnStatement.argument)) {
    return null;
  }

  const config: any = {
    activityType: '',
    attributes: { static: {}, dynamic: {} },
    regions: {},
  };

  for (const prop of returnStatement.argument.properties) {
    if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) continue;

    const key = prop.key.name;

    if (key === 'activityType' && t.isStringLiteral(prop.value)) {
      config.activityType = prop.value.value;
    } else if (key === 'attributes' && t.isObjectExpression(prop.value)) {
      for (const attrProp of prop.value.properties) {
        if (!t.isObjectProperty(attrProp) || !t.isIdentifier(attrProp.key)) continue;
        const attrKey = attrProp.key.name;

        if ((attrKey === 'static' || attrKey === 'dynamic') && t.isObjectExpression(attrProp.value)) {
          for (const field of attrProp.value.properties) {
            if (!t.isObjectProperty(field) || !t.isIdentifier(field.key)) continue;
            const fieldName = field.key.name;
            const fieldValue = t.isStringLiteral(field.value) ? field.value.value : 'string';
            config.attributes[attrKey][fieldName] = fieldValue;
          }
        }
      }
    } else if (key === 'regions' && t.isObjectExpression(prop.value)) {
      for (const regionProp of prop.value.properties) {
        if (!t.isObjectProperty(regionProp) || !t.isIdentifier(regionProp.key)) continue;
        const regionKey = regionProp.key.name;

        if (regionKey === 'lockScreen' && t.isJSXElement(regionProp.value)) {
          config.regions.lockScreen = buildIRNode(regionProp.value);
        } else if (regionKey === 'dynamicIsland' && t.isObjectExpression(regionProp.value)) {
          config.regions.dynamicIsland = {};
          for (const islandProp of regionProp.value.properties) {
            if (!t.isObjectProperty(islandProp) || !t.isIdentifier(islandProp.key)) continue;
            const islandKey = islandProp.key.name;
            if (t.isJSXElement(islandProp.value)) {
              config.regions.dynamicIsland[islandKey] = buildIRNode(islandProp.value);
            }
          }
        }
      }
    }
  }

  return config.activityType ? config : null;
}

export async function compileFiles(options: CompileOptions): Promise<IRRoot[]> {
  const projectRoot = options.projectRoot;
  const outDir = options.outDir ?? path.join(projectRoot, BRIK_DIR);
  await ensureDir(outDir);
  const entries =
    options.entries ??
    (await glob(['**/*.{tsx,jsx}'], {
      cwd: projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**', '**/lib/**'],
    }));

  const roots: IRRoot[] = [];
  for (const rel of entries) {
    const abs = path.join(projectRoot, rel);
    const code = await fs.readFile(abs, 'utf8');
    const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

    let rootNode: IRNode | null = null;
    let liveActivityConfig: any = null;

    // First, check for Live Activity functions
    traverse(ast, {
      FunctionDeclaration(path: any) {
        if (hasActivityComment(path)) {
          const body = path.node.body.body;
          const returnStmt = body.find((stmt: any) => t.isReturnStatement(stmt));
          if (returnStmt) {
            liveActivityConfig = parseLiveActivityConfig(returnStmt);
          }
        }
      },
      ExportNamedDeclaration(path: any) {
        if (path.node.declaration && t.isFunctionDeclaration(path.node.declaration)) {
          if (hasActivityComment(path)) {
            const body = path.node.declaration.body.body;
            const returnStmt = body.find((stmt: any) => t.isReturnStatement(stmt));
            if (returnStmt) {
              liveActivityConfig = parseLiveActivityConfig(returnStmt);
            }
          }
        }
      },
    });

    // If no Live Activity found, look for regular widget JSX
    if (!liveActivityConfig) {
      traverse(ast, {
        JSXElement(path: any) {
          if (t.isJSXIdentifier(path.node.openingElement.name)) {
            const n = buildIRNode(path.node);
            if (n) {
              rootNode = n;
              path.stop();
            }
          }
        },
      });
    }

    // Create root if we found either a widget or activity
    if (rootNode || liveActivityConfig) {
      const root: IRRoot = {
        version: 1 as const,
        rootId: rel.replace(/[\/\\]/g, '_'),
        tree: rootNode || ({ type: 'View', children: [] } as any),
      };

      if (liveActivityConfig) {
        (root as any).liveActivity = liveActivityConfig;
      } else if (options.asWidget) {
        (root as any).widget = {
          kind: 'BrikWidget',
          families: ['systemMedium', 'medium'], // iOS and Android defaults
          displayName: 'Brik Widget',
          description: 'Widget built with Brik',
        };
      }

      validateRoot(root);
      roots.push(root);
      await fs.writeJson(path.join(outDir, `${root.rootId}.json`), root, { spaces: 2 });
    }
  }
  await fs.writeJson(
    path.join(outDir, `index.json`),
    { count: roots.length, roots: roots.map((r) => r.rootId) },
    { spaces: 2 },
  );
  return roots;
}
