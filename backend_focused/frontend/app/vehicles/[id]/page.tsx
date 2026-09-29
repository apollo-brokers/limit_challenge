import { notFound } from 'next/navigation';
import { VehicleDetailScreen } from './components/vehicle-detail-screen';

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicleId = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(vehicleId) || vehicleId < 1) notFound();
  return <VehicleDetailScreen id={vehicleId} />;
}
