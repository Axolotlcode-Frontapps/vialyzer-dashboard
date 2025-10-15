export function Footer() {
	return (
		<footer className="flex flex-row items-center justify-between bg-white dark:bg-gray-800 shadow-sm p-4">
			<div className="text-center text-gray-600 dark:text-gray-300 text-sm">
				© 2025 Nutrition-lab. All rights reserved.
			</div>
			<div className="text-center text-gray-600 dark:text-gray-300 text-sm">
				Developed by{" "}
				<a
					href="https://axolotlcode.tech"
					className="text-pink-500 hover:text-pink-600"
				>
					axolotlcode
				</a>
			</div>
		</footer>
	);
}
