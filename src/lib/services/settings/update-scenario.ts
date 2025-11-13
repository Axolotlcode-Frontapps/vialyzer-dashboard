import type { AxiosInstance } from "axios";
import type {
	CreateDatasourceBody,
	CreateScenarioLineBody,
} from "./add-scenario";

export async function updateScenarioLine(
	instance: AxiosInstance,
	body: CreateScenarioLineBody,
	id: string
) {
	try {
		const response = await instance.put(`/sceneries/put/${id}`, body);

		if (response.status !== 200 && response.status !== 201) {
			throw new Error(`Error editing scenario line: ${response.status}`);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to edit scenario line: ${error.message}`);
		}
		throw new Error(`Failed to edit scenario line: ${String(error)}`);
	}
}

export async function updateDatasource(
	instance: AxiosInstance,
	body: CreateDatasourceBody,
	id: string
) {
	try {
		const response = await instance.put(`/datasources/update/${id}`, body);

		if (response.status !== 200 && response.status !== 201) {
			throw new Error(`Error editing datasource: ${response.status}`);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to edit datasource: ${error.message}`);
		}
		throw new Error(`Failed to edit datasource: ${String(error)}`);
	}
}
