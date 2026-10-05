import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { showAlert } from '@/utils/alert';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { BackHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { HABIT_COLORS, HABIT_ICONS } from '@/constants/icons';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { useHabitStore } from '@/store/habitStore';
import { useSessionStore } from '@/store/sessionStore';
import { deleteHabitImage, pickHabitImage } from '@/utils/habitImage';

const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];
const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

export default function AddHabitScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const { habitId } = useLocalSearchParams<{ habitId?: string }>();
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const removeHabit = useHabitStore((state) => state.removeHabit);
  const habits = useHabitStore((state) => state.habits);
  const activeTimers = useSessionStore((state) => state.activeTimers);
  const stopTimer = useSessionStore((state) => state.stopTimer);
  const editingHabit = habitId ? habits.find((item) => item.id === habitId) : undefined;
  const isEditMode = !!editingHabit;

  const [name, setName] = useState(editingHabit?.name ?? '');
  const [iconKey, setIconKey] = useState(editingHabit?.iconKey ?? HABIT_ICONS[0].key);
  const [colorKey, setColorKey] = useState(editingHabit?.colorKey ?? HABIT_COLORS[0]);
  const [imageUri, setImageUri] = useState<string | null>(editingHabit?.imageUri ?? null);
  const [imagePicking, setImagePicking] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(editingHabit?.durationMinutes ?? 30);
  const [showCustomDuration, setShowCustomDuration] = useState(
    () => !DURATION_OPTIONS.includes(editingHabit?.durationMinutes ?? 30)
  );
  const [customDurationText, setCustomDurationText] = useState(() =>
    !DURATION_OPTIONS.includes(editingHabit?.durationMinutes ?? 30)
      ? String(editingHabit?.durationMinutes ?? 30)
      : ''
  );
  const [frequency, setFrequency] = useState<number[]>(editingHabit?.frequency ?? []);
  const [error, setError] = useState('');

  const toggleDay = (value: number) => {
    setFrequency((prev) =>
      prev.includes(value) ? prev.filter((day) => day !== value) : [...prev, value]
    );
  };

  const handleCustomDurationChange = (text: string) => {
    setCustomDurationText(text);
    const parsed = parseInt(text, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setDurationMinutes(parsed);
    }
  };

  const handlePickImage = async () => {
    setImagePicking(true);
    try {
      const uri = await pickHabitImage();
      if (uri) {
        if (imageUri) deleteHabitImage(imageUri);
        setImageUri(uri);
      }
    } finally {
      setImagePicking(false);
    }
  };

  const handleRemoveImage = () => {
    if (imageUri) deleteHabitImage(imageUri);
    setImageUri(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError(t('addHabit.errorNameRequired'));
      return;
    }
    const payload = {
      name: name.trim(),
      iconKey,
      colorKey,
      imageUri: imageUri ?? undefined,
      durationMinutes,
      frequency,
    };
    if (editingHabit) {
      updateHabit(editingHabit.id, payload);
    } else {
      addHabit(payload);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!editingHabit) return;
    showAlert(t('addHabit.deleteConfirmTitle'), t('addHabit.deleteConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('addHabit.deleteConfirmOk'),
        style: 'destructive',
        onPress: () => {
          // An active timer for this habit would otherwise keep ticking in sessionStore
          // with no habit left to attach its eventual completion to.
          if (activeTimers[editingHabit.id]) {
            stopTimer(editingHabit.id);
          }
          removeHabit(editingHabit.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <BackHeader title={isEditMode ? t('addHabit.editTitle') : t('addHabit.title')} />

      {!isEditMode ? (
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            backgroundColor: theme.colors.primaryMuted,
            borderRadius: radius.lg,
            padding: spacing.lg,
          }}
        >
          <AppIcon name="sparkles" color={theme.colors.primary} size={20} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText weight="semiBold" size="sm" color={theme.colors.primary}>
              {t('addHabit.assistantLabel')}
            </AppText>
            <AppText size="sm" variant="secondary" style={{ lineHeight: 19 }}>
              {t('addHabit.assistantText')}
            </AppText>
          </View>
        </View>
      ) : null}

      <View style={{ gap: spacing.xs }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('addHabit.nameLabel')}
        </AppText>
        <Input placeholder={t('addHabit.namePlaceholder')} value={name} onChangeText={setName} />
        {error ? (
          <AppText size="sm" color={theme.colors.danger}>
            {error}
          </AppText>
        ) : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('addHabit.imageLabel')}
        </AppText>
        {imageUri ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Image source={{ uri: imageUri }} style={{ width: 72, height: 72, borderRadius: radius.md }} />
            <Pressable
              onPress={handleRemoveImage}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              hitSlop={8}
            >
              <AppIcon name="trash" color={theme.colors.danger} size={16} />
              <AppText size="sm" weight="medium" color={theme.colors.danger}>
                {t('addHabit.removeImage')}
              </AppText>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handlePickImage}
            disabled={imagePicking}
            style={{
              width: 88,
              height: 88,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surfaceAlt,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: theme.colors.border,
              gap: 4,
              opacity: imagePicking ? 0.6 : 1,
            }}
          >
            <AppIcon name="image" color={theme.colors.textSecondary} size={22} />
            <AppText size="xs" variant="tertiary">
              {t('addHabit.addImage')}
            </AppText>
          </Pressable>
        )}
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('addHabit.iconLabel')}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {HABIT_ICONS.map((icon) => {
            const active = icon.key === iconKey;
            return (
              <Pressable
                key={icon.key}
                onPress={() => setIconKey(icon.key)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                }}
              >
                <AppIcon
                  family={icon.family}
                  name={icon.name}
                  color={active ? theme.colors.onPrimary : theme.colors.textSecondary}
                  size={22}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('addHabit.daysLabel')}
        </AppText>
        <AppText size="xs" variant="tertiary">
          {t('addHabit.daysHint')}
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {WEEKDAY_VALUES.map((value) => {
            const active = frequency.includes(value);
            return (
              <Pressable
                key={value}
                onPress={() => toggleDay(value)}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                }}
              >
                <AppText
                  size="xs"
                  weight="semiBold"
                  color={active ? theme.colors.onPrimary : theme.colors.textSecondary}
                >
                  {t(`common.weekdaysShort.${value}`)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('addHabit.durationLabel')}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {DURATION_OPTIONS.map((minutes) => {
            const active = !showCustomDuration && minutes === durationMinutes;
            return (
              <Pressable
                key={minutes}
                onPress={() => {
                  setDurationMinutes(minutes);
                  setShowCustomDuration(false);
                }}
                style={{
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.full,
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                }}
              >
                <AppText
                  size="sm"
                  weight="semiBold"
                  color={active ? theme.colors.onPrimary : theme.colors.textSecondary}
                >
                  {t('common.minutesCount', { count: minutes })}
                </AppText>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setShowCustomDuration(true)}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.lg,
              borderRadius: radius.full,
              backgroundColor: showCustomDuration ? theme.colors.primary : theme.colors.surfaceAlt,
              borderWidth: 1,
              borderColor: showCustomDuration ? theme.colors.primary : theme.colors.border,
            }}
          >
            <AppText
              size="sm"
              weight="semiBold"
              color={showCustomDuration ? theme.colors.onPrimary : theme.colors.textSecondary}
            >
              {t('addHabit.durationCustom')}
            </AppText>
          </Pressable>
        </View>
        {showCustomDuration ? (
          <Input
            placeholder={t('addHabit.durationCustomPlaceholder')}
            value={customDurationText}
            onChangeText={handleCustomDurationChange}
            keyboardType="numeric"
          />
        ) : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('addHabit.colorLabel')}
        </AppText>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {HABIT_COLORS.map((color) => {
            const active = color === colorKey;
            return (
              <Pressable
                key={color}
                onPress={() => setColorKey(color)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: active ? 3 : 0,
                  borderColor: theme.colors.textPrimary,
                }}
              >
                {active ? <AppIcon name="checkmark" color="#FFFFFF" size={18} /> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        label={isEditMode ? t('addHabit.saveEditButton') : t('addHabit.saveButton')}
        onPress={handleSave}
        iconName="checkmark-circle"
      />

      {isEditMode ? (
        <Pressable
          onPress={handleDelete}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.md,
          }}
        >
          <AppIcon name="trash" color={theme.colors.danger} size={18} />
          <AppText weight="semiBold" size="sm" color={theme.colors.danger}>
            {t('addHabit.deleteButton')}
          </AppText>
        </Pressable>
      ) : null}
    </Screen>
  );
}
