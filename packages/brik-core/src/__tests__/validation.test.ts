import { describe, it, expect } from 'vitest';
import { validateRoot, validateNode, normalizeStyle } from '../index';
import type { Root, Node } from '../index';

describe('@brik/core validation', () => {
  describe('validateRoot', () => {
    it('should validate a valid root structure', () => {
      const root: Root = {
        version: 1,
        rootId: 'test-widget',
        tree: {
          type: 'View',
          children: [
            {
              type: 'Text',
              text: 'Hello World'
            }
          ]
        }
      };

      const result = validateRoot(root);
      expect(result).toEqual(root);
    });

    it('should throw on invalid version', () => {
      const invalidRoot = {
        version: 2, // Invalid version
        rootId: 'test-widget',
        tree: {
          type: 'View'
        }
      };

      expect(() => validateRoot(invalidRoot as any)).toThrow('Invalid IR Root');
    });

    it('should throw on missing rootId', () => {
      const invalidRoot = {
        version: 1,
        // Missing rootId
        tree: {
          type: 'View'
        }
      };

      expect(() => validateRoot(invalidRoot as any)).toThrow('Invalid IR Root');
    });

    it('should validate root with widget metadata', () => {
      const root: Root = {
        version: 1,
        rootId: 'weather-widget',
        tree: {
          type: 'View'
        },
        widget: {
          kind: 'weather',
          displayName: 'Weather Widget',
          families: ['systemSmall', 'systemMedium']
        }
      };

      const result = validateRoot(root);
      expect(result.widget).toBeDefined();
      expect(result.widget?.families).toContain('systemSmall');
    });

    it('should validate root with live activity', () => {
      const root: Root = {
        version: 1,
        rootId: 'order-tracking',
        tree: {
          type: 'View'
        },
        liveActivity: {
          activityType: 'OrderTracking',
          attributes: {
            static: { orderId: 'string' },
            dynamic: { status: 'string' }
          },
          regions: {
            lockScreen: {
              type: 'View'
            }
          }
        }
      };

      const result = validateRoot(root);
      expect(result.liveActivity).toBeDefined();
      expect(result.liveActivity?.activityType).toBe('OrderTracking');
    });
  });

  describe('validateNode', () => {
    it('should validate View node', () => {
      const node: Node = {
        type: 'View',
        children: []
      };

      const result = validateNode(node);
      expect(result.type).toBe('View');
    });

    it('should validate Text node', () => {
      const node: Node = {
        type: 'Text',
        text: 'Hello'
      };

      const result = validateNode(node);
      expect(result.type).toBe('Text');
      expect((result as any).text).toBe('Hello');
    });

    it('should validate Button node with action', () => {
      const node: Node = {
        type: 'Button',
        label: 'Click me',
        action: {
          type: 'deeplink',
          url: 'myapp://home'
        }
      };

      const result = validateNode(node);
      expect(result.type).toBe('Button');
      expect((result as any).action.url).toBe('myapp://home');
    });

    it('should validate Image node', () => {
      const node: Node = {
        type: 'Image',
        uri: 'https://example.com/image.png',
        resizeMode: 'cover'
      };

      const result = validateNode(node);
      expect(result.type).toBe('Image');
      expect((result as any).resizeMode).toBe('cover');
    });

    it('should validate Stack node', () => {
      const node: Node = {
        type: 'Stack',
        axis: 'horizontal',
        children: [
          { type: 'Text', text: '1' },
          { type: 'Text', text: '2' }
        ]
      };

      const result = validateNode(node);
      expect(result.type).toBe('Stack');
      expect((result as any).axis).toBe('horizontal');
      expect((result as any).children).toHaveLength(2);
    });

    it('should validate ProgressBar node', () => {
      const node: Node = {
        type: 'ProgressBar',
        progress: 0.5,
        indeterminate: false
      };

      const result = validateNode(node);
      expect(result.type).toBe('ProgressBar');
      expect((result as any).progress).toBe(0.5);
    });

    it('should throw on invalid node type', () => {
      const invalidNode = {
        type: 'InvalidType',
        foo: 'bar'
      };

      expect(() => validateNode(invalidNode as any)).toThrow();
    });

    it('should validate node with style', () => {
      const node: Node = {
        type: 'View',
        style: {
          layout: {
            padding: 16,
            flexDirection: 'row'
          },
          colors: {
            backgroundColor: '#FFFFFF'
          }
        }
      };

      const result = validateNode(node);
      expect(result.style).toBeDefined();
      expect(result.style?.layout?.padding).toBe(16);
    });
  });

  describe('normalizeStyle', () => {
    it('should normalize React Native style to IR style', () => {
      const rnStyle = {
        padding: 16,
        backgroundColor: '#FF0000',
        fontSize: 14,
        fontWeight: '700',
        borderRadius: 8,
        flexDirection: 'row' as const
      };

      const normalized = normalizeStyle(rnStyle);

      expect(normalized.layout?.padding).toBe(16);
      expect(normalized.layout?.flexDirection).toBe('row');
      expect(normalized.colors?.backgroundColor).toBe('#FF0000');
      expect(normalized.typography?.fontSize).toBe(14);
      expect(normalized.typography?.fontWeight).toBe('700');
      expect(normalized.borders?.borderRadius).toBe(8);
    });

    it('should handle padding shortcuts', () => {
      const style = {
        paddingHorizontal: 20,
        paddingVertical: 10,
        paddingTop: 5
      };

      const normalized = normalizeStyle(style);

      expect(normalized.layout?.paddingHorizontal).toBe(20);
      expect(normalized.layout?.paddingVertical).toBe(10);
      expect(normalized.layout?.paddingTop).toBe(5);
    });

    it('should handle margin shortcuts', () => {
      const style = {
        marginHorizontal: 15,
        marginVertical: 8,
        marginBottom: 12
      };

      const normalized = normalizeStyle(style);

      expect(normalized.layout?.marginHorizontal).toBe(15);
      expect(normalized.layout?.marginVertical).toBe(8);
      expect(normalized.layout?.marginBottom).toBe(12);
    });

    it('should handle shadow properties', () => {
      const style = {
        shadowColor: '#000000',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5 // Android
      };

      const normalized = normalizeStyle(style);

      expect(normalized.shadows?.shadowColor).toBe('#000000');
      expect(normalized.shadows?.shadowOpacity).toBe(0.5);
      expect(normalized.shadows?.shadowRadius).toBe(10);
      expect(normalized.shadows?.shadowOffsetX).toBe(0);
      expect(normalized.shadows?.shadowOffsetY).toBe(2);
      expect(normalized.shadows?.elevation).toBe(5);
    });

    it('should handle text styles', () => {
      const style = {
        color: '#333333',
        fontSize: 16,
        fontFamily: 'System',
        fontStyle: 'italic' as const,
        lineHeight: 24,
        letterSpacing: 1,
        textAlign: 'center' as const,
        textTransform: 'uppercase' as const
      };

      const normalized = normalizeStyle(style);

      expect(normalized.typography?.color).toBe('#333333');
      expect(normalized.typography?.fontSize).toBe(16);
      expect(normalized.typography?.fontFamily).toBe('System');
      expect(normalized.typography?.fontStyle).toBe('italic');
      expect(normalized.typography?.lineHeight).toBe(24);
      expect(normalized.typography?.letterSpacing).toBe(1);
      expect(normalized.typography?.textAlign).toBe('center');
      expect(normalized.typography?.textTransform).toBe('uppercase');
    });

    it('should return empty object for undefined style', () => {
      const normalized = normalizeStyle(undefined);
      expect(normalized).toEqual({});
    });

    it('should handle flex properties', () => {
      const style = {
        flex: 1,
        flexGrow: 2,
        flexShrink: 0,
        flexBasis: 100,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const
      };

      const normalized = normalizeStyle(style);

      expect(normalized.layout?.flex).toBe(1);
      expect(normalized.layout?.flexGrow).toBe(2);
      expect(normalized.layout?.flexShrink).toBe(0);
      expect(normalized.layout?.flexBasis).toBe(100);
      expect(normalized.layout?.alignItems).toBe('center');
      expect(normalized.layout?.justifyContent).toBe('space-between');
    });
  });
});