import { z } from 'zod';

export const AxisSchema = z.union([z.literal('horizontal'), z.literal('vertical')]);

export const LayoutStyleSchema = z.object({
  flexDirection: z.union([z.literal('row'), z.literal('column')]).optional(),
  alignItems: z.string().optional(),
  justifyContent: z.string().optional(),
  gap: z.number().optional(),
  padding: z.number().optional(),
  paddingHorizontal: z.number().optional(),
  paddingVertical: z.number().optional(),
  paddingTop: z.number().optional(),
  paddingRight: z.number().optional(),
  paddingBottom: z.number().optional(),
  paddingLeft: z.number().optional(),
  margin: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  minWidth: z.number().optional(),
  minHeight: z.number().optional(),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
});

export const TypographyStyleSchema = z.object({
  fontSize: z.number().optional(),
  fontWeight: z.union([z.literal('400'), z.literal('500'), z.literal('700')]).optional(),
  color: z.string().optional(),
  numberOfLines: z.number().optional(),
  ellipsizeMode: z.union([z.literal('head'), z.literal('middle'), z.literal('tail')]).optional(),
});

export const ColorStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  opacity: z.number().optional(),
});

export const BorderStyleSchema = z.object({
  borderRadius: z.number().optional(),
});

export const NormalizedStyleSchema = z.object({
  layout: LayoutStyleSchema.optional(),
  typography: TypographyStyleSchema.optional(),
  colors: ColorStyleSchema.optional(),
  borders: BorderStyleSchema.optional(),
});

export const AccessibilitySchema = z.object({
  accessibilityLabel: z.string().optional(),
  accessible: z.boolean().optional(),
  role: z.string().optional(),
});

export const BaseNodeSchema = z.object({
  type: z.union([
    z.literal('View'),
    z.literal('Text'),
    z.literal('Button'),
    z.literal('Image'),
    z.literal('Stack'),
  ]),
  key: z.string().optional(),
  style: NormalizedStyleSchema.optional(),
  accessibility: AccessibilitySchema.optional(),
});

export const ViewNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('View'),
  children: z.array(z.lazy(() => NodeSchema)).optional(),
});

export const TextNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('Text'),
  text: z.union([z.string(), z.number()]).default(''),
});

export const ButtonNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('Button'),
  label: z.string(),
  onPressId: z.string().optional(),
});

export const ImageNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('Image'),
  uri: z.string(),
  resizeMode: z.union([z.literal('cover'), z.literal('contain')]).optional(),
});

export const StackNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('Stack'),
  axis: AxisSchema,
  children: z.array(z.lazy(() => NodeSchema)).default([]),
});

export const NodeSchema: z.ZodType<any> = z.union([
  ViewNodeSchema,
  TextNodeSchema,
  ButtonNodeSchema,
  ImageNodeSchema,
  StackNodeSchema,
]);

export const RootSchema = z.object({
  version: z.literal(1),
  rootId: z.string(),
  tree: NodeSchema,
  widget: z
    .object({
      kind: z.string(),
      sizes: z.array(z.union([z.literal('small'), z.literal('medium'), z.literal('large')])).min(1),
    })
    .optional(),
});

export type Axis = z.infer<typeof AxisSchema>;
export type NormalizedStyle = z.infer<typeof NormalizedStyleSchema>;
export type Accessibility = z.infer<typeof AccessibilitySchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Root = z.infer<typeof RootSchema>;
export type WidgetMeta = NonNullable<Root['widget']>;
