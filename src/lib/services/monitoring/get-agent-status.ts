import type { AxiosInstance } from "axios";

import { rangeDates } from "@/lib/utils/date-format";

export interface AgentStatusData {
	time: number;
	status: string;
}

export interface AgentStatusParams {
	start_date: Date;
	end_date: Date;
}

const getDefaultDateRange = () => {
	const { startDate, endDate } = rangeDates("30d");

	return {
		start: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
		end: new Date(`${endDate}T23:59:59.999Z`).toISOString(),
	};
};

export const getAgentStatus = async (
	instance: AxiosInstance,
	params?: AgentStatusParams
) => {
	try {
		const defaultRange = getDefaultDateRange();
		const response = await instance.get<GeneralResponse<AgentStatusData[]>>(
			"/kpi/ticket-time-status",
			{
				params: params
					? {
							start_date: params.start_date.toISOString(),
							end_date: params.end_date.toISOString(),
						}
					: {
							start_date: defaultRange.start,
							end_date: defaultRange.end,
						},
			}
		);

		if (response.status !== 200) {
			throw new Error("Error al obtener el estado de agentes");
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
};
