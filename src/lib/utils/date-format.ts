import { format } from "@formkit/tempo";

export const formatDate = (date: string) => {
	return format({
		date: date,
		format: "DD MMMM YYYY HH:mm",
		tz: "America/Bogota",
		locale: "es",
	});
};
