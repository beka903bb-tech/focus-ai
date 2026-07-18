import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppText } from '@/components/ui/AppText';
import { BackHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { radius, spacing } from '@/constants/theme';
import { usePalette } from '@/store/themeStore';
import { ActivityLevel, CoachGoalType, useCoachProfileStore } from '@/store/coachProfileStore';

const GOAL_OPTIONS: { key: CoachGoalType; icon: string }[] = [
  { key: 'lose_weight', icon: 'trending-down' },
  { key: 'gain_weight', icon: 'trending-up' },
  { key: 'stay_fit', icon: 'fitness' },
  { key: 'reading', icon: 'book' },
  { key: 'cycling', icon: 'bicycle' },
  { key: 'custom', icon: 'ellipsis-horizontal-circle' },
];

const PHYSICAL_GOALS: CoachGoalType[] = ['lose_weight', 'gain_weight', 'stay_fit'];

export default function CoachProfileScreen() {
  const theme = usePalette();
  const { t } = useTranslation();
  const coachProfile = useCoachProfileStore((state) => state.coachProfile);
  const setCoachProfile = useCoachProfileStore((state) => state.setCoachProfile);

  const [goalType, setGoalType] = useState<CoachGoalType | null>(coachProfile.goalType);
  const [customGoal, setCustomGoal] = useState(coachProfile.customGoal ?? '');
  const [heightCm, setHeightCm] = useState(coachProfile.heightCm ? String(coachProfile.heightCm) : '');
  const [weightKg, setWeightKg] = useState(coachProfile.weightKg ? String(coachProfile.weightKg) : '');
  const [age, setAge] = useState(coachProfile.age ? String(coachProfile.age) : '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | undefined>(coachProfile.activityLevel);

  const showPhysicalFields = goalType != null && PHYSICAL_GOALS.includes(goalType);

  const handleSave = () => {
    setCoachProfile({
      goalType,
      customGoal: goalType === 'custom' ? customGoal.trim() || undefined : undefined,
      heightCm: showPhysicalFields ? Number(heightCm) || undefined : undefined,
      weightKg: showPhysicalFields ? Number(weightKg) || undefined : undefined,
      age: Number(age) || undefined,
      activityLevel,
    });
    router.back();
  };

  return (
    <Screen scroll>
      <BackHeader title={t('coachProfile.title')} />

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
        <View style={{ flex: 1 }}>
          <AppText size="sm" variant="secondary" style={{ lineHeight: 19 }}>
            {t('coachProfile.intro')}
          </AppText>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('coachProfile.goalLabel')}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {GOAL_OPTIONS.map((option) => {
            const active = option.key === goalType;
            return (
              <Pressable
                key={option.key}
                onPress={() => setGoalType(option.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.lg,
                  borderRadius: radius.full,
                  backgroundColor: active ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                }}
              >
                <AppIcon
                  name={option.icon}
                  color={active ? theme.colors.onPrimary : theme.colors.textSecondary}
                  size={16}
                />
                <AppText
                  size="sm"
                  weight="semiBold"
                  color={active ? theme.colors.onPrimary : theme.colors.textSecondary}
                >
                  {t(`coachProfile.goals.${option.key}`)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {goalType === 'custom' ? (
        <View style={{ gap: spacing.xs }}>
          <Input
            placeholder={t('coachProfile.customGoalPlaceholder')}
            value={customGoal}
            onChangeText={setCustomGoal}
          />
        </View>
      ) : null}

      {showPhysicalFields ? (
        <>
          <View style={{ gap: spacing.xs }}>
            <AppText weight="medium" size="sm" variant="secondary">
              {t('coachProfile.heightLabel')}
            </AppText>
            <Input
              placeholder={t('coachProfile.heightPlaceholder')}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
            />
          </View>
          <View style={{ gap: spacing.xs }}>
            <AppText weight="medium" size="sm" variant="secondary">
              {t('coachProfile.weightLabel')}
            </AppText>
            <Input
              placeholder={t('coachProfile.weightPlaceholder')}
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
            />
          </View>
        </>
      ) : null}

      <View style={{ gap: spacing.xs }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('coachProfile.ageLabel')}
        </AppText>
        <Input
          placeholder={t('coachProfile.agePlaceholder')}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <AppText weight="medium" size="sm" variant="secondary">
          {t('coachProfile.activityLabel')}
        </AppText>
        <SegmentedControl
          options={[
            { key: 'low', label: t('coachProfile.activityLow') },
            { key: 'medium', label: t('coachProfile.activityMedium') },
            { key: 'high', label: t('coachProfile.activityHigh') },
          ]}
          selectedKey={activityLevel ?? ''}
          onChange={(key) => setActivityLevel(key as ActivityLevel)}
        />
      </View>

      <Button label={t('coachProfile.saveButton')} onPress={handleSave} iconName="checkmark-circle" />
    </Screen>
  );
}
