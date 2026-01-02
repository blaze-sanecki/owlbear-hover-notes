import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./constants";

OBR.onReady(async () => {
	const params = new URLSearchParams(window.location.search);
	const url = params.get('url');

	if (url) {
		const img = document.getElementById('note-image') as HTMLImageElement;

		img.onload = async () => {
			const viewportWidth = await OBR.viewport.getWidth();
			const viewportHeight = await OBR.viewport.getHeight();
			const MAX_WIDTH = viewportWidth * 0.5;
			const MAX_HEIGHT = viewportHeight * 0.5;

			let width = img.naturalWidth;
			let height = img.naturalHeight;

			if (width > MAX_WIDTH || height > MAX_HEIGHT) {
				const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
				width *= ratio;
				height *= ratio;
			}

			width = Math.round(width);
			height = Math.round(height);

			await OBR.popover.setWidth(`${ID}/popover`, width);
			await OBR.popover.setHeight(`${ID}/popover`, height);
		};

		img.src = url;
		img.style.cursor = 'pointer';

		img.addEventListener('click', async () => {
			await OBR.popover.close(`${ID}/popover`);
		});
	}
});
