import ImportCalculator from "@/components/ImportCalculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kalkulator i Importit - DriveSphere",
  description: "Kalkuloni koston totale te importit te vetures tuaj nga Korea ne Kosove.",
};

export default function CalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Kalkulator i Importit
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Vendosni te dhenat e vetures dhe merrni nje vleresim te kostos totale te importit nga Korea ne Kosove.
        </p>
      </div>
      <ImportCalculator />
    </div>
  );
}
