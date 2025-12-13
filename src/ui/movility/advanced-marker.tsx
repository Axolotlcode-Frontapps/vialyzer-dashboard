import { useEffect, useRef } from "react";

interface AdvancedMarkerProps {
	map: google.maps.Map | null;
	position: {
		lat: number;
		lng: number;
	};
	onClick?: () => void;
	isSelected?: boolean;
	color?: string;
	visible?: boolean;
}

export function AdvancedMarker({
	map,
	position,
	onClick,
	isSelected = false,
	color = "#0f3227",
	visible = true,
}: AdvancedMarkerProps) {
	const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!map || !window.google?.maps?.marker) return;

		const markerColor = isSelected ? color : `${color}`;

		// Crear el contenido HTML del marcador
		const content = document.createElement("div");
		content.style.width = "48px";
		content.style.height = "64px";
		content.style.cursor = "pointer";
		content.style.transition = "transform 0.2s";
		content.style.display = visible ? "block" : "none";

		content.innerHTML = `
      <svg width='36' height='52' viewBox='0 0 48 64' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <filter id='shadow-${position.lat}-${position.lng}' x='0' y='0' width='48' height='64'>
            <feDropShadow dx='0' dy='4' stdDeviation='4' flood-color='rgba(0,0,0,0.3)'/>
          </filter>
        </defs>
        <g filter='url(#shadow-${position.lat}-${position.lng})'>
          <path d='M24 64C24 64 48 40.8 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 40.8 24 64 24 64Z' fill='${markerColor}'/>
          <circle cx='24' cy='24' r='12' fill='white'/>
          <g>
            <rect x='18' y='20' width='12' height='8' rx='2' fill='${markerColor}'/>
            <circle cx='24' cy='24' r='2' fill='white'/>
          </g>
        </g>
      </svg>
    `;

		contentRef.current = content;

		// Crear el Advanced Marker
		const marker = new google.maps.marker.AdvancedMarkerElement({
			map,
			position,
			content,
			title: "Camera Location",
		});

		// Agregar evento de click
		if (onClick) {
			marker.addListener("click", onClick);
		}

		// Hover effect
		content.addEventListener("mouseenter", () => {
			content.style.transform = "scale(1.1)";
		});

		content.addEventListener("mouseleave", () => {
			content.style.transform = "scale(1)";
		});

		markerRef.current = marker;

		// Cleanup
		return () => {
			if (markerRef.current) {
				markerRef.current.map = null;
			}
		};
	}, [map, position.lat, position.lng, onClick, color, visible, isSelected]);

	// Actualizar el estilo cuando cambia isSelected
	useEffect(() => {
		if (!contentRef.current) return;

		// Mostrar u ocultar el contenido del marcador
		contentRef.current.style.display = visible ? "block" : "none";

		// Cambiar el color sin recrear el marcador
		const markerColor = isSelected ? color : `${color}aa`;
		const svg = contentRef.current.querySelector("svg");
		if (svg) {
			const paths = svg.querySelectorAll("path[fill], rect[fill]");
			paths.forEach((path, index) => {
				// index 0 = path principal del pin
				// index 2 = rect de la cámara
				if (index === 0 || index === 2) {
					path.setAttribute("fill", markerColor);
				}
			});
		}

		// Hacer un pequeño "bounce" cuando se selecciona
		if (isSelected) {
			contentRef.current.style.transform = "scale(1.15)";
			setTimeout(() => {
				if (contentRef.current) {
					contentRef.current.style.transform = "scale(1)";
				}
			}, 200);
		}
	}, [isSelected, color, visible]);

	return null;
}
