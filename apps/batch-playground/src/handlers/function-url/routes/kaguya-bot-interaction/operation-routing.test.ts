import { describe, expect, it } from "vitest";

import type { DiscordInteraction } from "@/external-protocols/discord-message/parse.js";
import { findInteractionOperation } from "./operation-routing.js";
import { inuihiroshiCommandOperation } from "./operations/inuihiroshi-command-operation.js";
import { pingOperation } from "./operations/ping-operation.js";

const commandInteraction = (name: string): DiscordInteraction => {
	return {
		kind: "application-command",
		userId: "123",
		command: { name, options: [] },
		context: { kind: "direct-message" },
	};
};

describe("findInteractionOperation", () => {
	it("PING と /inuihiroshi を明示した route で routing する", () => {
		expect(findInteractionOperation({ kind: "ping" })).toBe(pingOperation);
		expect(findInteractionOperation(commandInteraction("inuihiroshi"))).toBe(
			inuihiroshiCommandOperation,
		);
	});

	it("未対応 interaction には operation を返さない", () => {
		expect(
			findInteractionOperation(commandInteraction("unknown")),
		).toBeUndefined();
		expect(
			findInteractionOperation({ kind: "unsupported", discordType: 99 }),
		).toBeUndefined();
	});
});
