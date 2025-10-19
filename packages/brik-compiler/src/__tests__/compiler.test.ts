import { describe, it, expect } from 'vitest';
import { compile } from '../index';

describe('@brik/compiler', () => {
  describe('compile function', () => {
    it('should compile simple View component', () => {
      const source = `
        import { BrikView } from '@brik/react-native';

        export function SimpleWidget() {
          return <BrikView />;
        }
      `;

      const result = compile(source, 'test.tsx');
      expect(result).toBeDefined();
      expect(result.version).toBe(1);
      expect(result.rootId).toBe('test.tsx');
      expect(result.tree.type).toBe('View');
    });

    it('should compile Text component with content', () => {
      const source = `
        import { BrikView, BrikText } from '@brik/react-native';

        export function TextWidget() {
          return (
            <BrikView>
              <BrikText>Hello World</BrikText>
            </BrikView>
          );
        }
      `;

      const result = compile(source, 'text-widget.tsx');
      expect(result.tree.type).toBe('View');
      expect(result.tree.children).toHaveLength(1);
      expect(result.tree.children[0].type).toBe('Text');
      expect(result.tree.children[0].text).toBe('Hello World');
    });

    it('should compile Button with action', () => {
      const source = `
        import { BrikButton } from '@brik/react-native';

        export function ButtonWidget() {
          return (
            <BrikButton
              label="Open App"
              action={{ type: 'deeplink', url: 'myapp://home' }}
            />
          );
        }
      `;

      const result = compile(source, 'button-widget.tsx');
      expect(result.tree.type).toBe('Button');
      expect(result.tree.label).toBe('Open App');
      expect(result.tree.action).toEqual({
        type: 'deeplink',
        url: 'myapp://home'
      });
    });

    it('should compile Image component', () => {
      const source = `
        import { BrikImage } from '@brik/react-native';

        export function ImageWidget() {
          return (
            <BrikImage
              uri="https://example.com/logo.png"
              resizeMode="cover"
            />
          );
        }
      `;

      const result = compile(source, 'image-widget.tsx');
      expect(result.tree.type).toBe('Image');
      expect(result.tree.uri).toBe('https://example.com/logo.png');
      expect(result.tree.resizeMode).toBe('cover');
    });

    it('should compile Stack with children', () => {
      const source = `
        import { BrikStack, BrikText } from '@brik/react-native';

        export function StackWidget() {
          return (
            <BrikStack axis="horizontal">
              <BrikText>Left</BrikText>
              <BrikText>Right</BrikText>
            </BrikStack>
          );
        }
      `;

      const result = compile(source, 'stack-widget.tsx');
      expect(result.tree.type).toBe('Stack');
      expect(result.tree.axis).toBe('horizontal');
      expect(result.tree.children).toHaveLength(2);
      expect(result.tree.children[0].text).toBe('Left');
      expect(result.tree.children[1].text).toBe('Right');
    });

    it('should compile ProgressBar', () => {
      const source = `
        import { BrikProgressBar } from '@brik/react-native';

        export function ProgressWidget() {
          return <BrikProgressBar progress={0.75} />;
        }
      `;

      const result = compile(source, 'progress-widget.tsx');
      expect(result.tree.type).toBe('ProgressBar');
      expect(result.tree.progress).toBe(0.75);
    });

    it('should handle styles correctly', () => {
      const source = `
        import { BrikView, BrikText } from '@brik/react-native';

        export function StyledWidget() {
          return (
            <BrikView style={{
              padding: 16,
              backgroundColor: '#FFFFFF',
              borderRadius: 8
            }}>
              <BrikText style={{
                fontSize: 18,
                color: '#000000',
                fontWeight: '700'
              }}>
                Styled Text
              </BrikText>
            </BrikView>
          );
        }
      `;

      const result = compile(source, 'styled-widget.tsx');

      // Check View styles
      expect(result.tree.style).toBeDefined();
      expect(result.tree.style.layout?.padding).toBe(16);
      expect(result.tree.style.colors?.backgroundColor).toBe('#FFFFFF');
      expect(result.tree.style.borders?.borderRadius).toBe(8);

      // Check Text styles
      const textNode = result.tree.children[0];
      expect(textNode.style).toBeDefined();
      expect(textNode.style.typography?.fontSize).toBe(18);
      expect(textNode.style.typography?.color).toBe('#000000');
      expect(textNode.style.typography?.fontWeight).toBe('700');
    });

    it('should handle nested components', () => {
      const source = `
        import { BrikView, BrikStack, BrikText } from '@brik/react-native';

        export function NestedWidget() {
          return (
            <BrikView>
              <BrikStack axis="vertical">
                <BrikText>Title</BrikText>
                <BrikView style={{ padding: 8 }}>
                  <BrikText>Nested Content</BrikText>
                </BrikView>
              </BrikStack>
            </BrikView>
          );
        }
      `;

      const result = compile(source, 'nested-widget.tsx');

      expect(result.tree.type).toBe('View');
      expect(result.tree.children[0].type).toBe('Stack');
      expect(result.tree.children[0].children).toHaveLength(2);

      const nestedView = result.tree.children[0].children[1];
      expect(nestedView.type).toBe('View');
      expect(nestedView.style.layout?.padding).toBe(8);
      expect(nestedView.children[0].text).toBe('Nested Content');
    });

    it('should handle conditional rendering', () => {
      const source = `
        import { BrikView, BrikText } from '@brik/react-native';

        export function ConditionalWidget() {
          const showMessage = true;
          return (
            <BrikView>
              {showMessage && <BrikText>Visible</BrikText>}
              {!showMessage && <BrikText>Hidden</BrikText>}
            </BrikView>
          );
        }
      `;

      const result = compile(source, 'conditional-widget.tsx');

      // Compiler should evaluate conditions during compilation
      expect(result.tree.children).toHaveLength(1);
      expect(result.tree.children[0].text).toBe('Visible');
    });

    it('should handle map operations', () => {
      const source = `
        import { BrikView, BrikText } from '@brik/react-native';

        export function ListWidget() {
          const items = ['One', 'Two', 'Three'];
          return (
            <BrikView>
              {items.map(item => (
                <BrikText key={item}>{item}</BrikText>
              ))}
            </BrikView>
          );
        }
      `;

      const result = compile(source, 'list-widget.tsx');

      expect(result.tree.children).toHaveLength(3);
      expect(result.tree.children[0].text).toBe('One');
      expect(result.tree.children[1].text).toBe('Two');
      expect(result.tree.children[2].text).toBe('Three');
      expect(result.tree.children[0].key).toBe('One');
    });

    it('should extract Live Activity configuration', () => {
      const source = `
        import { BrikView, BrikText } from '@brik/react-native';

        /** @brik-activity */
        export function OrderTrackingActivity() {
          return {
            activityType: 'OrderTracking',
            attributes: {
              static: { orderId: 'string' },
              dynamic: { status: 'string', progress: 'number' }
            },
            regions: {
              lockScreen: (
                <BrikView>
                  <BrikText>Order Status</BrikText>
                </BrikView>
              ),
              dynamicIsland: {
                compact: <BrikText>🍕</BrikText>,
                minimal: <BrikText>🍕</BrikText>,
                expanded: <BrikView><BrikText>Order Details</BrikText></BrikView>
              }
            }
          };
        }
      `;

      const result = compile(source, 'order-tracking.tsx');

      expect(result.liveActivity).toBeDefined();
      expect(result.liveActivity?.activityType).toBe('OrderTracking');
      expect(result.liveActivity?.attributes.static).toHaveProperty('orderId');
      expect(result.liveActivity?.attributes.dynamic).toHaveProperty('status');
      expect(result.liveActivity?.attributes.dynamic).toHaveProperty('progress');
      expect(result.liveActivity?.regions.lockScreen).toBeDefined();
      expect(result.liveActivity?.regions.dynamicIsland).toBeDefined();
    });

    it('should handle template literals in text', () => {
      const source = `
        import { BrikText } from '@brik/react-native';

        export function TemplateWidget() {
          const temperature = 72;
          const unit = 'F';
          return (
            <BrikText>{\`\${temperature}°\${unit}\`}</BrikText>
          );
        }
      `;

      const result = compile(source, 'template-widget.tsx');
      expect(result.tree.text).toBe('72°F');
    });

    it('should handle Spacer component', () => {
      const source = `
        import { BrikStack, BrikText, BrikSpacer } from '@brik/react-native';

        export function SpacerWidget() {
          return (
            <BrikStack axis="horizontal">
              <BrikText>Left</BrikText>
              <BrikSpacer />
              <BrikText>Right</BrikText>
            </BrikStack>
          );
        }
      `;

      const result = compile(source, 'spacer-widget.tsx');

      expect(result.tree.children).toHaveLength(3);
      expect(result.tree.children[1].type).toBe('Spacer');
    });

    it('should handle data binding', () => {
      const source = `
        import { BrikText } from '@brik/react-native';

        export function DataBoundWidget() {
          return (
            <BrikText dataBinding={{
              source: 'local',
              key: 'temperature',
              fallback: '--'
            }}>
              Temperature
            </BrikText>
          );
        }
      `;

      const result = compile(source, 'databound-widget.tsx');

      expect(result.tree.dataBinding).toBeDefined();
      expect(result.tree.dataBinding.source).toBe('local');
      expect(result.tree.dataBinding.key).toBe('temperature');
      expect(result.tree.dataBinding.fallback).toBe('--');
    });

    it('should throw on invalid component', () => {
      const source = `
        import { UnknownComponent } from '@brik/react-native';

        export function InvalidWidget() {
          return <UnknownComponent />;
        }
      `;

      expect(() => compile(source, 'invalid-widget.tsx')).toThrow();
    });
  });
});