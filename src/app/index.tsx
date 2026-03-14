import DeliveryActivity from '@/widgets/DeliveryActivity';
import DeliveryWidget from '@/widgets/DeliveryWidget';
import { DeliveryProps, DeliveryStatus } from '@/widgets/types';
import {
	addUserInteractionListener,
	LiveActivity,
	UserInteractionEvent,
} from 'expo-widgets';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

const ORDER_NUMBER = '12345';

const INITIAL_PROPS: DeliveryProps = {
	status: 'pending',
	etaMinutes: 0,
	orderNumber: ORDER_NUMBER,
};

const STEP_INTERVAL = 2_000;
const START_ETA = 30;
const ETA_DECREMENT = 5;
const ARRIVING_THRESHOLD = 10;

function buildSteps(): { status: DeliveryStatus; etaMinutes: number }[] {
	const steps: { status: DeliveryStatus; etaMinutes: number }[] = [];
	for (let eta = START_ETA; eta >= 0; eta -= ETA_DECREMENT) {
		const status: DeliveryStatus =
			eta === 0
				? 'delivered'
				: eta <= ARRIVING_THRESHOLD
					? 'arriving'
					: 'on_the_way';
		steps.push({ status, etaMinutes: eta });
	}
	return steps;
}

const STEPS = buildSteps();

// Register listener at module level to catch events even before React mounts
let pendingEvent: UserInteractionEvent | null = null;
addUserInteractionListener((event) => {
	if (event.source !== 'DeliveryWidget') return;
	pendingEvent = event;
	onWidgetEvent?.(event);
});
let onWidgetEvent: ((event: UserInteractionEvent) => void) | null = null;

export default function Index() {
	const [delivery, setDelivery] = useState<DeliveryProps>(INITIAL_PROPS);
	const activityRef = useRef<LiveActivity<DeliveryProps> | null>(null);
	const progressionRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const clearProgression = () => {
		if (progressionRef.current) {
			clearInterval(progressionRef.current);
			progressionRef.current = null;
		}
	};

	const handleConfirmRef = useRef<() => void>(() => {});
	const handleCancelRef = useRef<() => void>(() => {});

	const dispatchEvent = (event: UserInteractionEvent) => {
		if (event.target === 'confirm') {
			handleConfirmRef.current();
		} else if (event.target === 'cancel') {
			handleCancelRef.current();
		}
	};

	useEffect(() => {
		DeliveryWidget.updateSnapshot(INITIAL_PROPS);

		// Clean up any stale live activities from previous sessions
		const staleActivities = DeliveryActivity.getInstances();
		if (staleActivities.length > 0) {
			Promise.all(
				staleActivities.map((a) => a.end('immediate').catch(() => {})),
			);
		}

		// Wire up the module-level listener to call our refs
		onWidgetEvent = dispatchEvent;

		// Process any event that arrived before mount
		if (pendingEvent) {
			dispatchEvent(pendingEvent);
			pendingEvent = null;
		}

		// Also re-check when app returns to foreground (cold-start resilience)
		const appStateSub = AppState.addEventListener('change', (state) => {
			if (state === 'active' && pendingEvent) {
				dispatchEvent(pendingEvent);
				pendingEvent = null;
			}
		});

		return () => {
			onWidgetEvent = null;
			appStateSub.remove();
			clearProgression();
		};
	}, []);

	useEffect(() => {
		if (activityRef.current) {
			activityRef.current.update(delivery);
		}
	}, [delivery]);

	const handleConfirm = () => {
		const confirmedProps: DeliveryProps = {
			status: 'confirmed',
			etaMinutes: 30,
			orderNumber: ORDER_NUMBER,
		};

		setDelivery(confirmedProps);

		const now = Date.now();
		const totalDuration = STEPS.length * STEP_INTERVAL;
		DeliveryWidget.updateTimeline([
			{
				date: new Date(now),
				props: { status: 'on_the_way', etaMinutes: START_ETA, orderNumber: ORDER_NUMBER },
			},
			{
				date: new Date(now + totalDuration),
				props: { status: 'delivered', etaMinutes: 0, orderNumber: ORDER_NUMBER },
			},
		]);

		// End any stale live activities before starting a new one
		const existing = DeliveryActivity.getInstances();
		Promise.all(existing.map((a) => a.end('immediate').catch(() => {}))).then(
			() => {
				activityRef.current = DeliveryActivity.start({
					status: 'on_the_way',
					etaMinutes: 30,
					orderNumber: ORDER_NUMBER,
				});
			},
		);

		let stepIndex = 0;
		clearProgression();
		progressionRef.current = setInterval(() => {
			const step = STEPS[stepIndex];
			setDelivery({ orderNumber: ORDER_NUMBER, ...step });

			if (step.status === 'delivered') {
				clearProgression();
				// Show "Livrée" for 4 seconds before dismissing
				activityRef.current
					?.update({
						status: 'delivered',
						etaMinutes: 0,
						orderNumber: ORDER_NUMBER,
					})
					.catch(() => {});
				setTimeout(() => {
					activityRef.current?.end('immediate').catch(() => {});
					activityRef.current = null;
				}, 4_000);
			}

			stepIndex++;
			if (stepIndex >= STEPS.length) {
				clearProgression();
			}
		}, STEP_INTERVAL);
	};

	const handleCancel = () => {
		clearProgression();
		setDelivery(INITIAL_PROPS);
		DeliveryWidget.updateSnapshot(INITIAL_PROPS);
		activityRef.current?.end('immediate').catch(() => {});
		activityRef.current = null;
	};

	handleConfirmRef.current = handleConfirm;
	handleCancelRef.current = handleCancel;

	const statusLabel: Record<DeliveryStatus, string> = {
		pending: '⏳ En attente de confirmation',
		confirmed: '✅ Confirmée',
		on_the_way: '🚚 En route',
		arriving: '📦 Presque là',
		delivered: '✅ Livrée',
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Ma Livraison</Text>
			<Text style={styles.order}>Commande #{ORDER_NUMBER}</Text>
			<Text style={styles.status}>{statusLabel[delivery.status]}</Text>

			{delivery.status !== 'pending' && delivery.status !== 'delivered' && (
				<Text style={styles.eta}>{delivery.etaMinutes} min</Text>
			)}

			{delivery.status === 'pending' && (
				<Pressable
					style={styles.button}
					onPress={handleConfirm}>
					<Text style={styles.buttonText}>Confirmer la livraison</Text>
				</Pressable>
			)}

			{(delivery.status === 'on_the_way' || delivery.status === 'arriving') && (
				<Pressable
					style={[styles.button, styles.buttonDanger]}
					onPress={handleCancel}>
					<Text style={styles.buttonText}>Annuler</Text>
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
	order: { fontSize: 16, color: '#888', marginBottom: 24 },
	status: { fontSize: 20, marginBottom: 8 },
	eta: { fontSize: 48, fontWeight: 'bold', color: '#007AFF', marginBottom: 32 },
	button: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 32,
		paddingVertical: 14,
		borderRadius: 12,
		marginTop: 12,
	},
	buttonDanger: { backgroundColor: '#FF3B30' },
	buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
