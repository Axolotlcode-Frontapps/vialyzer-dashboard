export interface Vehicle {
	id: string;
	name: string;
	color: string;
}

export const VEHICLES: Vehicle[] = [
	{ id: "car", name: "Car", color: "#212D55" },
	{ id: "motorcycle", name: "Motorcycle", color: "#3357A3" },
	{ id: "bicycle", name: "Bicycle", color: "#E94D62" },
	{ id: "van", name: "Van", color: "#AE0C4D" },
	{ id: "truck", name: "Truck", color: "#522154" },
	{ id: "heavy-truck", name: "Heavy Truck", color: "#9633A3" },
	{ id: "bus", name: "Bus", color: "#D855B4" },
	{ id: "person", name: "Person", color: "#5A7CE8" },
];
