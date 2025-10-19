import type { Node as IRNode, Root as IRRoot } from '@brik/core';
import fs from 'fs-extra';
import path from 'path';

function hexToArgbInt(hex: string): string | null {
  // Supports #RGB, #ARGB, #RRGGBB, #AARRGGBB
  let h = hex.trim();
  if (!h.startsWith('#')) return null;
  h = h.slice(1);
  if (h.length === 3) {
    const r = h[0];
    const g = h[1];
    const b = h[2];
    h = `FF${r}${r}${g}${g}${b}${b}`;
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
  // Kotlin expects 0xAARRGGBB
  return `0x${h.toUpperCase()}`;
}

function composeColorLiteral(input?: string): string | null {
  if (!input) return null;
  const argb = hexToArgbInt(input);
  if (argb) return `Color(${argb})`;
  return null; // Unsupported string format
}

function composeStyle(style?: any): string {
  let s = 'Modifier';
  if (!style) return s;

  // Layout styles
  if (style.layout?.width) s += `.width(${style.layout.width}.dp)`;
  if (style.layout?.height) s += `.height(${style.layout.height}.dp)`;

  // Padding
  if (style.layout?.padding) {
    s += `.padding(${style.layout.padding}.dp)`;
  } else {
    if (style.layout?.paddingHorizontal)
      s += `.padding(horizontal = ${style.layout.paddingHorizontal}.dp)`;
    if (style.layout?.paddingVertical)
      s += `.padding(vertical = ${style.layout.paddingVertical}.dp)`;
  }

  // Border styles
  if (style.borders?.borderRadius) {
    s += `.clip(RoundedCornerShape(${style.borders.borderRadius}.dp))`;
  }

  // Color styles
  if (style.colors?.backgroundColor) {
    const bg = composeColorLiteral(style.colors.backgroundColor);
    if (bg) s += `.background(${bg})`;
  }
  if (style.colors?.opacity !== undefined) {
    s += `.alpha(${style.colors.opacity}f)`;
  }

  return s;
}

function mapJustifyToArrangement(value?: string): string {
  switch (value) {
    case 'center':
      return 'Arrangement.Center';
    case 'flex-end':
      return 'Arrangement.End';
    case 'space-between':
      return 'Arrangement.SpaceBetween';
    case 'space-around':
      return 'Arrangement.SpaceAround';
    case 'space-evenly':
      return 'Arrangement.SpaceEvenly';
    case 'flex-start':
    default:
      return 'Arrangement.Start';
  }
}

function mapAlignForRow(value?: string): string {
  switch (value) {
    case 'flex-start':
      return 'Alignment.Top';
    case 'flex-end':
      return 'Alignment.Bottom';
    case 'center':
    default:
      return 'Alignment.CenterVertically';
  }
}

function mapAlignForColumn(value?: string): string {
  switch (value) {
    case 'flex-start':
      return 'Alignment.Start';
    case 'flex-end':
      return 'Alignment.End';
    case 'center':
    default:
      return 'Alignment.CenterHorizontally';
  }
}

function emitNode(node: IRNode, indent = 2): string {
  const pad = ' '.repeat(indent);
  switch (node.type) {
    case 'Text': {
      const size = node.style?.typography?.fontSize
        ? `fontSize = ${node.style.typography.fontSize}.sp`
        : '';
      const weightMap: Record<string, string> = {
        '400': 'FontWeight.Normal',
        '500': 'FontWeight.Medium',
        '700': 'FontWeight.Bold',
      };
      const weightKey = node.style?.typography?.fontWeight as string | undefined;
      const weight = weightKey ? `fontWeight = ${weightMap[weightKey] ?? 'FontWeight.Normal'}` : '';
      const textColor = node.style?.typography?.color
        ? composeColorLiteral(node.style?.typography?.color)
        : null;
      const styleBits = [size, weight].filter(Boolean).join(', ');
      const stylePart = styleBits ? `, style = TextStyle(${styleBits})` : '';
      const colorPart = textColor ? `, color = ${textColor}` : '';
      return `${pad}Text(text = "${String((node as any).text)}", modifier = ${composeStyle(node.style)}${colorPart}${stylePart})`;
    }
    case 'Image': {
      return `${pad}AsyncImage(model = "${(node as any).uri}", contentDescription = null, modifier = ${composeStyle(node.style)})`;
    }
    case 'Button': {
      const label = (node as any).label;
      const action = (node as any).action;

      if (action?.type === 'deeplink' && action.url) {
        // For regular Compose UI, handle deep link with Intent
        return `${pad}Button(
${pad}    onClick = {
${pad}        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("${action.url}"))
${pad}        context.startActivity(intent)
${pad}    },
${pad}    modifier = ${composeStyle(node.style)}
${pad}) { Text("${label}") }`;
      }

      // No action - empty click handler
      return `${pad}Button(onClick = {}, modifier = ${composeStyle(node.style)}) { Text("${label}") }`;
    }
    case 'View': {
      const children = (node as any).children ?? [];
      if (!children.length) return `${pad}Spacer(modifier = ${composeStyle(node.style)})`;
      const gap = node.style?.layout?.gap ?? 0;
      const verticalArrangement = `Arrangement.spacedBy(${gap}.dp)`;
      const horizontalAlignment = mapAlignForColumn(node.style?.layout?.alignItems);
      return `${pad}Column(verticalArrangement = ${verticalArrangement}, horizontalAlignment = ${horizontalAlignment}, modifier = ${composeStyle(node.style)}) {\n${children.map((c: IRNode) => emitNode(c, indent + 2)).join('\n')}\n${pad}}`;
    }
    case 'Stack': {
      const isRow = (node as any).axis === 'horizontal';
      const children = (node as any).children ?? [];
      if (isRow) {
        const gap = node.style?.layout?.gap ?? 0;
        const horizontalArrangement = mapJustifyToArrangement(node.style?.layout?.justifyContent);
        const verticalAlignment = mapAlignForRow(node.style?.layout?.alignItems);
        return `${pad}Row(horizontalArrangement = ${gap ? `Arrangement.spacedBy(${gap}.dp)` : horizontalArrangement}, verticalAlignment = ${verticalAlignment}, modifier = ${composeStyle(node.style)}) {\n${children.map((c: IRNode) => emitNode(c, indent + 2)).join('\n')}\n${pad}}`;
      } else {
        const gap = node.style?.layout?.gap ?? 0;
        const verticalArrangement = mapJustifyToArrangement(node.style?.layout?.justifyContent);
        const horizontalAlignment = mapAlignForColumn(node.style?.layout?.alignItems);
        return `${pad}Column(verticalArrangement = ${gap ? `Arrangement.spacedBy(${gap}.dp)` : verticalArrangement}, horizontalAlignment = ${horizontalAlignment}, modifier = ${composeStyle(node.style)}) {\n${children.map((c: IRNode) => emitNode(c, indent + 2)).join('\n')}\n${pad}}`;
      }
    }
    default:
      return `${pad}Spacer()`;
  }
}

export function generateCompose(root: IRRoot): string {
  const name = root.rootId.replace(/[^A-Za-z0-9_]/g, '_');
  const body = emitNode(root.tree, 4);
  return `import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import coil.compose.AsyncImage

@Composable
fun ${name}() {
    val context = LocalContext.current
${body}
}`;
}

// Glance widget generator for Android widgets
function glanceModifier(style?: any): string {
  let s = 'GlanceModifier';
  if (!style) return s;

  // Layout
  if (style.layout?.width) s += `.width(${style.layout.width}.dp)`;
  if (style.layout?.height) s += `.height(${style.layout.height}.dp)`;

  // Padding
  if (style.layout?.padding) {
    s += `.padding(${style.layout.padding}.dp)`;
  } else {
    if (style.layout?.paddingHorizontal)
      s += `.padding(horizontal = ${style.layout.paddingHorizontal}.dp)`;
    if (style.layout?.paddingVertical)
      s += `.padding(vertical = ${style.layout.paddingVertical}.dp)`;
  }

  // Background
  if (style.colors?.backgroundColor) {
    const bg = composeColorLiteral(style.colors.backgroundColor);
    if (bg) s += `.background(${bg})`;
  }

  // Corner radius
  if (style.borders?.borderRadius) {
    s += `.cornerRadius(${style.borders.borderRadius}.dp)`;
  }

  return s;
}

function emitGlanceNode(node: IRNode, indent = 2): string {
  const pad = ' '.repeat(indent);
  const action = (node as any).action;

  switch (node.type) {
    case 'Text': {
      const text = String((node as any).text);
      const fontSize = node.style?.typography?.fontSize
        ? `, style = TextStyle(fontSize = ${node.style.typography.fontSize}.sp)`
        : '';
      const color = node.style?.typography?.color
        ? composeColorLiteral(node.style.typography.color)
        : null;
      const colorPart = color ? `, style = TextStyle(color = ColorProvider(${color}))` : '';

      let result = `${pad}Text(text = "${text}", modifier = ${glanceModifier(node.style)}${colorPart}${fontSize})`;

      if (action?.type === 'deeplink' && action.url) {
        result = `${pad}Text(text = "${text}", modifier = ${glanceModifier(node.style)}.clickable(actionStartActivity<MainActivity>())${colorPart}${fontSize})`;
      }

      return result;
    }

    case 'Image': {
      const uri = (node as any).uri;
      // Note: Glance widgets don't support network images directly.
      // Images must be bundled as drawable resources or use content URIs.
      // For dynamic content, images should be downloaded and provided via FileProvider
      const imageProvider = uri.startsWith('http')
        ? 'ImageProvider(R.drawable.placeholder) // Network images require download & FileProvider'
        : 'ImageProvider(R.drawable.placeholder)';

      let result = `${pad}Image(provider = ${imageProvider}, contentDescription = "Image", modifier = ${glanceModifier(node.style)})`;

      if (action?.type === 'deeplink' && action.url) {
        result = `${pad}Image(provider = ${imageProvider}, contentDescription = "Image", modifier = ${glanceModifier(node.style)}.clickable(actionStartActivity<MainActivity>()))`;
      }

      return result;
    }

    case 'Button': {
      const label = (node as any).label;
      if (action?.type === 'deeplink' && action.url) {
        return `${pad}Button(text = "${label}", onClick = actionStartActivity<MainActivity>(), modifier = ${glanceModifier(node.style)})`;
      }
      return `${pad}Button(text = "${label}", onClick = actionRunCallback<RefreshAction>(), modifier = ${glanceModifier(node.style)})`;
    }

    case 'View':
    case 'Stack': {
      const children = (node as any).children ?? [];
      const isRow = node.type === 'Stack' && (node as any).axis === 'horizontal';
      const container = isRow ? 'Row' : 'Column';
      const gap = node.style?.layout?.gap ?? 0;

      if (!children.length) return `${pad}Spacer(modifier = ${glanceModifier(node.style)})`;

      const childrenCode = children.map((c: IRNode) => emitGlanceNode(c, indent + 2)).join('\n');
      return `${pad}${container}(modifier = ${glanceModifier(node.style)}) {\n${childrenCode}\n${pad}}`;
    }

    case 'Spacer': {
      return `${pad}Spacer(modifier = ${glanceModifier(node.style)})`;
    }

    case 'ProgressBar': {
      const progress = (node as any).progress ?? 0;
      const indeterminate = (node as any).indeterminate;
      if (indeterminate) {
        return `${pad}CircularProgressIndicator(modifier = ${glanceModifier(node.style)})`;
      }
      return `${pad}LinearProgressIndicator(progress = ${progress}f, modifier = ${glanceModifier(node.style)})`;
    }

    default:
      return `${pad}Spacer()`;
  }
}

export function generateGlanceWidget(root: IRRoot): string {
  const name = root.rootId.replace(/[^A-Za-z0-9_]/g, '_');
  const content = emitGlanceNode(root.tree, 4);

  return `package generated

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.Image
import androidx.glance.ImageProvider
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.graphics.Color

class ${name}Receiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = ${name}Widget()
}

class ${name}Widget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            ${name}Content()
        }
    }
}

@Composable
fun ${name}Content() {
${content}
}`;
}

export async function writeComposeFiles(roots: IRRoot[], androidDir: string, asWidget = false) {
  const outDir = path.join(androidDir, 'brik', 'src', 'main', 'java', 'generated');
  await fs.mkdirp(outDir);

  for (const r of roots) {
    const isWidget = asWidget || !!(r as any).widget;

    if (isWidget) {
      // Generate Glance widget code
      const glanceContent = generateGlanceWidget(r);
      const file = path.join(outDir, `${r.rootId.replace(/[^A-Za-z0-9_]/g, '_')}.kt`);
      await fs.writeFile(file, glanceContent, 'utf8');
    } else {
      // Generate standard Compose UI for app usage
      const content = generateCompose(r);
      const file = path.join(outDir, `${r.rootId.replace(/[^A-Za-z0-9_]/g, '_')}.kt`);
      await fs.writeFile(file, content, 'utf8');
    }
  }
}
