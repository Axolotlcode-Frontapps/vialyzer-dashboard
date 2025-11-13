import type { AxiosInstance } from "axios";

export interface RemoveDatasourceBody {
	id: string;
}

export async function removeDatasource(
	instance: AxiosInstance,
	body: RemoveDatasourceBody
) {
	try {
		const response = await instance.delete(`/datasources/delete/${body.id}`);

		if (response.status !== 200 && response.status !== 201) {
			throw new Error(`Error deleting datasource: ${response.status}`);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to delete datasource: ${error.message}`);
		}
		throw new Error(`Failed to delete datasource: ${String(error)}`);
	}
}

export async function removeScenarioLine(
	instance: AxiosInstance,
	body: RemoveDatasourceBody
) {
	try {
		const response = await instance.delete(`/sceneries/delete/${body.id}`);

		if (response.status !== 200 && response.status !== 201) {
			throw new Error(`Error deleting scenario line: ${response.status}`);
		}

		return response.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to delete scenario line: ${error.message}`);
		}
		throw new Error(`Failed to delete scenario line: ${String(error)}`);
	}
}
