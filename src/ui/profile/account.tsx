import { useState } from "react";
import { Edit } from "lucide-react";

import { Button } from "@/ui/shared/button";
import { UserData } from "@/ui/shared/user-data";
import { HasPermission } from "../shared/permissions/has-permission";
import { UpdateUser } from "./update-form";

export interface AccountProps {
	user: User;
}

export function Account({ user }: AccountProps) {
	const [isEditing, setIsEditing] = useState(false);

	return (
		<section className="w-full relative h-full">
			<HasPermission moduleBase="users" permissionName="update-user">
				{!isEditing && (
					<Button
						size="icon"
						className="absolute top-1 right-4"
						onClick={() => setIsEditing((prev) => !prev)}
					>
						<Edit />
					</Button>
				)}
			</HasPermission>

			{isEditing ? (
				<HasPermission moduleBase="users" permissionName="update-user">
					<UpdateUser user={user} onOpenChange={setIsEditing} />
				</HasPermission>
			) : (
				<UserData user={user} />
			)}
		</section>
	);
}
