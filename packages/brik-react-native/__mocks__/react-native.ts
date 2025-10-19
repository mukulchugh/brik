/**
 * Mock implementation of React Native for testing
 */

export const Platform = {
  OS: 'ios' as 'ios' | 'android',
  select: jest.fn((obj: { ios?: any; android?: any }) => obj.ios),
};

export const Linking = {
  openURL: jest.fn().mockResolvedValue(undefined),
};

// Mock React createElement
export const createElement = jest.fn((type, props, ...children) => ({
  type,
  props: { ...props, children },
}));

// Export other React Native mocks as needed
export const View = 'View';
export const Text = 'Text';
export const Image = 'Image';
export const TouchableOpacity = 'TouchableOpacity';
export const FlatList = 'FlatList';
export const ActivityIndicator = 'ActivityIndicator';

// Mock NativeModules
export const NativeModules = {
  BrikLiveActivities: {
    startActivity: jest.fn(),
    updateActivity: jest.fn(),
    endActivity: jest.fn(),
    getActiveActivities: jest.fn().mockResolvedValue([]),
    areActivitiesSupported: jest.fn().mockResolvedValue(true),
    getPushToken: jest.fn().mockResolvedValue('mock-push-token'),
  },
};
