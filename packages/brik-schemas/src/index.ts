import { z } from 'zod';

// Core enums
export const AxisSchema = z.union([z.literal('horizontal'), z.literal('vertical')]);

// Action schemas for interactivity
export const ActionSchema = z.object({
  type: z.union([
    z.literal('deeplink'),
    z.literal('openApp'),
    z.literal('refresh'),
    z.literal('custom'),
  ]),
  url: z.string().optional(),
  params: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  appId: z.string().optional(), // For openApp on Android
});

// Data binding for dynamic content
export const DataBindingSchema = z.object({
  source: z.union([z.literal('local'), z.literal('remote'), z.literal('shared')]),
  key: z.string(),
  fallback: z.any().optional(),
  transform: z.string().optional(), // JS expression to transform data
});

// Timeline for widget updates
export const TimelineEntrySchema = z.object({
  date: z.string(), // ISO date string
  relevance: z.number().optional(), // 0-1 score for Smart Stack ranking
  content: z.any(), // Dynamic content for this entry
});

export const TimelinePolicySchema = z.union([
  z.literal('atEnd'),
  z.literal('never'),
  z.literal('after15Minutes'),
  z.literal('afterHour'),
  z.literal('afterDay'),
  z.object({
    type: z.literal('custom'),
    minutes: z.number(),
  }),
]);

export const TimelineSchema = z.object({
  entries: z.array(TimelineEntrySchema),
  policy: TimelinePolicySchema,
});

// Layout styles with complete mapping
export const LayoutStyleSchema = z.object({
  flexDirection: z.union([z.literal('row'), z.literal('column')]).optional(),
  alignItems: z
    .union([
      z.literal('flex-start'),
      z.literal('flex-end'),
      z.literal('center'),
      z.literal('stretch'),
      z.literal('baseline'),
    ])
    .optional(),
  justifyContent: z
    .union([
      z.literal('flex-start'),
      z.literal('flex-end'),
      z.literal('center'),
      z.literal('space-between'),
      z.literal('space-around'),
      z.literal('space-evenly'),
    ])
    .optional(),
  gap: z.number().optional(),
  padding: z.number().optional(),
  paddingHorizontal: z.number().optional(),
  paddingVertical: z.number().optional(),
  paddingTop: z.number().optional(),
  paddingRight: z.number().optional(),
  paddingBottom: z.number().optional(),
  paddingLeft: z.number().optional(),
  margin: z.number().optional(),
  marginHorizontal: z.number().optional(),
  marginVertical: z.number().optional(),
  marginTop: z.number().optional(),
  marginRight: z.number().optional(),
  marginBottom: z.number().optional(),
  marginLeft: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  minWidth: z.number().optional(),
  minHeight: z.number().optional(),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
  flex: z.number().optional(),
  flexGrow: z.number().optional(),
  flexShrink: z.number().optional(),
  flexBasis: z.number().optional(),
  position: z.union([z.literal('relative'), z.literal('absolute')]).optional(),
  top: z.number().optional(),
  right: z.number().optional(),
  bottom: z.number().optional(),
  left: z.number().optional(),
  aspectRatio: z.number().optional(),
  zIndex: z.number().optional(),
});

export const TypographyStyleSchema = z.object({
  fontSize: z.number().optional(),
  fontWeight: z.union([
    z.literal('100'), z.literal('200'), z.literal('300'), z.literal('400'),
    z.literal('500'), z.literal('600'), z.literal('700'), z.literal('800'), z.literal('900'),
    z.literal('normal'), z.literal('bold')
  ]).optional(),
  fontFamily: z.string().optional(),
  fontStyle: z.union([z.literal('normal'), z.literal('italic')]).optional(),
  color: z.string().optional(),
  numberOfLines: z.number().optional(),
  ellipsizeMode: z
    .union([z.literal('head'), z.literal('middle'), z.literal('tail'), z.literal('clip')])
    .optional(),
  textAlign: z
    .union([z.literal('left'), z.literal('center'), z.literal('right'), z.literal('justify')])
    .optional(),
  textTransform: z
    .union([
      z.literal('none'),
      z.literal('uppercase'),
      z.literal('lowercase'),
      z.literal('capitalize'),
    ])
    .optional(),
  lineHeight: z.number().optional(),
  letterSpacing: z.number().optional(),
});

export const ColorStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  opacity: z.number().optional(),
  tintColor: z.string().optional(), // For images
});

export const BorderStyleSchema = z.object({
  borderRadius: z.number().optional(),
  borderTopLeftRadius: z.number().optional(),
  borderTopRightRadius: z.number().optional(),
  borderBottomLeftRadius: z.number().optional(),
  borderBottomRightRadius: z.number().optional(),
  borderWidth: z.number().optional(),
  borderColor: z.string().optional(),
  borderStyle: z.union([z.literal('solid'), z.literal('dashed'), z.literal('dotted')]).optional(),
});

export const ShadowStyleSchema = z.object({
  shadowColor: z.string().optional(),
  shadowOpacity: z.number().optional(),
  shadowRadius: z.number().optional(),
  shadowOffsetX: z.number().optional(),
  shadowOffsetY: z.number().optional(),
  elevation: z.number().optional(), // Android
});

