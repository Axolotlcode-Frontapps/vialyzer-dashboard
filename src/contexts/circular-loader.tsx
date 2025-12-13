import { createContext, useContext, useState } from "react";

const CircularLoaderContext = createContext<{
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
}>({
	isLoading: false,
	setIsLoading: () => null,
});

export function CircularLoaderProvider({ children }: { children: React.ReactNode }) {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<CircularLoaderContext.Provider value={{ isLoading, setIsLoading }}>
			{children}
		</CircularLoaderContext.Provider>
	);
}

export function useCircularLoader() {
	return useContext(CircularLoaderContext);
}
