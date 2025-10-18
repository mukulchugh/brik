import React from 'react';
import {
  Image,
  ImageProps,
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';

export type BrikCommonProps = {
  style?: any;
  accessibilityLabel?: string;
  accessible?: boolean;
  role?: string;
};

export type BrikTextProps = BrikCommonProps & {
  children?: string | number;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail';
  fontSize?: number;
  fontWeight?: '400' | '500' | '700';
  color?: string;
};

export function BrikText(props: BrikTextProps) {
  return React.createElement(Text, props as TextProps);
}

export type BrikViewProps = BrikCommonProps & ViewProps & { children?: React.ReactNode };
export function BrikView(props: BrikViewProps) {
  return React.createElement(View, props);
}

export type BrikButtonProps = BrikCommonProps & { label: string; onPress?: () => void };
export function BrikButton({ label, onPress, ...rest }: BrikButtonProps) {
  return React.createElement(
    TouchableOpacity,
    { accessibilityRole: 'button', onPress, ...(rest as any) },
    React.createElement(Text, null, label),
  );
}

export type BrikImageProps = BrikCommonProps & { uri: string; resizeMode?: 'cover' | 'contain' };
export function BrikImage({ uri, resizeMode, ...rest }: BrikImageProps) {
  return React.createElement(Image, { source: { uri }, resizeMode, ...(rest as ImageProps) });
}

export type BrikStackProps = BrikCommonProps & {
  axis: 'row' | 'column';
  children?: React.ReactNode;
  gap?: number;
};
export function BrikStack({ axis, children, gap = 0, style, ...rest }: BrikStackProps) {
  return React.createElement(
    View,
    { style: [{ flexDirection: axis, gap }, style], ...(rest as any) },
    children as any,
  );
}
