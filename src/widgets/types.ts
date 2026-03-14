export type DeliveryStatus =
  | 'pending'
  | 'confirmed'
  | 'on_the_way'
  | 'arriving'
  | 'delivered';

export type DeliveryProps = {
  status: DeliveryStatus;
  etaMinutes: number;
  orderNumber: string;
};
