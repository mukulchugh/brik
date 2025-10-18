import type { Node as IRNode, Root as IRRoot } from '@brik/core';
import fs from 'fs-extra';
import path from 'path';

function swiftStyle(style?: any): string {
  let s = '';
  if (!style) return s;
  if (style.colors?.backgroundColor) s += `.background(Color(\"${style.colors.backgroundColor}\"))`;
  if (style.borders?.borderRadius) s += `.cornerRadius(${style.borders.borderRadius})`;
  if (style.layout?.width) s += `.frame(width: ${style.layout.width})`;
  if (style.layout?.height) s += `.frame(height: ${style.layout.height})`;
  if (style.colors?.opacity !== undefined) s += `.opacity(${style.colors.opacity})`;
  return s;
}

function emitNode(node: IRNode, indent = 2): string {
  const pad = ' '.repeat(indent);
  switch (node.type) {
    case 'Text': {
      const font = node.style?.typography?.fontSize
        ? `.font(.system(size: ${node.style.typography.fontSize}))`
        : '';
      const weightMap: Record<string, string> = {
        '400': 'regular',
        '500': 'medium',
        '700': 'bold',
      };
      const weightKey = node.style?.typography?.fontWeight as string | undefined;
      const weight = weightKey ? `.fontWeight(.${weightMap[weightKey] ?? 'regular'})` : '';
      const color = node.style?.typography?.color
        ? `.foregroundStyle(Color(\"${node.style.typography.color}\"))`
        : '';
      return `${pad}Text(\"${String((node as any).text)}\")${font}${weight}${color}${swiftStyle(node.style)}`;
    }
    case 'Image': {
      return `${pad}AsyncImage(url: URL(string: \"${(node as any).uri}\"))${swiftStyle(node.style)}`;
    }
    case 'Button': {
      return `${pad}Button(\"${(node as any).label}\", action: { /* TODO: onPress */ })${swiftStyle(node.style)}`;
    }
    case 'View': {
      const children = (node as any).children ?? [];
      if (!children.length) return `${pad}Color.clear${swiftStyle(node.style)}`;
      return `${pad}VStack(alignment: .leading, spacing: ${node.style?.layout?.gap ?? 0}) {
${children.map((c: IRNode) => emitNode(c, indent + 2)).join('\n')}
${pad}}${swiftStyle(node.style)}`;
    }
    case 'Stack': {
      const axis = (node as any).axis === 'horizontal' ? 'HStack' : 'VStack';
      const children = (node as any).children ?? [];
      return `${pad}${axis}(alignment: .center, spacing: ${node.style?.layout?.gap ?? 0}) {
${children.map((c: IRNode) => emitNode(c, indent + 2)).join('\n')}
${pad}}${swiftStyle(node.style)}`;
    }
    default:
      return `${pad}EmptyView()`;
  }
}

export function generateSwiftUI(root: IRRoot): string {
  const body = emitNode(root.tree, 4);
  return `import SwiftUI\n\nstruct ${root.rootId.replace(/[^A-Za-z0-9_]/g, '_')}: View {\n    var body: some View {\n${body}\n    }\n}`;
}

export async function writeSwiftFiles(roots: IRRoot[], iosDir: string) {
  const outDir = path.join(iosDir, 'brik', 'Generated');
  await fs.mkdirp(outDir);
  for (const r of roots) {
    const content = generateSwiftUI(r);
    const file = path.join(outDir, `${r.rootId.replace(/[^A-Za-z0-9_]/g, '_')}.swift`);
    await fs.writeFile(file, content, 'utf8');
    // If widget metadata exists, emit a minimal WidgetKit extension scaffold
    if ((r as any).widget) {
      const widgetDir = path.join(iosDir, 'BrikWidget');
      await fs.mkdirp(widgetDir);
      const widgetSwift = `import WidgetKit\nimport SwiftUI\n\n@main\nstruct BrikWidgets: WidgetBundle {\n  var body: some Widget {\n    BrikWidget()\n  }\n}\n\nstruct BrikWidget: Widget {\n  var body: some WidgetConfiguration {\n    StaticConfiguration(kind: "BrikWidget", provider: Provider()) { entry in\n      ${r.rootId.replace(/[^A-Za-z0-9_]/g, '_')}()\n    }\n  }\n}\n\nstruct Provider: TimelineProvider {\n  typealias Entry = SimpleEntry\n  func placeholder(in context: Context) -> SimpleEntry { SimpleEntry(date: Date()) }\n  func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) { completion(SimpleEntry(date: Date())) }\n  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {\n    let timeline = Timeline(entries: [SimpleEntry(date: Date())], policy: .never)\n    completion(timeline)\n  }\n}\n\nstruct SimpleEntry: TimelineEntry { let date: Date }`;
      await fs.writeFile(path.join(widgetDir, 'BrikWidget.swift'), widgetSwift, 'utf8');
    }
  }
}
