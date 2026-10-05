import { Alert, AlertButton, Platform } from 'react-native';

// React Native's Alert.alert does nothing on the web build, which silently broke every
// confirm dialog there (reset, demo data, delete habit…). On web we fall back to the
// browser's own confirm/alert; on Android/iOS this is exactly Alert.alert.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  const actions = (buttons ?? []).filter((button) => button.style !== 'cancel');
  if (actions.length === 0) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }
  if (window.confirm(text)) {
    actions[0].onPress?.();
  } else {
    buttons?.find((button) => button.style === 'cancel')?.onPress?.();
  }
}