export const NormalizedStyleSchema = z.object({
  layout: LayoutStyleSchema.optional(),
  typography: TypographyStyleSchema.optional(),
  colors: ColorStyleSchema.optional(),
  borders: BorderStyleSchema.optional(),
  shadows: ShadowStyleSchema.optional(),
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
    z.literal('Spacer'),
    z.literal('ProgressBar'),
    z.literal('List'),
  ]),
  key: z.string().optional(),
  style: NormalizedStyleSchema.optional(),
  accessibility: AccessibilitySchema.optional(),
  action: ActionSchema.optional(),
  dataBinding: DataBindingSchema.optional(),
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
  variant: z.union([z.literal('primary'), z.literal('secondary'), z.literal('ghost')]).optional(),
  size: z.union([z.literal('small'), z.literal('medium'), z.literal('large')]).optional(),
});

export const ImageNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('Image'),
  uri: z.string(),
  resizeMode: z
    .union([
      z.literal('cover'),
      z.literal('contain'),
      z.literal('fill'),
      z.literal('scale-down'),
      z.literal('none'),
    ])
    .optional(),
  placeholder: z.string().optional(), // Base64 or URL for placeholder
});

export const StackNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('Stack'),
  axis: AxisSchema,
  children: z.array(z.lazy(() => NodeSchema)).default([]),
});

export const SpacerNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('Spacer'),
  flex: z.number().optional(), // Flex weight for spacer
});

export const ProgressBarNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('ProgressBar'),
  progress: z.number().min(0).max(1), // 0-1 value
  indeterminate: z.boolean().optional(),
});

export const ListNodeSchema: z.ZodType<any> = BaseNodeSchema.extend({
  type: z.literal('List'),
  items: z.array(z.any()), // Data for list items
  renderItem: z.string(), // Template ID or inline template
  horizontal: z.boolean().optional(),
});

export const NodeSchema: z.ZodType<any> = z.union([
  ViewNodeSchema,
  TextNodeSchema,
  ButtonNodeSchema,
  ImageNodeSchema,
  StackNodeSchema,
  SpacerNodeSchema,
  ProgressBarNodeSchema,
  ListNodeSchema,
]);

// Widget configuration
export const WidgetFamilySchema = z.union([
  // iOS families
  z.literal('systemSmall'),
  z.literal('systemMedium'),
  z.literal('systemLarge'),
  z.literal('systemExtraLarge'),
  z.literal('accessoryRectangular'),
  z.literal('accessoryCircular'),
  z.literal('accessoryInline'),
  // Android sizes
  z.literal('small'),
  z.literal('medium'),
  z.literal('large'),
]);

export const WidgetMetadataSchema = z.object({
  kind: z.string(), // Widget identifier
  displayName: z.string().optional(),
  description: z.string().optional(),
  families: z.array(WidgetFamilySchema).min(1),
  supportedPlatforms: z
    .array(z.union([z.literal('ios'), z.literal('android'), z.literal('watchos')]))
    .optional(),
  configurable: z.boolean().optional(), // User can configure widget
  timeline: TimelineSchema.optional(),
});

// Live Activity configuration
export const ActivityRegionSchema = z.object({
  lockScreen: NodeSchema.optional(),
  dynamicIsland: z
    .object({
      compact: NodeSchema.optional(),
      expanded: NodeSchema.optional(),
      minimal: NodeSchema.optional(),
    })
    .optional(),
});

export const LiveActivitySchema = z.object({
  activityType: z.string(), // Activity identifier
  attributes: z.object({
    static: z.record(z.any()), // Static attributes (don't change)
    dynamic: z.record(z.any()), // Dynamic attributes (can update)
  }),
  regions: ActivityRegionSchema,
  staleDate: z.string().optional(), // ISO date when activity becomes stale
  relevanceScore: z.number().optional(), // For sorting multiple activities
});

export const RootSchema = z.object({
  version: z.literal(1),
  rootId: z.string(),
  tree: NodeSchema,
  widget: WidgetMetadataSchema.optional(),
  liveActivity: LiveActivitySchema.optional(),
  dataProvider: z
    .object({
      endpoint: z.string().optional(),
      refreshInterval: z.number().optional(), // Minutes
      headers: z.record(z.string()).optional(),
    })
    .optional(),
});

// Type exports
export type Axis = z.infer<typeof AxisSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type DataBinding = z.infer<typeof DataBindingSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;
export type TimelinePolicy = z.infer<typeof TimelinePolicySchema>;
export type NormalizedStyle = z.infer<typeof NormalizedStyleSchema>;
export type Accessibility = z.infer<typeof AccessibilitySchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Root = z.infer<typeof RootSchema>;
export type WidgetMetadata = z.infer<typeof WidgetMetadataSchema>;
export type WidgetFamily = z.infer<typeof WidgetFamilySchema>;
export type LiveActivity = z.infer<typeof LiveActivitySchema>;
export type ActivityRegion = z.infer<typeof ActivityRegionSchema>;
