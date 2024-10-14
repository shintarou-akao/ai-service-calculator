"use client";

import { Skeleton } from "@/components/ui/skeleton";

const ServiceSkeleton = () => (
  <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
);

export default ServiceSkeleton;
