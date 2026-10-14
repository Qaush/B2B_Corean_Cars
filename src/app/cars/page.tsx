import CarsBrowser from "@/components/CarsBrowser";
import { CarsFilters } from "@/lib/encar-client";

interface CarsPageProps {
  searchParams: CarsFilters;
}

export default function CarsPage({ searchParams }: CarsPageProps) {
  return <CarsBrowser searchParams={searchParams} />;
}
