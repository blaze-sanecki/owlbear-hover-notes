import OBR from "@owlbear-rodeo/sdk";
import type { ToolContext, ToolEvent } from "@owlbear-rodeo/sdk";
import { ID } from "./constants";

let lastHoveredId: string | null = null;

export async function setupTool() {
	await OBR.tool.createMode({
		id: `${ID}/mode`,
		icons: [{ icon: "/images/icon-view.svg", label: "View Notes" }],
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
						height: 400,
						width: 400,
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

	await OBR.tool.create({
		id: `${ID}/tool`,
		icons: [{ icon: "/images/icon.svg", label: "View Notes" }],
		defaultMode: `${ID}/mode`,
	});
}
