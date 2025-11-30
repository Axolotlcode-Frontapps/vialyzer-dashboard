import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-adapter";
import { useHasPermission } from "@/hooks/use-permissions";

import { profileSchemas } from "@/lib/schemas/profile";
import { usersService } from "@/lib/services/users";
import { hasModule } from "@/lib/utils/permissions";
import { Account } from "@/ui/profile/account";
import { PasswordSection } from "@/ui/profile/password-form";
import { ProfileUser } from "@/ui/profile/profile-user";
import { HasPermission } from "@/ui/shared/permissions/has-permission";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/shared/tabs";

export const Route = createFileRoute("/_dashboard/profile")({
	component: Profile,
	validateSearch: zodValidator(profileSchemas.profile),
	beforeLoad: async ({
		context: {
			permissions: { user },
		},
	}) => {
		if (!user) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}

		const hasRoleModule = hasModule("perfil", user);

		if (!hasRoleModule) {
			throw redirect({
				to: "/",
				replace: true,
			});
		}
	},
});

function Profile() {
	const navigate = Route.useNavigate();
	const { tab } = Route.useSearch();

	const { hasPermission } = useHasPermission();

	const options = [
		{
			value: "account",
			label: "Información de la cuenta",
		},
		{
			value: "password",
			label: "Cambiar contraseña",
			hasPermission: hasPermission("users", "update-user"),
		},
	];

	const { data: userData } = useQuery({
		queryKey: ["get-me"],
		queryFn: async () => await usersService.getMeUser(),
		select: (data) => data.payload,
	});

	function changeTab(value: "account" | "password") {
		navigate({
			search: {
				tab: value,
			},
		});
	}

	return (
		<div className="w-full max-w-7xl mx-auto">
			<h1 className="mb-6 text-2xl font-bold">Mi perfil</h1>
			<div className="flex flex-col lg:flex-row gap-4">
				{userData && (
					<>
						<ProfileUser user={userData} />
						<Tabs
							defaultValue={tab}
							className="w-full bg-card min-w-sm rounded-lg flex flex-col  border-border border"
						>
							<div className="w-full overflow-hidden">
								<div className="overflow-x-auto">
									<TabsList className="bg-transparent inline-flex whitespace-nowrap">
										{options.map((option) =>
											option.hasPermission !== false ? (
												<TabsTrigger
													key={option.value}
													value={option.value}
													className="whitespace-nowrap"
													onClick={() => changeTab(option.value as "account" | "password")}
												>
													{option.label}
												</TabsTrigger>
											) : null
										)}
									</TabsList>
								</div>
							</div>

							<TabsContent value="account">
								<Account user={userData} />
							</TabsContent>
							<HasPermission moduleBase="users" permissionName="update-user">
								<TabsContent value="password">
									<PasswordSection />
								</TabsContent>
							</HasPermission>
						</Tabs>
					</>
				)}
			</div>
		</div>
	);
}
