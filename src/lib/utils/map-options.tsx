export const mapContainerStyle = {
	width: "100%",
	height: "100%",
	background: "#fff",
	borderRadius: "1rem",
};

export const mapOptions = {
	disableDefaultUI: true,
	zoomControl: true,
	styles: [
		{
			featureType: "all",
			elementType: "geometry",
			stylers: [{ color: "#ffffff" }],
		},
		{
			featureType: "road",
			elementType: "geometry.stroke",
			stylers: [{ color: "#2563eb" }, { weight: 1.5 }],
		},
		{
			featureType: "water",
			elementType: "geometry",
			stylers: [{ color: "#e0e7ef" }],
		},
		{
			featureType: "poi",
			elementType: "geometry",
			stylers: [{ color: "#f3f4f6" }],
		},
		{
			featureType: "transit",
			elementType: "geometry",
			stylers: [{ color: "#e0e7ef" }],
		},
		// Oculta nombres de calles y lugares
		{
			featureType: "road",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "poi",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "transit",
			elementType: "labels",
			stylers: [{ visibility: "off" }],
		},
		{
			featureType: "administrative.locality",
			elementType: "labels.text.fill",
			stylers: [{ color: "#2563eb" }, { weight: 2 }],
		},
		{
			featureType: "administrative.locality",
			elementType: "labels.text.stroke",
			stylers: [{ color: "#fff" }, { weight: 4 }],
		},
	],
};
