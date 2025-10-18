import type { Node as IRNode, Root as IRRoot } from '@brik/core';
import fs from 'fs-extra';
import path from 'path';

function hexToSwiftUIColor(input?: string): string | null {
  if (!input) return null;
  let h = input.trim();
  if (!h.startsWith('#')) return null;
  h = h.slice(1);
  if (h.length === 3) {
    const r = h[0];
    const g = h[1];
    const b = h[2];
    h = `FF${r}${r}${g}${g}${b}${b}`; // expand to AARRGGBB with FF alpha
  } else if (h.length === 4) {
    const a = h[0];
    const r = h[1];
    const g = h[2];
    const b = h[3];
    h = `${a}${a}${r}${r}${g}${g}${b}${b}`;
  } else if (h.length === 6) {
    h = `FF${h}`;
  } else if (h.length !== 8) {
    return null;
  }
  const a = parseInt(h.slice(0, 2), 16);
  const r = parseInt(h.slice(2, 4), 16);
  const g = parseInt(h.slice(4, 6), 16);
  const b = parseInt(h.slice(6, 8), 16);
  // SwiftUI Color initializer with sRGB and double components 0..1
  const toF = (v: number) => (v / 255).toFixed(3);
  const alpha = toF(a);
  const rr = toF(r);
  const gg = toF(g);
  const bb = toF(b);
  return `Color(.sRGB, red: ${rr}, green: ${gg}, blue: ${bb}, opacity: ${alpha})`;
}

function swiftStyle(style?: any): string {
  let s = '';
  if (!style) return s;

  // Layout styles
  if (
    style.layout?.width ||
    style.layout?.height ||
    style.layout?.minWidth ||
    style.layout?.minHeight ||
    style.layout?.maxWidth ||
    style.layout?.maxHeight
  ) {
    const parts: string[] = [];
    if (style.layout?.width) parts.push(`width: ${style.layout.width}`);
    if (style.layout?.height) parts.push(`height: ${style.layout.height}`);
    if (style.layout?.minWidth) parts.push(`minWidth: ${style.layout.minWidth}`);
    if (style.layout?.minHeight) parts.push(`minHeight: ${style.layout.minHeight}`);
    if (style.layout?.maxWidth) parts.push(`maxWidth: ${style.layout.maxWidth}`);
    if (style.layout?.maxHeight) parts.push(`maxHeight: ${style.layout.maxHeight}`);
    if (parts.length) s += `.frame(${parts.join(', ')})`;
  }

  // Aspect ratio
  if (style.layout?.aspectRatio) {
    s += `.aspectRatio(${style.layout.aspectRatio}, contentMode: .fit)`;
  }

  // Color styles
  if (style.colors?.backgroundColor) {
    const bg =
      hexToSwiftUIColor(style.colors.backgroundColor) ??
      `Color(\"${style.colors.backgroundColor}\")`;
    s += `.background(${bg})`;
  }
  if (style.colors?.opacity !== undefined) {
    s += `.opacity(${style.colors.opacity})`;
  }

  // Border styles
  if (style.borders?.borderRadius) {
    s += `.cornerRadius(${style.borders.borderRadius})`;
  }

  if (style.borders?.borderWidth && style.borders?.borderColor) {
    const borderColor =
      hexToSwiftUIColor(style.borders.borderColor) ?? `Color(\"${style.borders.borderColor}\")`;
    s += `.overlay(RoundedRectangle(cornerRadius: ${style.borders?.borderRadius ?? 0}).stroke(${borderColor}, lineWidth: ${style.borders.borderWidth}))`;
  }

  // Shadow styles
  if (style.shadows?.shadowRadius || style.shadows?.shadowColor) {
    const shadowColor = style.shadows?.shadowColor
      ? (hexToSwiftUIColor(style.shadows.shadowColor) ?? `Color(\"${style.shadows.shadowColor}\")`)
      : 'Color.black';
    const radius = style.shadows?.shadowRadius ?? 4;
    const x = style.shadows?.shadowOffsetX ?? 0;
    const y = style.shadows?.shadowOffsetY ?? 2;
    s += `.shadow(color: ${shadowColor}.opacity(${style.shadows?.shadowOpacity ?? 0.2}), radius: ${radius}, x: ${x}, y: ${y})`;
  }

  // Padding
  if (style.layout?.padding) {
    s += `.padding(${style.layout.padding})`;
  } else {
    if (style.layout?.paddingHorizontal)
      s += `.padding(.horizontal, ${style.layout.paddingHorizontal})`;
    if (style.layout?.paddingVertical) s += `.padding(.vertical, ${style.layout.paddingVertical})`;
    if (style.layout?.paddingTop) s += `.padding(.top, ${style.layout.paddingTop})`;
    if (style.layout?.paddingBottom) s += `.padding(.bottom, ${style.layout.paddingBottom})`;
    if (style.layout?.paddingLeft) s += `.padding(.leading, ${style.layout.paddingLeft})`;
    if (style.layout?.paddingRight) s += `.padding(.trailing, ${style.layout.paddingRight})`;
  }

  // Z-index
  if (style.layout?.zIndex !== undefined) {
    s += `.zIndex(${style.layout.zIndex})`;
  }

  return s;
}

