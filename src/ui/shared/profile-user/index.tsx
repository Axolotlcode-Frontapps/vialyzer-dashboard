import type { ProfileUserProps } from "./types";

import UserDefault from "@/assets/images/user-default.png";
import { Role } from "@/ui/shared/role";

export function ProfileUser({
	username,
	roleId,
	email,
	company,
}: ProfileUserProps) {
	return (
		<section className="bg-card rounded-lg flex flex-col justify-center items-center border-border border w-full lg:max-w-md py-4 h-fit">
			<div className="w-[150px] h-[150px] rounded-full border border-border flex justify-center items-center my-4">
				<img
					src={UserDefault}
					alt="Imagen de usuario"
					className="w-full h-full rounded-full object-cover brightness-200"
				/>
			</div>
			<div className="w-full flex flex-col bg-card items-center justify-center rounded-b-lg divide-y divide-border px-4">
				<span className="text-[23px] font-semibold leading-[1.7]">
					{username}
				</span>
				<span className="mb-2">{email}</span>
				<Role className="text-base" idRole={roleId} />
				<span className="mb-2">{company}</span>
			</div>
		</section>
	);
}
