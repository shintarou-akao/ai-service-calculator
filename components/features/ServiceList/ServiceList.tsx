import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AIServiceSummary } from "@/types";

interface ServiceListProps {
  filteredServices: AIServiceSummary[];
  handleServiceSelect: (service: AIServiceSummary) => void;
}

export function ServiceList({
  filteredServices,
  handleServiceSelect,
}: ServiceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredServices.map((service) => (
        <Card
          key={service.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleServiceSelect(service)}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <Image
              src={service.logoPath}
              alt={`${service.name} logo`}
              width={60}
              height={60}
              className="rounded-full"
            />
            <div>
              <CardTitle className="text-xl">{service.name}</CardTitle>
              <CardDescription className="text-gray-600">
                {service.provider}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{service.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
