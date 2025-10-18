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

function normalizeStyle(raw?: Record<string, unknown>) {
  if (!raw) return undefined;
  const style: any = {};
  const layout: any = {};
  const typography: any = {};
  const colors: any = {};
  const borders: any = {};
  for (const [k, v] of Object.entries(raw)) {
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
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
      ].includes(k)
    ) {
      layout[k] = v;
    } else if (['fontSize', 'fontWeight', 'numberOfLines', 'ellipsizeMode', 'color'].includes(k)) {
      typography[k] = v;
    } else if (['backgroundColor', 'opacity'].includes(k)) {
      colors[k] = v;
    } else if (['borderRadius'].includes(k)) {
      borders[k] = v;
    }
  }
  if (Object.keys(layout).length) style.layout = layout;
  if (Object.keys(typography).length) style.typography = typography;
  if (Object.keys(colors).length) style.colors = colors;
  if (Object.keys(borders).length) style.borders = borders;
  return style;
}

function buildIRNode(node: t.JSXElement): IRNode | null {
  const name = (node.openingElement.name as t.JSXIdentifier).name;
  const attrs = node.openingElement.attributes;
  const style = normalizeStyle(styleFromJSX(attrs));

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
    return { type: 'Text', text, style } as any;
  }

  if (name === 'BrikButton') {
    const label = propString(attrs, 'label') ?? 'Button';
    return { type: 'Button', label, style } as any;
  }

  if (name === 'BrikImage') {
    const uri = propString(attrs, 'uri') ?? '';
    return { type: 'Image', uri, style } as any;
  }

  if (name === 'BrikStack') {
    const axis = propString(attrs, 'axis') === 'row' ? 'horizontal' : 'vertical';
    const children: IRNode[] = [];
    for (const child of node.children) {
      if (t.isJSXElement(child)) {
        const n = buildIRNode(child);
        if (n) children.push(n);
      }
    }
    return { type: 'Stack', axis: axis as any, children, style } as any;
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
    return { type: 'View', children, style } as any;
  }

  return null;
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
    if (rootNode) {
      const root: IRRoot = {
        version: 1 as const,
        rootId: rel.replace(/[\/\\]/g, '_'),
        tree: rootNode,
      };
      if (options.asWidget) {
        (root as any).widget = { kind: 'BrikWidget', sizes: ['small', 'medium'] };
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
