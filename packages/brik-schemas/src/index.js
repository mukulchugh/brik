"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootSchema = exports.NodeSchema = exports.StackNodeSchema = exports.ImageNodeSchema = exports.ButtonNodeSchema = exports.TextNodeSchema = exports.ViewNodeSchema = exports.BaseNodeSchema = exports.AccessibilitySchema = exports.NormalizedStyleSchema = exports.BorderStyleSchema = exports.ColorStyleSchema = exports.TypographyStyleSchema = exports.LayoutStyleSchema = exports.AxisSchema = void 0;
const zod_1 = require("zod");
exports.AxisSchema = zod_1.z.union([zod_1.z.literal('horizontal'), zod_1.z.literal('vertical')]);
exports.LayoutStyleSchema = zod_1.z.object({
    flexDirection: zod_1.z.union([zod_1.z.literal('row'), zod_1.z.literal('column')]).optional(),
    alignItems: zod_1.z.string().optional(),
    justifyContent: zod_1.z.string().optional(),
    gap: zod_1.z.number().optional(),
    padding: zod_1.z.number().optional(),
    paddingHorizontal: zod_1.z.number().optional(),
    paddingVertical: zod_1.z.number().optional(),
    paddingTop: zod_1.z.number().optional(),
    paddingRight: zod_1.z.number().optional(),
    paddingBottom: zod_1.z.number().optional(),
    paddingLeft: zod_1.z.number().optional(),
    margin: zod_1.z.number().optional(),
    width: zod_1.z.number().optional(),
    height: zod_1.z.number().optional(),
    minWidth: zod_1.z.number().optional(),
    minHeight: zod_1.z.number().optional(),
    maxWidth: zod_1.z.number().optional(),
    maxHeight: zod_1.z.number().optional(),
});
exports.TypographyStyleSchema = zod_1.z.object({
    fontSize: zod_1.z.number().optional(),
    fontWeight: zod_1.z.union([zod_1.z.literal('400'), zod_1.z.literal('500'), zod_1.z.literal('700')]).optional(),
    color: zod_1.z.string().optional(),
    numberOfLines: zod_1.z.number().optional(),
    ellipsizeMode: zod_1.z.union([zod_1.z.literal('head'), zod_1.z.literal('middle'), zod_1.z.literal('tail')]).optional(),
});
exports.ColorStyleSchema = zod_1.z.object({
    backgroundColor: zod_1.z.string().optional(),
    opacity: zod_1.z.number().optional(),
});
exports.BorderStyleSchema = zod_1.z.object({
    borderRadius: zod_1.z.number().optional(),
});
exports.NormalizedStyleSchema = zod_1.z.object({
    layout: exports.LayoutStyleSchema.optional(),
    typography: exports.TypographyStyleSchema.optional(),
    colors: exports.ColorStyleSchema.optional(),
    borders: exports.BorderStyleSchema.optional(),
});
exports.AccessibilitySchema = zod_1.z.object({
    accessibilityLabel: zod_1.z.string().optional(),
    accessible: zod_1.z.boolean().optional(),
    role: zod_1.z.string().optional(),
});
exports.BaseNodeSchema = zod_1.z.object({
    type: zod_1.z.union([
        zod_1.z.literal('View'),
        zod_1.z.literal('Text'),
        zod_1.z.literal('Button'),
        zod_1.z.literal('Image'),
        zod_1.z.literal('Stack'),
    ]),
    key: zod_1.z.string().optional(),
    style: exports.NormalizedStyleSchema.optional(),
    accessibility: exports.AccessibilitySchema.optional(),
});
exports.ViewNodeSchema = exports.BaseNodeSchema.extend({
    type: zod_1.z.literal('View'),
    children: zod_1.z.array(zod_1.z.lazy(() => exports.NodeSchema)).optional(),
});
exports.TextNodeSchema = exports.BaseNodeSchema.extend({
    type: zod_1.z.literal('Text'),
    text: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).default(''),
});
exports.ButtonNodeSchema = exports.BaseNodeSchema.extend({
    type: zod_1.z.literal('Button'),
    label: zod_1.z.string(),
    onPressId: zod_1.z.string().optional(),
});
exports.ImageNodeSchema = exports.BaseNodeSchema.extend({
    type: zod_1.z.literal('Image'),
    uri: zod_1.z.string(),
    resizeMode: zod_1.z.union([zod_1.z.literal('cover'), zod_1.z.literal('contain')]).optional(),
});
exports.StackNodeSchema = exports.BaseNodeSchema.extend({
    type: zod_1.z.literal('Stack'),
    axis: exports.AxisSchema,
    children: zod_1.z.array(zod_1.z.lazy(() => exports.NodeSchema)).default([]),
});
exports.NodeSchema = zod_1.z.union([
    exports.ViewNodeSchema,
    exports.TextNodeSchema,
    exports.ButtonNodeSchema,
    exports.ImageNodeSchema,
    exports.StackNodeSchema,
]);
exports.RootSchema = zod_1.z.object({
    version: zod_1.z.literal(1),
    rootId: zod_1.z.string(),
    tree: exports.NodeSchema,
});
//# sourceMappingURL=index.js.map