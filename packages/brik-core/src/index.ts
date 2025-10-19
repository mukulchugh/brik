import {
    NodeSchema,
    RootSchema,
    type Accessibility,
    type Node,
    type NormalizedStyle,
    type Root,
} from '@brik/schemas';

export type { Accessibility, Node, NormalizedStyle, Root };

export const validateRoot = (data: unknown): Root => {
  const parsed = RootSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid IR Root:\n${message}`);
  }
  return parsed.data;
};

export const validateNode = (node: unknown): Node => {
  const parsed = NodeSchema.safeParse(node);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid IR Node:\n${message}`);
  }
  return parsed.data;
};

export interface Diagnostic {
  code: string;
  message: string;
  filePath?: string;
  loc?: { line: number; column: number };
  severity: 'error' | 'warning' | 'info';
}

export class BrikError extends Error {
  public diagnostic?: Diagnostic;
  constructor(message: string, diagnostic?: Diagnostic) {
    super(message);
    this.name = 'BrikError';
    this.diagnostic = diagnostic;
  }
}

export const BRIK_DIR = '.brik';

// Style normalization function - converts React Native styles to IR normalized format
export function normalizeStyle(style?: Record<string, any>): NormalizedStyle {
  if (!style) return {};

  const normalized: NormalizedStyle = {};
  const layout: any = {};
  const typography: any = {};
  const colors: any = {};
  const borders: any = {};
  const shadows: any = {};

  for (const [key, value] of Object.entries(style)) {
    // Layout properties
    if (['padding', 'paddingHorizontal', 'paddingVertical', 'paddingTop', 'paddingRight',
         'paddingBottom', 'paddingLeft', 'margin', 'marginHorizontal', 'marginVertical',
         'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'flex', 'flexGrow',
         'flexShrink', 'flexBasis', 'flexDirection', 'alignItems', 'justifyContent',
         'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'].includes(key)) {
      layout[key] = value;
    }
    // Typography properties
    else if (['fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'color', 'lineHeight',
              'letterSpacing', 'textAlign', 'textTransform'].includes(key)) {
      typography[key] = value;
    }
    // Color properties
    else if (['backgroundColor', 'borderColor', 'tintColor'].includes(key)) {
      colors[key] = value;
    }
    // Border properties
    else if (['borderRadius', 'borderWidth', 'borderTopWidth', 'borderRightWidth',
              'borderBottomWidth', 'borderLeftWidth'].includes(key)) {
      borders[key] = value;
    }
    // Shadow properties
    else if (['shadowColor', 'shadowOpacity', 'shadowRadius', 'elevation'].includes(key)) {
      shadows[key] = value;
    } else if (key === 'shadowOffset' && typeof value === 'object') {
      shadows.shadowOffsetX = value.width || 0;
      shadows.shadowOffsetY = value.height || 0;
    }
  }

  if (Object.keys(layout).length > 0) normalized.layout = layout;
  if (Object.keys(typography).length > 0) normalized.typography = typography;
  if (Object.keys(colors).length > 0) normalized.colors = colors;
  if (Object.keys(borders).length > 0) normalized.borders = borders;
  if (Object.keys(shadows).length > 0) normalized.shadows = shadows;

  return normalized;
}

// v0.3.0 Enhanced Error Handling
export * from './errors';






