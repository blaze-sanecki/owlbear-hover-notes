import OBR from "@owlbear-rodeo/sdk";
import type { ToolContext, ToolEvent } from "@owlbear-rodeo/sdk";
import { ID } from "./constants";

let lastHoveredId: string | null = null;

export async function setupTool() {
	await OBR.tool.create({
		id: `${ID}/tool`,
		icons: [{ icon: "/images/icon-view.svg", label: "View Hover Notes" }],
		defaultMode: `${ID}/mode-view`,
		shortcut: "Z",
	});

	OBR.tool.onToolChange(async (tool) => {
		if (tool === `${ID}/tool`) {
			OBR.tool.activateMode(`${ID}/tool`, `${ID}/mode-view`);
		}
	});

	await OBR.tool.createMode({
		id: `${ID}/mode-view`,
		icons: [{
			icon: "/images/icon-view.svg",
			label: "View Hover Notes",
			filter: {
				activeTools: [`${ID}/tool`],
			},
		}],
		shortcut: "Z",
		onToolMove: async (_context: ToolContext, event: ToolEvent) => {
			const item = event.target;
			if (item && item.id !== lastHoveredId) {
				lastHoveredId = item.id;
				const metadata = item.metadata[`${ID}/note`] as { url: string } | undefined;
				if (metadata && metadata.url) {
					const bounds = await OBR.scene.items.getItemBounds([item.id]);
					const position = await OBR.viewport.transformPoint(bounds.center);
					await OBR.popover.open({
						id: `${ID}/popover`,
						url: `/note.html?url=${encodeURIComponent(metadata.url)}&id=${item.id}`,
						height: 100,
						width: 200,
						anchorReference: "POSITION",
						anchorPosition: { left: position.x, top: position.y },
						anchorOrigin: { horizontal: "CENTER", vertical: "CENTER" },
						transformOrigin: { horizontal: "CENTER", vertical: "CENTER" },
						disableClickAway: true,
						hidePaper: true,
					});
				} else {
					await OBR.popover.close(`${ID}/popover`);
				}
			} else if (!item && lastHoveredId) {
				lastHoveredId = null;
				await OBR.popover.close(`${ID}/popover`);
			}
		},
	});

	await OBR.tool.createMode({
		id: `${ID}/mode-set`,
		icons: [{
			icon: "/images/icon-select.svg",
			label: "Set Hover Notes",
			filter: {
				activeTools: [`${ID}/tool`],
				roles: ["GM"],
			},
		}],
		shortcut: "X",
		onToolClick: async (_context: ToolContext, event: ToolEvent) => {
			const itemId = event.target?.id;
			if (!itemId) {
				return;
			}
			const images = await OBR.assets.downloadImages(false);
			if (images.length > 0) {
				const url = images[0].image.url;
				await OBR.scene.items.updateItems([itemId], (items) => {
					for (const item of items) {
						item.metadata[`${ID}/note`] = { url };
					}
				});
			}
			await OBR.player.deselect();
		}
	})

	await OBR.tool.createMode({
		id: `${ID}/mode-disable`,
		icons: [{
			icon: "/images/icon-disable.svg",
			label: "Remove Hover Notes",
			filter: {
				activeTools: [`${ID}/tool`],
				roles: ["GM"],
			},
		}],
		shortcut: "C",
		onToolClick: async (_context: ToolContext, event: ToolEvent) => {
			const itemId = event.target?.id;
			if (!itemId) {
				return;
			}
			let deleted = false;
			await OBR.scene.items.updateItems([itemId], (items) => {
				for (const item of items) {
					if (item.metadata[`${ID}/note`]) {
						delete item.metadata[`${ID}/note`];
						deleted = true;
					}
				}
			});
			await OBR.player.deselect();
			if (deleted) {
				OBR.notification.show("Hover note removed.", "WARNING");
			}
		}
	})
}