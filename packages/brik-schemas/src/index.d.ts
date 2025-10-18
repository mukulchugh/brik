import { z } from 'zod';
export declare const AxisSchema: z.ZodUnion<[z.ZodLiteral<"horizontal">, z.ZodLiteral<"vertical">]>;
export declare const LayoutStyleSchema: z.ZodObject<{
    flexDirection: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"row">, z.ZodLiteral<"column">]>>;
    alignItems: z.ZodOptional<z.ZodString>;
    justifyContent: z.ZodOptional<z.ZodString>;
    gap: z.ZodOptional<z.ZodNumber>;
    padding: z.ZodOptional<z.ZodNumber>;
    paddingHorizontal: z.ZodOptional<z.ZodNumber>;
    paddingVertical: z.ZodOptional<z.ZodNumber>;
    paddingTop: z.ZodOptional<z.ZodNumber>;
    paddingRight: z.ZodOptional<z.ZodNumber>;
    paddingBottom: z.ZodOptional<z.ZodNumber>;
    paddingLeft: z.ZodOptional<z.ZodNumber>;
    margin: z.ZodOptional<z.ZodNumber>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    minWidth: z.ZodOptional<z.ZodNumber>;
    minHeight: z.ZodOptional<z.ZodNumber>;
    maxWidth: z.ZodOptional<z.ZodNumber>;
    maxHeight: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    flexDirection?: "row" | "column" | undefined;
    alignItems?: string | undefined;
    justifyContent?: string | undefined;
    gap?: number | undefined;
    padding?: number | undefined;
    paddingHorizontal?: number | undefined;
    paddingVertical?: number | undefined;
    paddingTop?: number | undefined;
    paddingRight?: number | undefined;
    paddingBottom?: number | undefined;
    paddingLeft?: number | undefined;
    margin?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    minWidth?: number | undefined;
    minHeight?: number | undefined;
    maxWidth?: number | undefined;
    maxHeight?: number | undefined;
}, {
    flexDirection?: "row" | "column" | undefined;
    alignItems?: string | undefined;
    justifyContent?: string | undefined;
    gap?: number | undefined;
    padding?: number | undefined;
    paddingHorizontal?: number | undefined;
    paddingVertical?: number | undefined;
    paddingTop?: number | undefined;
    paddingRight?: number | undefined;
    paddingBottom?: number | undefined;
    paddingLeft?: number | undefined;
    margin?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    minWidth?: number | undefined;
    minHeight?: number | undefined;
    maxWidth?: number | undefined;
    maxHeight?: number | undefined;
}>;
export declare const TypographyStyleSchema: z.ZodObject<{
    fontSize: z.ZodOptional<z.ZodNumber>;
    fontWeight: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"400">, z.ZodLiteral<"500">, z.ZodLiteral<"700">]>>;
    color: z.ZodOptional<z.ZodString>;
    numberOfLines: z.ZodOptional<z.ZodNumber>;
    ellipsizeMode: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"head">, z.ZodLiteral<"middle">, z.ZodLiteral<"tail">]>>;
}, "strip", z.ZodTypeAny, {
    fontSize?: number | undefined;
    fontWeight?: "400" | "500" | "700" | undefined;
    color?: string | undefined;
    numberOfLines?: number | undefined;
    ellipsizeMode?: "head" | "middle" | "tail" | undefined;
}, {
    fontSize?: number | undefined;
    fontWeight?: "400" | "500" | "700" | undefined;
    color?: string | undefined;
    numberOfLines?: number | undefined;
    ellipsizeMode?: "head" | "middle" | "tail" | undefined;
}>;
export declare const ColorStyleSchema: z.ZodObject<{
    backgroundColor: z.ZodOptional<z.ZodString>;
    opacity: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    backgroundColor?: string | undefined;
    opacity?: number | undefined;
}, {
    backgroundColor?: string | undefined;
    opacity?: number | undefined;
}>;
export declare const BorderStyleSchema: z.ZodObject<{
    borderRadius: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    borderRadius?: number | undefined;
}, {
    borderRadius?: number | undefined;
}>;
export declare const NormalizedStyleSchema: z.ZodObject<{
    layout: z.ZodOptional<z.ZodObject<{
        flexDirection: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"row">, z.ZodLiteral<"column">]>>;
        alignItems: z.ZodOptional<z.ZodString>;
        justifyContent: z.ZodOptional<z.ZodString>;
        gap: z.ZodOptional<z.ZodNumber>;
        padding: z.ZodOptional<z.ZodNumber>;
        paddingHorizontal: z.ZodOptional<z.ZodNumber>;
        paddingVertical: z.ZodOptional<z.ZodNumber>;
        paddingTop: z.ZodOptional<z.ZodNumber>;
        paddingRight: z.ZodOptional<z.ZodNumber>;
        paddingBottom: z.ZodOptional<z.ZodNumber>;
        paddingLeft: z.ZodOptional<z.ZodNumber>;
        margin: z.ZodOptional<z.ZodNumber>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        minWidth: z.ZodOptional<z.ZodNumber>;
        minHeight: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
        maxHeight: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        flexDirection?: "row" | "column" | undefined;
        alignItems?: string | undefined;
        justifyContent?: string | undefined;
        gap?: number | undefined;
        padding?: number | undefined;
        paddingHorizontal?: number | undefined;
        paddingVertical?: number | undefined;
        paddingTop?: number | undefined;
        paddingRight?: number | undefined;
        paddingBottom?: number | undefined;
        paddingLeft?: number | undefined;
        margin?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        minWidth?: number | undefined;
        minHeight?: number | undefined;
        maxWidth?: number | undefined;
        maxHeight?: number | undefined;
    }, {
        flexDirection?: "row" | "column" | undefined;
        alignItems?: string | undefined;
        justifyContent?: string | undefined;
        gap?: number | undefined;
        padding?: number | undefined;
        paddingHorizontal?: number | undefined;
        paddingVertical?: number | undefined;
        paddingTop?: number | undefined;
        paddingRight?: number | undefined;
        paddingBottom?: number | undefined;
        paddingLeft?: number | undefined;
        margin?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        minWidth?: number | undefined;
        minHeight?: number | undefined;
        maxWidth?: number | undefined;
        maxHeight?: number | undefined;
    }>>;
    typography: z.ZodOptional<z.ZodObject<{
        fontSize: z.ZodOptional<z.ZodNumber>;
        fontWeight: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"400">, z.ZodLiteral<"500">, z.ZodLiteral<"700">]>>;
        color: z.ZodOptional<z.ZodString>;
        numberOfLines: z.ZodOptional<z.ZodNumber>;
        ellipsizeMode: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"head">, z.ZodLiteral<"middle">, z.ZodLiteral<"tail">]>>;
    }, "strip", z.ZodTypeAny, {
        fontSize?: number | undefined;
        fontWeight?: "400" | "500" | "700" | undefined;
        color?: string | undefined;
        numberOfLines?: number | undefined;
        ellipsizeMode?: "head" | "middle" | "tail" | undefined;
    }, {
        fontSize?: number | undefined;
        fontWeight?: "400" | "500" | "700" | undefined;
        color?: string | undefined;
        numberOfLines?: number | undefined;
        ellipsizeMode?: "head" | "middle" | "tail" | undefined;
    }>>;
    colors: z.ZodOptional<z.ZodObject<{
        backgroundColor: z.ZodOptional<z.ZodString>;
        opacity: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        backgroundColor?: string | undefined;
        opacity?: number | undefined;
    }, {
        backgroundColor?: string | undefined;
        opacity?: number | undefined;
    }>>;
    borders: z.ZodOptional<z.ZodObject<{
        borderRadius: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        borderRadius?: number | undefined;
    }, {
        borderRadius?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    layout?: {
        flexDirection?: "row" | "column" | undefined;
        alignItems?: string | undefined;
        justifyContent?: string | undefined;
        gap?: number | undefined;
        padding?: number | undefined;
        paddingHorizontal?: number | undefined;
        paddingVertical?: number | undefined;
        paddingTop?: number | undefined;
        paddingRight?: number | undefined;
        paddingBottom?: number | undefined;
        paddingLeft?: number | undefined;
        margin?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        minWidth?: number | undefined;
        minHeight?: number | undefined;
        maxWidth?: number | undefined;
        maxHeight?: number | undefined;
    } | undefined;
    typography?: {
        fontSize?: number | undefined;
        fontWeight?: "400" | "500" | "700" | undefined;
        color?: string | undefined;
        numberOfLines?: number | undefined;
        ellipsizeMode?: "head" | "middle" | "tail" | undefined;
    } | undefined;
    colors?: {
        backgroundColor?: string | undefined;
        opacity?: number | undefined;
    } | undefined;
    borders?: {
        borderRadius?: number | undefined;
    } | undefined;
}, {
    layout?: {
        flexDirection?: "row" | "column" | undefined;
        alignItems?: string | undefined;
        justifyContent?: string | undefined;
        gap?: number | undefined;
        padding?: number | undefined;
        paddingHorizontal?: number | undefined;
        paddingVertical?: number | undefined;
        paddingTop?: number | undefined;
        paddingRight?: number | undefined;
        paddingBottom?: number | undefined;
        paddingLeft?: number | undefined;
        margin?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        minWidth?: number | undefined;
        minHeight?: number | undefined;
        maxWidth?: number | undefined;
        maxHeight?: number | undefined;
    } | undefined;
    typography?: {
        fontSize?: number | undefined;
        fontWeight?: "400" | "500" | "700" | undefined;
        color?: string | undefined;
        numberOfLines?: number | undefined;
        ellipsizeMode?: "head" | "middle" | "tail" | undefined;
    } | undefined;
    colors?: {
        backgroundColor?: string | undefined;
        opacity?: number | undefined;
    } | undefined;
    borders?: {
        borderRadius?: number | undefined;
    } | undefined;
}>;
export declare const AccessibilitySchema: z.ZodObject<{
    accessibilityLabel: z.ZodOptional<z.ZodString>;
    accessible: z.ZodOptional<z.ZodBoolean>;
    role: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accessibilityLabel?: string | undefined;
    accessible?: boolean | undefined;
    role?: string | undefined;
}, {
    accessibilityLabel?: string | undefined;
    accessible?: boolean | undefined;
    role?: string | undefined;
}>;
export declare const BaseNodeSchema: z.ZodObject<{
    type: z.ZodUnion<[z.ZodLiteral<"View">, z.ZodLiteral<"Text">, z.ZodLiteral<"Button">, z.ZodLiteral<"Image">, z.ZodLiteral<"Stack">]>;
    key: z.ZodOptional<z.ZodString>;
    style: z.ZodOptional<z.ZodObject<{
        layout: z.ZodOptional<z.ZodObject<{
            flexDirection: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"row">, z.ZodLiteral<"column">]>>;
            alignItems: z.ZodOptional<z.ZodString>;
            justifyContent: z.ZodOptional<z.ZodString>;
            gap: z.ZodOptional<z.ZodNumber>;
            padding: z.ZodOptional<z.ZodNumber>;
            paddingHorizontal: z.ZodOptional<z.ZodNumber>;
            paddingVertical: z.ZodOptional<z.ZodNumber>;
            paddingTop: z.ZodOptional<z.ZodNumber>;
            paddingRight: z.ZodOptional<z.ZodNumber>;
            paddingBottom: z.ZodOptional<z.ZodNumber>;
            paddingLeft: z.ZodOptional<z.ZodNumber>;
            margin: z.ZodOptional<z.ZodNumber>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
            minWidth: z.ZodOptional<z.ZodNumber>;
            minHeight: z.ZodOptional<z.ZodNumber>;
            maxWidth: z.ZodOptional<z.ZodNumber>;
            maxHeight: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            flexDirection?: "row" | "column" | undefined;
            alignItems?: string | undefined;
            justifyContent?: string | undefined;
            gap?: number | undefined;
            padding?: number | undefined;
            paddingHorizontal?: number | undefined;
            paddingVertical?: number | undefined;
            paddingTop?: number | undefined;
            paddingRight?: number | undefined;
            paddingBottom?: number | undefined;
            paddingLeft?: number | undefined;
            margin?: number | undefined;
            width?: number | undefined;
            height?: number | undefined;
            minWidth?: number | undefined;
            minHeight?: number | undefined;
            maxWidth?: number | undefined;
            maxHeight?: number | undefined;
        }, {
            flexDirection?: "row" | "column" | undefined;
            alignItems?: string | undefined;
            justifyContent?: string | undefined;
            gap?: number | undefined;
            padding?: number | undefined;
            paddingHorizontal?: number | undefined;
            paddingVertical?: number | undefined;
            paddingTop?: number | undefined;
            paddingRight?: number | undefined;
            paddingBottom?: number | undefined;
            paddingLeft?: number | undefined;
            margin?: number | undefined;
            width?: number | undefined;
            height?: number | undefined;
            minWidth?: number | undefined;
            minHeight?: number | undefined;
            maxWidth?: number | undefined;
            maxHeight?: number | undefined;
        }>>;
        typography: z.ZodOptional<z.ZodObject<{
            fontSize: z.ZodOptional<z.ZodNumber>;
            fontWeight: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"400">, z.ZodLiteral<"500">, z.ZodLiteral<"700">]>>;
            color: z.ZodOptional<z.ZodString>;
            numberOfLines: z.ZodOptional<z.ZodNumber>;
            ellipsizeMode: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"head">, z.ZodLiteral<"middle">, z.ZodLiteral<"tail">]>>;
        }, "strip", z.ZodTypeAny, {
            fontSize?: number | undefined;
            fontWeight?: "400" | "500" | "700" | undefined;
            color?: string | undefined;
            numberOfLines?: number | undefined;
            ellipsizeMode?: "head" | "middle" | "tail" | undefined;
        }, {
            fontSize?: number | undefined;
            fontWeight?: "400" | "500" | "700" | undefined;
            color?: string | undefined;
            numberOfLines?: number | undefined;
            ellipsizeMode?: "head" | "middle" | "tail" | undefined;
        }>>;
        colors: z.ZodOptional<z.ZodObject<{
            backgroundColor: z.ZodOptional<z.ZodString>;
            opacity: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            backgroundColor?: string | undefined;
            opacity?: number | undefined;
        }, {
            backgroundColor?: string | undefined;
            opacity?: number | undefined;
        }>>;
        borders: z.ZodOptional<z.ZodObject<{
            borderRadius: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            borderRadius?: number | undefined;
        }, {
            borderRadius?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        layout?: {
            flexDirection?: "row" | "column" | undefined;
            alignItems?: string | undefined;
            justifyContent?: string | undefined;
            gap?: number | undefined;
            padding?: number | undefined;
            paddingHorizontal?: number | undefined;
            paddingVertical?: number | undefined;
            paddingTop?: number | undefined;
            paddingRight?: number | undefined;
            paddingBottom?: number | undefined;
            paddingLeft?: number | undefined;
            margin?: number | undefined;
            width?: number | undefined;
            height?: number | undefined;
            minWidth?: number | undefined;
            minHeight?: number | undefined;
            maxWidth?: number | undefined;
            maxHeight?: number | undefined;
        } | undefined;
        typography?: {
            fontSize?: number | undefined;
            fontWeight?: "400" | "500" | "700" | undefined;
            color?: string | undefined;
            numberOfLines?: number | undefined;
            ellipsizeMode?: "head" | "middle" | "tail" | undefined;
        } | undefined;
        colors?: {
            backgroundColor?: string | undefined;
            opacity?: number | undefined;
        } | undefined;
        borders?: {
            borderRadius?: number | undefined;
        } | undefined;
    }, {
        layout?: {
            flexDirection?: "row" | "column" | undefined;
            alignItems?: string | undefined;
            justifyContent?: string | undefined;
            gap?: number | undefined;
            padding?: number | undefined;
            paddingHorizontal?: number | undefined;
            paddingVertical?: number | undefined;
            paddingTop?: number | undefined;
            paddingRight?: number | undefined;
            paddingBottom?: number | undefined;
            paddingLeft?: number | undefined;
            margin?: number | undefined;
            width?: number | undefined;
            height?: number | undefined;
            minWidth?: number | undefined;
            minHeight?: number | undefined;
            maxWidth?: number | undefined;
            maxHeight?: number | undefined;
        } | undefined;
        typography?: {
            fontSize?: number | undefined;
            fontWeight?: "400" | "500" | "700" | undefined;
            color?: string | undefined;
            numberOfLines?: number | undefined;
            ellipsizeMode?: "head" | "middle" | "tail" | undefined;
        } | undefined;
        colors?: {
            backgroundColor?: string | undefined;
            opacity?: number | undefined;
        } | undefined;
        borders?: {
            borderRadius?: number | undefined;
        } | undefined;
    }>>;
    accessibility: z.ZodOptional<z.ZodObject<{
        accessibilityLabel: z.ZodOptional<z.ZodString>;
        accessible: z.ZodOptional<z.ZodBoolean>;
        role: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        accessibilityLabel?: string | undefined;
        accessible?: boolean | undefined;
        role?: string | undefined;
    }, {
        accessibilityLabel?: string | undefined;
        accessible?: boolean | undefined;
        role?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "View" | "Text" | "Button" | "Image" | "Stack";
    key?: string | undefined;
    style?: {
        layout?: {
            flexDirection?: "row" | "column" | undefined;
            alignItems?: string | undefined;
            justifyContent?: string | undefined;
            gap?: number | undefined;
            padding?: number | undefined;
            paddingHorizontal?: number | undefined;
            paddingVertical?: number | undefined;
            paddingTop?: number | undefined;
            paddingRight?: number | undefined;
            paddingBottom?: number | undefined;
            paddingLeft?: number | undefined;
            margin?: number | undefined;
            width?: number | undefined;
            height?: number | undefined;
            minWidth?: number | undefined;
            minHeight?: number | undefined;
            maxWidth?: number | undefined;
            maxHeight?: number | undefined;
        } | undefined;
        typography?: {
            fontSize?: number | undefined;
            fontWeight?: "400" | "500" | "700" | undefined;
            color?: string | undefined;
            numberOfLines?: number | undefined;
            ellipsizeMode?: "head" | "middle" | "tail" | undefined;
        } | undefined;
        colors?: {
            backgroundColor?: string | undefined;
            opacity?: number | undefined;
        } | undefined;
        borders?: {
            borderRadius?: number | undefined;
        } | undefined;
    } | undefined;
    accessibility?: {
        accessibilityLabel?: string | undefined;
        accessible?: boolean | undefined;
        role?: string | undefined;
    } | undefined;
}, {
    type: "View" | "Text" | "Button" | "Image" | "Stack";
    key?: string | undefined;
    style?: {
        layout?: {
            flexDirection?: "row" | "column" | undefined;
            alignItems?: string | undefined;
            justifyContent?: string | undefined;
            gap?: number | undefined;
            padding?: number | undefined;
            paddingHorizontal?: number | undefined;
            paddingVertical?: number | undefined;
            paddingTop?: number | undefined;
            paddingRight?: number | undefined;
            paddingBottom?: number | undefined;
            paddingLeft?: number | undefined;
            margin?: number | undefined;
            width?: number | undefined;
            height?: number | undefined;
            minWidth?: number | undefined;
            minHeight?: number | undefined;
            maxWidth?: number | undefined;
            maxHeight?: number | undefined;
        } | undefined;
        typography?: {
            fontSize?: number | undefined;
            fontWeight?: "400" | "500" | "700" | undefined;
            color?: string | undefined;
            numberOfLines?: number | undefined;
            ellipsizeMode?: "head" | "middle" | "tail" | undefined;
        } | undefined;
        colors?: {
            backgroundColor?: string | undefined;
            opacity?: number | undefined;
        } | undefined;
        borders?: {
            borderRadius?: number | undefined;
        } | undefined;
    } | undefined;
    accessibility?: {
        accessibilityLabel?: string | undefined;
        accessible?: boolean | undefined;
        role?: string | undefined;
    } | undefined;
}>;
export declare const ViewNodeSchema: z.ZodType<any>;
export declare const TextNodeSchema: z.ZodType<any>;
export declare const ButtonNodeSchema: z.ZodType<any>;
export declare const ImageNodeSchema: z.ZodType<any>;
export declare const StackNodeSchema: z.ZodType<any>;
export declare const NodeSchema: z.ZodType<any>;
export declare const RootSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    rootId: z.ZodString;
    tree: z.ZodType<any, z.ZodTypeDef, any>;
}, "strip", z.ZodTypeAny, {
    version: 1;
    rootId: string;
    tree?: any;
}, {
    version: 1;
    rootId: string;
    tree?: any;
}>;
export type Axis = z.infer<typeof AxisSchema>;
export type NormalizedStyle = z.infer<typeof NormalizedStyleSchema>;
export type Accessibility = z.infer<typeof AccessibilitySchema>;
export type Node = z.infer<typeof NodeSchema>;
export type Root = z.infer<typeof RootSchema>;
//# sourceMappingURL=index.d.ts.map