import {createFileRoute} from "@tanstack/react-router";
import {useQuery} from "@tanstack/react-query";

import {homeService} from "@/lib/services/home";
import {CamerasPreview} from "@/ui/home/cameras-preview";
import {Maps} from "@/ui/shared/maps";
// import { MapDetails } from "@/ui/shared/maps/map-details";

export const Route = createFileRoute("/_dashboard/")({
    component: Home,
    // validateSearch: zodValidator(filtersSchemas.map),
});

function Home() {
    useQuery({
        queryKey: ["get-cameras"],
        queryFn: async () => await homeService.getCameras(),
        select: (data) => data.payload || [],
    });

    return (
        <div className="space-y-4">
            <h2 className="text-xl lg:text-2xl font-medium">
                Localización de Cámaras
            </h2>
            <div
                className="@container/map relative w-full h-[400px] md:h-[650px] rounded-2xl overflow-hidden bg-card shadow-lg">
                <Maps/>
                {/* <MapDetails /> */}
            </div>

            <h2 className="text-xl lg:text-2xl font-medium">Previews de Cámaras</h2>
            <CamerasPreview/>
        </div>
    );
}
