import { Button, Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, WidgetBase } from 'expo-widgets';
import { DeliveryProps } from './types';

const DeliveryWidget = (props: WidgetBase<DeliveryProps>) => {
	'widget';

	if (props.status === 'delivered') {
		return (
			<VStack modifiers={[padding({ all: 12 })]}>
				<Image
					systemName="checkmark.circle.fill"
					color="#34C759"
				/>
				<Text modifiers={[font({ weight: 'bold', size: 16 })]}>Livré ✅</Text>
				<Text modifiers={[font({ size: 12 }), foregroundStyle('#888888')]}>
					Commande #{props.orderNumber}
				</Text>
			</VStack>
		);
	}

	if (props.status === 'pending') {
		return (
			<VStack modifiers={[padding({ all: 12 })]}>
				<Image
					systemName="shippingbox.fill"
					color="#007AFF"
				/>
				<Text modifiers={[font({ weight: 'bold', size: 14 })]}>
					Commande #{props.orderNumber}
				</Text>
				<Text modifiers={[font({ size: 12 }), foregroundStyle('#888888')]}>
					En attente de confirmation
				</Text>
				<Button
					label="Confirmer"
					target="confirm"
					onPress={() => ({
						status: 'confirmed',
						etaMinutes: 15,
						orderNumber: props.orderNumber,
					})}
				/>
			</VStack>
		);
	}

	return (
		<VStack modifiers={[padding({ all: 12 })]}>
			<Image
				systemName="box.truck.fill"
				color="#007AFF"
			/>
			<Text modifiers={[font({ size: 12 }), foregroundStyle('#888888')]}>
				Commande #{props.orderNumber}
			</Text>
			<Text modifiers={[font({ weight: 'bold', size: 16 })]}>
				Votre colis arrive 🚚
			</Text>
			<Text modifiers={[font({ size: 12 }), foregroundStyle('#007AFF')]}>
				Livraison en cours
			</Text>
		</VStack>
	);
};

export default createWidget('DeliveryWidget', DeliveryWidget);