function wrapWithAction(content: string, action: any, indent: number): string {
  if (!action) return content;

  const pad = ' '.repeat(indent);
  if (action.type === 'deeplink' && action.url) {
    return `${pad}Link(destination: URL(string: "${action.url}")!) {\n${content}\n${pad}}`;
  }

  // For other action types, we'd need button wrapping or other handlers
  return content;
}

export function emitNode(node: IRNode, indent = 2): string {
  const pad = ' '.repeat(indent);
  const action = (node as any).action;

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
        ? `.foregroundStyle(${hexToSwiftUIColor(node.style.typography.color) ?? `Color(\"${node.style.typography.color}\")`})`
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
      const alignment = getSwiftAlignment(node.style?.layout?.alignItems, axis === 'HStack');
      const content = `${pad}${axis}(alignment: ${alignment}, spacing: ${node.style?.layout?.gap ?? 0}) {
${children.map((c: IRNode) => emitNode(c, indent + 2)).join('\n')}
${pad}}${swiftStyle(node.style)}`;
      return wrapWithAction(content, action, indent);
    }
    case 'Spacer': {
      const flex = (node as any).flex;
      if (flex) {
        return `${pad}Spacer().frame(maxWidth: .infinity, maxHeight: .infinity)`;
      }
      return `${pad}Spacer()`;
    }
    case 'ProgressBar': {
      const progress = (node as any).progress ?? 0;
      const indeterminate = (node as any).indeterminate;
      if (indeterminate) {
        return `${pad}ProgressView()${swiftStyle(node.style)}`;
      }
      return `${pad}ProgressView(value: ${progress})${swiftStyle(node.style)}`;
    }
    case 'List': {
      // Simplified list - in real implementation would need data binding
      return `${pad}ScrollView {
${pad}    VStack(alignment: .leading) {
${pad}        // List items
${pad}    }
${pad}}${swiftStyle(node.style)}`;
    }
    default:
      return `${pad}EmptyView()`;
  }
}

function getSwiftAlignment(align?: string, isHStack?: boolean): string {
  if (!align) return '.center';
  if (isHStack) {
    switch (align) {
      case 'flex-start':
        return '.top';
      case 'flex-end':
        return '.bottom';
      case 'baseline':
        return '.firstTextBaseline';
      default:
        return '.center';
    }
  } else {
    switch (align) {
      case 'flex-start':
        return '.leading';
      case 'flex-end':
        return '.trailing';
      default:
        return '.center';
    }
  }
}

export function generateSwiftUI(root: IRRoot): string {
  const body = emitNode(root.tree, 4);
  return `import SwiftUI\n\nstruct ${root.rootId.replace(/[^A-Za-z0-9_]/g, '_')}: View {\n    var body: some View {\n${body}\n    }\n}`;
}

// Export specialized version for Live Activities that handles context references
export function emitNodeForActivity(node: IRNode, indent = 2): string {
  // For Live Activities, we need to emit the same structure but without
  // context references in the IR (they'll be handled separately)
  return emitNode(node, indent);
}

export async function writeSwiftFiles(roots: IRRoot[], iosDir: string) {
  const outDir = path.join(iosDir, 'brik', 'Generated');
  await fs.mkdirp(outDir);

  // Import the Live Activities generator
  const { writeLiveActivityFiles } = await import('./live-activities');

  for (const r of roots) {
    // Check if this is a Live Activity
    if ((r as any).liveActivity) {
      // Skip regular Swift file generation for Live Activities
      // They're handled by writeLiveActivityFiles
      continue;
    }

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

  // Generate Live Activity files
  await writeLiveActivityFiles(roots, iosDir);
}
