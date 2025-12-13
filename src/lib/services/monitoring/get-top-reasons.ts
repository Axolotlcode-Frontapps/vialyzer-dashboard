import type { AxiosInstance } from "axios";

export interface TopReasonData {
	reason: string;
	total: number;
}

function getCurrentMonthRange(): { start_date: string; end_date: string } {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth(); // 0-indexed
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	// Format YYYY-MM-DD
	const format = (date: Date) => date.toISOString().slice(0, 10);

	return {
		start_date: format(firstDay),
		end_date: format(lastDay),
	};
}

interface GetTopReasonsParams {
	start_date?: string;
	end_date?: string;
}

export const getTopReasons = async (instance: AxiosInstance, params: GetTopReasonsParams = {}) => {
	// Si no mandaron start_date o end_date, usar valores por defecto del mes actual
	const { start_date, end_date } = {
		...getCurrentMonthRange(),
		...params,
	};

	try {
		const response = await instance.get<GeneralResponse<TopReasonData[]>>(
			"/kpi/kpis-rejected-top",
			{
				params: {
					start_date,
					end_date,
				},
			}
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener los motivos de rechazo");
		}

		return response.data.payload;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
