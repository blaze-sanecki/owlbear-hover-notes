import { defineConfig } from "vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				note: resolve(__dirname, "note.html"),
			},
		},
	},
	server: {
		cors: {
			origin: "https://www.owlbear.rodeo",
		},
	},
});