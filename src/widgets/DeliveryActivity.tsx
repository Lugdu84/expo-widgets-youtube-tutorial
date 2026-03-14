import { HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';
import { DeliveryProps } from './types';

const DeliveryActivity = (props?: DeliveryProps) => {
	'widget';

	const status = props?.status ?? 'on_the_way';
	const eta = props?.etaMinutes ?? 0;
	const order = props?.orderNumber ?? '';
	const delivered = status === 'delivered';

	const label = delivered
		? 'Colis livré !'
		: status === 'arriving'
			? 'Presque là 📦'
			: 'En route 🚚';

	const icon = delivered ? 'checkmark.circle.fill' : 'box.truck.fill';
	const iconColor = delivered ? '#34C759' : '#007AFF';

	return {
		banner: (
			<HStack modifiers={[padding({ all: 12 })]}>
				<Image
					systemName={icon}
					color={iconColor}
				/>
				<VStack>
					<Text modifiers={[font({ weight: 'bold' })]}>{label}</Text>
					<Text modifiers={[font({ size: 12 }), foregroundStyle('#888888')]}>
						Commande #{order}
					</Text>
				</VStack>
				<Text
					modifiers={[
						font({ weight: 'bold', size: 20 }),
						foregroundStyle(delivered ? '#34C759' : '#007AFF'),
					]}>
					{delivered ? '✅' : eta + ' min'}
				</Text>
			</HStack>
		),

		compactLeading: (
			<HStack>
				<Image
					systemName={icon}
					color={iconColor}
				/>
			</HStack>
		),

		compactTrailing: delivered ? (
			<Text modifiers={[font({ weight: 'bold' }), foregroundStyle('#34C759')]}>
				Livré ✅
			</Text>
		) : (
			<Text modifiers={[font({ weight: 'bold' }), foregroundStyle('#007AFF')]}>
				{eta} min
			</Text>
		),

		minimal: (
			<Image
				systemName={icon}
				color={iconColor}
			/>
		),

		expandedLeading: (
			<VStack modifiers={[padding({ all: 8 })]}>
				<Image
					systemName={icon}
					color={iconColor}
				/>
				<Text modifiers={[font({ size: 11 })]}>
					{delivered ? 'Livré' : 'Livraison'}
				</Text>
			</VStack>
		),

		expandedTrailing: delivered ? (
			<VStack modifiers={[padding({ all: 8 })]}>
				<Text modifiers={[font({ weight: 'bold', size: 24 })]}>✅</Text>
				<Text modifiers={[font({ size: 11 }), foregroundStyle('#34C759')]}>
					Terminé
				</Text>
			</VStack>
		) : (
			<VStack modifiers={[padding({ all: 8 })]}>
				<Text
					modifiers={[
						font({ weight: 'bold', size: 24 }),
						foregroundStyle('#007AFF'),
					]}>
					{eta}
				</Text>
				<Text modifiers={[font({ size: 11 })]}>minutes</Text>
			</VStack>
		),

		expandedBottom: delivered ? (
			<VStack>
				<Text
					modifiers={[
						font({ weight: 'bold', size: 14 }),
						foregroundStyle('#34C759'),
					]}>
					Votre colis a été livré — Commande #{order}
				</Text>
			</VStack>
		) : (
			<Text modifiers={[font({ size: 12 }), foregroundStyle('#888888')]}>
				{label} — Commande #{order}
			</Text>
		),
	};
};

export default createLiveActivity('DeliveryActivity', DeliveryActivity);
