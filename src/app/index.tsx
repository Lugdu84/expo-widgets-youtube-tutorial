import { useEffect } from 'react'
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { colors, radius, spacing } from '@/constants/theme'
import { useSession } from '@/hooks/useSession'

const DURATIONS = [15, 25, 45] as const

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function HomeScreen() {
  const {
    task,
    setTask,
    duration,
    setDuration,
    isActive,
    isCompleted,
    timeLeft,
    startSession,
    stopSession,
    clearCompleted,
  } = useSession()

  useEffect(() => {
    if (!isCompleted) return
    const timeout = setTimeout(clearCompleted, 3000)
    return () => clearTimeout(timeout)
  }, [isCompleted])

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centeredContent}>
          <Text style={styles.completedText}>✅ Session terminée !</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (isActive) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centeredContent}>
          <Text style={styles.taskLabel}>{task || 'Focus session'}</Text>
          <Text style={styles.countdown}>{formatTime(timeLeft)}</Text>
          <Pressable style={styles.stopButton} onPress={stopSession}>
            <Text style={styles.buttonText}>Arrêter la session</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>⏱️ Focus Session</Text>

        <TextInput
          style={styles.input}
          placeholder="Quelle est ta tâche ?"
          placeholderTextColor={colors.textSecondary}
          value={task}
          onChangeText={setTask}
        />

        <View style={styles.durationRow}>
          {DURATIONS.map((d) => (
            <Pressable
              key={d}
              style={[
                styles.durationPill,
                duration === d && styles.durationPillActive,
              ]}
              onPress={() => setDuration(d)}
            >
              <Text
                style={[
                  styles.durationText,
                  duration === d && styles.durationTextActive,
                ]}
              >
                {d} min
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.startButton} onPress={startSession}>
          <Text style={styles.buttonText}>Démarrer la session</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  centeredContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  durationPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  durationPillActive: {
    backgroundColor: colors.primary,
  },
  durationText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  durationTextActive: {
    color: colors.text,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: spacing.lg,
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  taskLabel: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  countdown: {
    fontSize: 72,
    fontWeight: '200',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  completedText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.success,
  },
})
