import Batallon from "@/assets/images/batallon-movimientos.png";
import Lulus from "@/assets/images/lulus-movimientos.png";
import Palmetto from "@/assets/images/palmetto-movimientos.png";
import Remedios from "@/assets/images/remedios-movimientos.png";
import Roosevelt from "@/assets/images/roosevelt-movimientos.png";
import { Route } from "@/routes/_dashboard/movility/$camera/route";

const cameras: Record<string, string> = {
	"e09a9c20-7fde-4ad3-9ac8-6482e2c36535": Remedios,
	"72a6e23e-783f-4ead-8e7e-9969f45664f7": Palmetto,
	"c1895520-7b00-41dc-a7a4-3f9d1edb52f8": Batallon,
	"0d07176a-7fc6-432e-a3fb-c124ac17ccb2": Lulus,
	"edc04997-43a1-4031-b258-9f09eefd85fb": Roosevelt,
};

export function Snapshot() {
	const { camera } = Route.useParams();
	return (
		<img
			src={cameras[camera] ?? Roosevelt}
			alt="Movimientos"
			className="aspect-video w-full object-contain rounded-md"
		/>
	);
}
