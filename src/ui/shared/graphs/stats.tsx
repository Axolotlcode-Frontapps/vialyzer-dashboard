import { Fragment } from "react";

import { Separator } from "../separator";

interface Props {
	info: {
		label: string;
		content: string[];
	}[];
}

export function Stats({ info }: Props) {
	return (
		<div className="flex items-center justify-center gap-2 text-muted-foreground text-sm font-normal flex-wrap">
			{info.map((item, index) => (
				<Fragment key={`${index + 0}`}>
					<p className="text-muted-foreground font-normal text-sm min-w-max">
						{item.label}
						<span className="w-full flex flex-wrap items-center justify-center gap-4">
							{item.content.map((content, i) => (
								<span key={`${i + 0}`}>{content}</span>
							))}
						</span>
					</p>
					{index < info.length - 1 ? (
						<Separator
							orientation="vertical"
							className="data-[orientation=vertical]:h-10"
						/>
					) : null}
				</Fragment>
			))}
		</div>
	);
}
