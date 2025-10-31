import type { UserDataProps } from "./types";

export function UserData({ user }: UserDataProps) {
	const data = [
		{
			title: "Nombres",
			description: user.name,
		},
		{
			title: "Apellidos",
			description: user.lastname,
		},
		{
			title: "Correo electrónico",
			description: user.email,
		},
		{
			title: "Número de telefono",
			description: user.phone,
		},
		{
			title: "Rol",
			description: user.role.name,
		},
		{
			title: "Empresa",
			description: user.company.name,
		},
	];

	return (
		<section className="p-4">
			<h2 className="text-xl font-bold">Datos de usuario</h2>
			<p className="text-base text-muted-foreground">
				Aquí puedes ver los datos personales del usuario.
			</p>
			<article className="mt-4">
				{data.map((item) => (
					<div key={item.title} className="mt-2">
						<h3 className="text-lg">{item.title}</h3>
						<p className="text-sm text-muted-foreground">{item.description}</p>
					</div>
				))}
			</article>
		</section>
	);
}
