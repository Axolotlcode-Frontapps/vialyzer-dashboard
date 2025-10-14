type TFilterVariant = "dropdown" | "range";

interface GeneralResponse<T> {
	success?: boolean;
	message?: string;
	errors?: string[];
	details?: string;
	payload?: T;
}

interface ErrorResponse {
	detail?: {
		success: boolean;
		message: string;
		errors: string[];
	};
}

interface Filters {
	label: string;
	name: string;
	type: TFilterVariant;
	mode?: "single" | "multiple";
	options: { label: string; value: string }[];
}

interface AuthLoaderData {
	token: string;
	appToken?: string;
	refreshToken?: string;
	refreshTokenExpiration?: string;
	api: string;
}

interface AuthLoaderDataWithParams extends AuthLoaderData {
	project: string;
	camera: string;
}

interface AuthLoaderDataWithProject extends AuthLoaderData {
	project: string;
}
