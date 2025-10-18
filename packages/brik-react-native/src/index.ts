import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageProps,
  Linking,
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';

export type BrikAction = {
  type: 'deeplink' | 'openApp' | 'refresh' | 'custom';
  url?: string;
  params?: Record<string, string | number | boolean>;
  appId?: string;
};

export type BrikDataBinding = {
  source: 'local' | 'remote' | 'shared';
  key: string;
  fallback?: any;
  transform?: string;
};

export type BrikCommonProps = {
  style?: any;
  accessibilityLabel?: string;
  accessible?: boolean;
  role?: string;
  action?: BrikAction;
  dataBinding?: BrikDataBinding;
};

// Handle actions
const handleAction = (action?: BrikAction) => {
  if (!action) return;

  switch (action.type) {
    case 'deeplink':
      if (action.url) {
        Linking.openURL(action.url);
      }
      break;
    case 'openApp':
      // Platform-specific app opening logic
      break;
    case 'refresh':
      // Trigger refresh logic
      break;
    case 'custom':
      // Custom action handler
      break;
  }
};

export type BrikTextProps = BrikCommonProps & {
  children?: string | number;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail';
  fontSize?: number;
  fontWeight?: '400' | '500' | '700';
  color?: string;
};

export function BrikText({ children, action, ...props }: BrikTextProps) {
  const element = React.createElement(Text, props as TextProps, children);

  if (action) {
    return React.createElement(TouchableOpacity, { onPress: () => handleAction(action) }, element);
  }

  return element;
}

export type BrikViewProps = BrikCommonProps & ViewProps & { children?: React.ReactNode };
export function BrikView({ children, action, ...props }: BrikViewProps) {
  const element = React.createElement(View, props, children);

  if (action) {
    return React.createElement(TouchableOpacity, { onPress: () => handleAction(action) }, element);
  }

  return element;
}

export type BrikButtonProps = BrikCommonProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
};
export function BrikButton({
  label,
  action,
  variant = 'primary',
  size = 'medium',
  ...rest
}: BrikButtonProps) {
  return React.createElement(
    TouchableOpacity,
    {
      accessibilityRole: 'button',
      onPress: () => handleAction(action),
      ...(rest as any),
    },
    React.createElement(Text, null, label),
  );
}

export type BrikImageProps = BrikCommonProps & {
  uri: string;
  resizeMode?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  placeholder?: string;
};
export function BrikImage({
  uri,
  resizeMode = 'cover',
  placeholder,
  action,
  ...rest
}: BrikImageProps) {
  const element = React.createElement(Image, {
    source: { uri },
    resizeMode: resizeMode as any,
    defaultSource: placeholder ? { uri: placeholder } : undefined,
    ...(rest as ImageProps),
  });

  if (action) {
    return React.createElement(TouchableOpacity, { onPress: () => handleAction(action) }, element);
  }

  return element;
}

export type BrikStackProps = BrikCommonProps & {
  axis: 'horizontal' | 'vertical';
  children?: React.ReactNode;
  gap?: number;
};
export function BrikStack({ axis, children, gap = 0, style, action, ...rest }: BrikStackProps) {
  const flexDirection = axis === 'horizontal' ? 'row' : 'column';
  const element = React.createElement(
    View,
    { style: [{ flexDirection, gap }, style], ...(rest as any) },
    children,
  );

  if (action) {
    return React.createElement(TouchableOpacity, { onPress: () => handleAction(action) }, element);
  }

  return element;
}

// New components for enhanced IR

export type BrikSpacerProps = BrikCommonProps & {
  flex?: number;
};
export function BrikSpacer({ flex = 1, style, ...rest }: BrikSpacerProps) {
  return React.createElement(View, { style: [{ flex }, style], ...(rest as any) });
}

export type BrikProgressBarProps = BrikCommonProps & {
  progress: number; // 0-1
  indeterminate?: boolean;
};
export function BrikProgressBar({ progress, indeterminate, style, ...rest }: BrikProgressBarProps) {
  if (indeterminate) {
    return React.createElement(ActivityIndicator, { ...(rest as any) });
  }

  return React.createElement(
    View,
    {
      style: [{ height: 4, backgroundColor: '#e0e0e0', borderRadius: 2 }, style],
      ...(rest as any),
    },
    React.createElement(View, {
      style: {
        height: '100%',
        width: `${progress * 100}%`,
        backgroundColor: '#007AFF',
        borderRadius: 2,
      },
    }),
  );
}

export type BrikListProps<T = any> = BrikCommonProps & {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  horizontal?: boolean;
  keyExtractor?: (item: T, index: number) => string;
};
export function BrikList<T>({
  items,
  renderItem,
  horizontal = false,
  keyExtractor,
  ...rest
}: BrikListProps<T>) {
  return React.createElement(FlatList, {
    data: items,
    renderItem: ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    horizontal,
    keyExtractor: keyExtractor || ((_, index) => String(index)),
    ...(rest as any),
  });
}

// Re-export Live Activities API
export * from './live-activities';
