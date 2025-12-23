import type { Agent } from "@/types/agents";
import type { AgentValues } from "../schemas/agents";

import { fetcher } from "../utils/fetch-api";

class AgentsServices {
	async getAllAgents() {
		return await fetcher<GeneralResponse<Agent[]>>("/agents/get-all");
	}

	async createAgent(values: AgentValues) {
		const { company, role, ...rest } = values;

		return await fetcher<
			GeneralResponse<{
				idUser: string;
				idAgent: string;
				email: string;
				identification: string;
				createdAt: string;
			}>
		>("/agents/create-user-agent", {
			method: "POST",
			data: {
				...rest,
				idCompany: company,
				idRole: role,
			},
		});
	}

	async updateAgent(id: string, values: AgentValues) {
		const { company, role, password, ...rest } = values;

		return await fetcher<
			GeneralResponse<{
				idUser: string;
				idAgent: string;
				email: string;
				identification: string;
				createdAt: string;
			}>
		>(`/agents/update/${id}`, {
			method: "PUT",
			data: {
				...rest,
				idCompany: company,
				idRole: role,
			},
		});
	}

	async deleteAgent(id: string) {
		return await fetcher<GeneralResponse<Agent>>(`/agents/delete/${id}`, {
			method: "DELETE",
			data: { id },
		});
	}

	async availableAgent(values: { id: string; availability: boolean }) {
		return await fetcher<GeneralResponse<Agent>>(`/agents/availability`, {
			method: "PATCH",
			data: values,
		});
	}
}

export const agentsService = new AgentsServices();
