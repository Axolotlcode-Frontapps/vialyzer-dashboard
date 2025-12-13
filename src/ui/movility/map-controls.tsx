import { useEffect, useRef } from "react";

interface MapControlsProps {
	map: google.maps.Map | null;
	showMarkers: boolean;
	onToggleMarkers: () => void;
	markerColor: string;
	onColorChange: (color: string) => void;
}

const MARKER_COLORS = [
	{ name: "Azul", value: "#2563eb" },
	{ name: "Rojo", value: "#dc2626" },
	{ name: "Verde", value: "#16a34a" },
	{ name: "Naranja", value: "#ea580c" },
	{ name: "Morado", value: "#9333ea" },
	{ name: "Rosa", value: "#db2777" },
];

export function MapControls({
	map,
	showMarkers,
	onToggleMarkers,
	markerColor,
	onColorChange,
}: MapControlsProps) {
	const controlDivRef = useRef<HTMLDivElement | null>(null);
	const colorPickerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!map) {
			console.log("MapControls: No map available");
			return;
		}

		console.log("MapControls: Setting up controls");

		// Crear contenedor principal
		const controlDiv = document.createElement("div");
		controlDiv.style.margin = "10px";
		controlDivRef.current = controlDiv;

		// Crear contenedor de botones
		const buttonContainer = document.createElement("div");
		buttonContainer.style.backgroundColor = "white";
		buttonContainer.style.borderRadius = "2px";
		buttonContainer.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px";
		buttonContainer.style.cursor = "pointer";
		buttonContainer.style.marginBottom = "10px";
		buttonContainer.style.textAlign = "center";

		// Botón de toggle cámaras
		const toggleButton = document.createElement("button");
		toggleButton.style.backgroundColor = "white";
		toggleButton.style.border = "none";
		toggleButton.style.outline = "none";
		toggleButton.style.width = "40px";
		toggleButton.style.height = "40px";
		toggleButton.style.borderRadius = "2px";
		toggleButton.style.cursor = "pointer";
		toggleButton.style.margin = "0";
		toggleButton.style.padding = "0";
		toggleButton.title = showMarkers ? "Ocultar cámaras" : "Mostrar cámaras";
		toggleButton.innerHTML = showMarkers
			? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`
			: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2.5 3H21a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path></svg>`;

		toggleButton.addEventListener("click", (e) => {
			e.stopPropagation();
			onToggleMarkers();
		});

		toggleButton.addEventListener("mouseenter", () => {
			toggleButton.style.backgroundColor = "#ebebeb";
		});

		toggleButton.addEventListener("mouseleave", () => {
			toggleButton.style.backgroundColor = "white";
		});

		// Botón de color
		const colorButton = document.createElement("button");
		colorButton.style.backgroundColor = "white";
		colorButton.style.border = "none";
		colorButton.style.outline = "none";
		colorButton.style.width = "40px";
		colorButton.style.height = "40px";
		colorButton.style.borderRadius = "2px";
		colorButton.style.cursor = "pointer";
		colorButton.style.margin = "0";
		colorButton.style.padding = "0";
		colorButton.style.borderTop = "1px solid #e0e0e0";
		colorButton.title = "Cambiar color de marcadores";
		colorButton.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${markerColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`;

		colorButton.addEventListener("mouseenter", () => {
			colorButton.style.backgroundColor = "#ebebeb";
		});

		colorButton.addEventListener("mouseleave", () => {
			colorButton.style.backgroundColor = "white";
		});

		// Panel de colores
		const colorPicker = document.createElement("div");
		colorPicker.style.display = "none";
		colorPicker.style.position = "absolute";
		colorPicker.style.right = "50px";
		colorPicker.style.bottom = "0";
		colorPicker.style.backgroundColor = "white";
		colorPicker.style.borderRadius = "2px";
		colorPicker.style.boxShadow = "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px";
		colorPicker.style.padding = "8px";
		colorPicker.style.display = "grid";
		colorPicker.style.gridTemplateColumns = "repeat(3, 1fr)";
		colorPicker.style.gap = "8px";
		colorPicker.style.display = "none";
		colorPickerRef.current = colorPicker;

		MARKER_COLORS.forEach((color) => {
			const colorBtn = document.createElement("button");
			colorBtn.style.width = "30px";
			colorBtn.style.height = "30px";
			colorBtn.style.borderRadius = "4px";
			colorBtn.style.border =
				markerColor === color.value ? `3px solid ${color.value}` : "2px solid #e0e0e0";
			colorBtn.style.backgroundColor = color.value;
			colorBtn.style.cursor = "pointer";
			colorBtn.style.padding = "0";
			colorBtn.title = color.name;

			colorBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				onColorChange(color.value);
				colorPicker.style.display = "none";
			});

			colorBtn.addEventListener("mouseenter", () => {
				colorBtn.style.transform = "scale(1.1)";
			});

			colorBtn.addEventListener("mouseleave", () => {
				colorBtn.style.transform = "scale(1)";
			});

			colorPicker.appendChild(colorBtn);
		});

		colorButton.addEventListener("click", (e) => {
			e.stopPropagation();
			const isHidden = colorPicker.style.display === "none";
			colorPicker.style.display = isHidden ? "grid" : "none";
		});

		// Cerrar color picker al hacer clic fuera
		const handleClickOutside = () => {
			if (colorPicker.style.display !== "none") {
				colorPicker.style.display = "none";
			}
		};

		document.addEventListener("click", handleClickOutside);

		// Ensamblar todo
		buttonContainer.appendChild(toggleButton);
		buttonContainer.appendChild(colorButton);
		controlDiv.appendChild(buttonContainer);
		controlDiv.appendChild(colorPicker);

		// Agregar al mapa
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
		console.log("MapControls: Controls added successfully");

		// Cleanup
		return () => {
			console.log("MapControls: Cleaning up");
			document.removeEventListener("click", handleClickOutside);
			if (controlDivRef.current && map) {
				const controls = map.controls[google.maps.ControlPosition.RIGHT_BOTTOM];
				const index = controls.getArray().indexOf(controlDivRef.current);
				if (index > -1) {
					controls.removeAt(index);
				}
			}
		};
	}, [map]);

	// Actualizar cuando cambien las props
	useEffect(() => {
		if (!controlDivRef.current) return;

		const toggleButton = controlDivRef.current.querySelector(
			"button:first-child"
		) as HTMLButtonElement;
		const colorButton = controlDivRef.current.querySelector(
			"button:last-child"
		) as HTMLButtonElement;

		if (toggleButton) {
			toggleButton.title = showMarkers ? "Ocultar cámaras" : "Mostrar cámaras";
			toggleButton.innerHTML = showMarkers
				? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`
				: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2.5 3H21a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path></svg>`;
		}

		if (colorButton) {
			colorButton.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${markerColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`;
		}

		// Actualizar bordes de los botones de color
		if (colorPickerRef.current) {
			const colorButtons = colorPickerRef.current.querySelectorAll("button");
			colorButtons.forEach((btn, index) => {
				const color = MARKER_COLORS[index];
				btn.style.border =
					markerColor === color.value ? `3px solid ${color.value}` : "2px solid #e0e0e0";
			});
		}
	}, [showMarkers, markerColor]);

	return null;
}
