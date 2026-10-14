import { getWhatsAppNumber } from "@/lib/settings";
import CarDetailView from "@/components/CarDetailView";

interface CarDetailPageProps {
  params: { id: string };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const whatsappNumber = await getWhatsAppNumber();
  return <CarDetailView id={params.id} whatsappNumber={whatsappNumber} />;
}
