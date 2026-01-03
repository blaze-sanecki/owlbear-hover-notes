import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./constants";

OBR.onReady(async () => {
	const params = new URLSearchParams(window.location.search);
	const url = params.get('url');
	const itemId = params.get('id');

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

		if (itemId) {
			const startTime = Date.now();
			let isChecking = false;
			window.addEventListener('mousemove', async (event) => {
				if (Date.now() - startTime < 500) return;
				if (isChecking) return;
				isChecking = true;

				try {
					const scale = await OBR.viewport.getScale();
					const bounds = await OBR.scene.items.getItemBounds([itemId]);

					const width = window.innerWidth;
					const height = window.innerHeight;

					// Center of popover (local)
					const cx = width / 2;
					const cy = height / 2;

					// Mouse offset from center (pixels)
					const dx = event.clientX - cx;
					const dy = event.clientY - cy;

					// Convert to world units
					const dxWorld = dx / scale;
					const dyWorld = dy / scale;

					// Token center (world)
					const tokenCenter = bounds.center;

					// Mouse position (world)
					const mouseWorldX = tokenCenter.x + dxWorld;
					const mouseWorldY = tokenCenter.y + dyWorld;

					if (
						mouseWorldX < bounds.min.x ||
						mouseWorldX > bounds.max.x ||
						mouseWorldY < bounds.min.y ||
						mouseWorldY > bounds.max.y
					) {
						await OBR.popover.close(`${ID}/popover`);
					}
				} catch (e) {
					console.error("Error checking bounds", e);
				} finally {
					isChecking = false;
				}
			});
		}
	}
});
