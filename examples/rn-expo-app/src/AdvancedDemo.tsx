import {
  BrikButton,
  BrikImage,
  BrikProgressBar,
  BrikStack,
  BrikText,
  BrikView,
} from '@brik/react-native';

/** @brik */
export function AdvancedDemo() {
  return (
    <BrikView
      style={{
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffsetY: 2,
      }}
    >
      {/* Header with action */}
      <BrikStack axis="horizontal" style={{ gap: 12, marginBottom: 16 }}>
        <BrikImage
          uri="https://picsum.photos/60"
          style={{ width: 60, height: 60, borderRadius: 30 }}
          resizeMode="cover"
          action={{
            type: 'deeplink',
            url: 'myapp://profile',
          }}
        />
        <BrikStack axis="vertical" style={{ flex: 1, gap: 4 }}>
          <BrikText
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1A1A1A',
            }}
            action={{
              type: 'deeplink',
              url: 'myapp://home',
            }}
          >
            John Doe
          </BrikText>
          <BrikText
            style={{
              fontSize: 14,
              color: '#6B7280',
            }}
          >
            Software Engineer • San Francisco
          </BrikText>
        </BrikStack>
      </BrikStack>

      {/* Stats */}
      <BrikStack
        axis="horizontal"
        style={{
          gap: 8,
          marginBottom: 16,
          padding: 12,
          backgroundColor: '#F3F4F6',
          borderRadius: 12,
        }}
      >
        <BrikView style={{ flex: 1 }}>
          <BrikText
            style={{ fontSize: 24, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' }}
          >
            2.5K
          </BrikText>
          <BrikText style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
            Followers
          </BrikText>
        </BrikView>

        <BrikView style={{ width: 1, backgroundColor: '#D1D5DB' }} />

        <BrikView style={{ flex: 1 }}>
          <BrikText
            style={{ fontSize: 24, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' }}
          >
            342
          </BrikText>
          <BrikText style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
            Following
          </BrikText>
        </BrikView>

        <BrikView style={{ width: 1, backgroundColor: '#D1D5DB' }} />

        <BrikView style={{ flex: 1 }}>
          <BrikText
            style={{ fontSize: 24, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' }}
          >
            48
          </BrikText>
          <BrikText style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>Posts</BrikText>
        </BrikView>
      </BrikStack>

      {/* Progress Section */}
      <BrikStack axis="vertical" style={{ gap: 8, marginBottom: 16 }}>
        <BrikText style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>
          Today's Progress
        </BrikText>
        <BrikProgressBar progress={0.65} style={{ height: 8, borderRadius: 4 }} />
        <BrikText style={{ fontSize: 12, color: '#6B7280' }}>
          65% Complete • 6.5 hours tracked
        </BrikText>
      </BrikStack>

      {/* Action Buttons */}
      <BrikStack axis="horizontal" style={{ gap: 8 }}>
        <BrikButton
          label="Open App"
          variant="primary"
          size="medium"
          action={{
            type: 'deeplink',
            url: 'myapp://home',
            params: { screen: 'dashboard' },
          }}
          style={{
            flex: 1,
            backgroundColor: '#3B82F6',
            padding: 12,
            borderRadius: 8,
          }}
        />
        <BrikButton
          label="Refresh"
          variant="secondary"
          size="medium"
          action={{
            type: 'refresh',
          }}
          style={{
            flex: 1,
            backgroundColor: '#E5E7EB',
            padding: 12,
            borderRadius: 8,
          }}
        />
      </BrikStack>
    </BrikView>
  );
}
