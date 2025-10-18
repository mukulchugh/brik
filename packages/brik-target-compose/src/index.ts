import type { Node as IRNode, Root as IRRoot } from '@brik/core';
import fs from 'fs-extra';
import path from 'path';

function composeStyle(style?: any): string {
  let s = 'Modifier';
  if (!style) return s;
  if (style.layout?.width) s += `.width(${style.layout.width}.dp)`;
  if (style.layout?.height) s += `.height(${style.layout.height}.dp)`;
  if (style.borders?.borderRadius)
    s += `.clip(RoundedCornerShape(${style.borders.borderRadius}.dp))`;
  if (style.colors?.backgroundColor)
    s += `.background(Color(${JSON.stringify(style.colors.backgroundColor)}))`;
  if (style.colors?.opacity !== undefined) s += `.alpha(${style.colors.opacity}f)`;
  return s;
}

function emitNode(node: IRNode, indent = 2): string {
  const pad = ' '.repeat(indent);
  switch (node.type) {
    case 'Text': {
      const size = node.style?.typography?.fontSize
        ? `.fontSize(${node.style.typography.fontSize}.sp)`
        : '';
      const weightMap: Record<string, string> = {
        '400': 'FontWeight.Normal',
        '500': 'FontWeight.Medium',
        '700': 'FontWeight.Bold',
      };
      const weightKey = node.style?.typography?.fontWeight as string | undefined;
      const weight = weightKey ? `.fontWeight(${weightMap[weightKey] ?? 'FontWeight.Normal'})` : '';
      const color = node.style?.typography?.color
        ? `, color = Color(${JSON.stringify(node.style.typography.color)})`
        : '';
      return `${pad}Text(text = "${String((node as any).text)}", modifier = ${composeStyle(node.style)}${color})${size}${weight}`;
    }
    case 'Image': {
      return `${pad}AsyncImage(model = "${(node as any).uri}", modifier = ${composeStyle(node.style)})`;
    }
    case 'Button': {
      return `${pad}Button(onClick = { /* TODO: onPress */ }, modifier = ${composeStyle(node.style)}) { Text("${(node as any).label}") }`;
    }
    case 'View': {
      const children = (node as any).children ?? [];
      if (!children.length) return `${pad}Spacer(modifier = ${composeStyle(node.style)})`;
      return `${pad}Column(verticalArrangement = Arrangement.spacedBy(${node.style?.layout?.gap ?? 0}.dp), modifier = ${composeStyle(node.style)}) {\n${children.map((c: IRNode) => emitNode(c, indent + 2)).join('\n')}\n${pad}}`;
    }
    case 'Stack': {
      const isRow = (node as any).axis === 'horizontal';
      const children = (node as any).children ?? [];
      const container = isRow ? 'Row' : 'Column';
      const arrangement = isRow ? 'Arrangement.spacedBy' : 'Arrangement.spacedBy';
      return `${pad}${container}(horizontalArrangement = ${isRow ? `${arrangement}(${node.style?.layout?.gap ?? 0}.dp)` : 'Arrangement.Start'}, verticalArrangement = ${isRow ? 'Arrangement.Center' : `${arrangement}(${node.style?.layout?.gap ?? 0}.dp)`}, modifier = ${composeStyle(node.style)}) {\n${children.map((c: IRNode) => emitNode(c, indent + 2)).join('\n')}\n${pad}}`;
    }
    default:
      return `${pad}Spacer()`;
  }
}

export function generateCompose(root: IRRoot): string {
  const name = root.rootId.replace(/[^A-Za-z0-9_]/g, '_');
  const body = emitNode(root.tree, 4);
  return `import androidx.compose.foundation.*\nimport androidx.compose.runtime.*\nimport androidx.compose.ui.*\nimport androidx.compose.ui.graphics.Color\nimport androidx.compose.ui.text.font.FontWeight\nimport androidx.compose.ui.unit.*\nimport androidx.compose.foundation.layout.*\n\n@Composable\nfun ${name}() {\n${body}\n}`;
}

export async function writeComposeFiles(roots: IRRoot[], androidDir: string) {
  const outDir = path.join(androidDir, 'brik', 'src', 'main', 'java', 'generated');
  await fs.mkdirp(outDir);
  for (const r of roots) {
    const content = generateCompose(r);
    const file = path.join(outDir, `${r.rootId.replace(/[^A-Za-z0-9_]/g, '_')}.kt`);
    await fs.writeFile(file, content, 'utf8');
    // If widget metadata exists, emit a minimal Glance AppWidget provider scaffold
    if ((r as any).widget) {
      const modDir = path.join(androidDir, 'brikwidget', 'src', 'main', 'java', 'generated');
      await fs.mkdirp(modDir);
      const provider = `package generated\n\nimport android.content.Context\nimport androidx.glance.appwidget.GlanceAppWidget\nimport androidx.glance.appwidget.GlanceAppWidgetReceiver\nimport androidx.compose.runtime.Composable\n\nclass BrikWidgetReceiver : GlanceAppWidgetReceiver() {\n  override val glanceAppWidget: GlanceAppWidget = BrikWidget()\n}\n\nclass BrikWidget : GlanceAppWidget(){ }`;
      await fs.writeFile(path.join(modDir, 'BrikWidget.kt'), provider, 'utf8');
    }
  }
}
