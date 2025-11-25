import { Fragment } from "react";

interface Props {
	header: {
		value?: string;
		label: string;
		color: string;
		type?: "line" | "bar";
	}[];
}

export function GraphHeader({ header }: Props) {
	return (
		<div className="flex items-center justify-start gap-4 overflow-x-auto snap-x snap-mandatory">
			{header.map((item, index) =>
				item.type === "line" ? (
					<Fragment key={`${index + 0}`}>
						<p className="snap-center flex-[.125] min-w-max text-start text-xs flex items-center justify-start gap-2">
							<span
								className="rounded-[2px] w-3.5 h-1 min-w-3.5 block"
								style={{ backgroundColor: item.color }}
							/>
							{item.label}
						</p>
					</Fragment>
				) : (
					<Fragment key={`${index + 0}`}>
						<p className="snap-center flex-[.125] min-w-max text-start text-xs">
							<span className="flex items-center font-semibold text-sm text-foreground justify-start gap-2">
								<span
									className="rounded-[2px] size-3.5 min-w-3.5 block"
									style={{ backgroundColor: item.color }}
								/>
								{item.value ?? 0}
							</span>
							{item.label}
						</p>
					</Fragment>
				)
			)}
		</div>
	);
}
