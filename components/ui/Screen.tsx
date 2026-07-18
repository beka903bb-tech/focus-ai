import { StatusBar } from 'expo-status-bar';
import { ScrollView, ScrollViewProps, View, ViewProps } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  edges?: Edge[];
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

export function Screen({
  scroll = false,
  edges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
  children,
  ...rest
}: ScreenProps) {
  const theme = usePalette();

  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            { padding: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.lg },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View {...rest} style={[{ flex: 1, padding: spacing.xl }, style]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
