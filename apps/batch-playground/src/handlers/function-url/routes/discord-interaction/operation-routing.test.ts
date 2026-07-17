import { describe, expect, it } from "vitest";
import { findInteractionOperation } from "./operation-routing.js";
import { autocompleteOperation } from "./operations/autocomplete-operation.js";
import { helloCommandOperation } from "./operations/hello-command-operation.js";
import { pingOperation } from "./operations/ping-operation.js";
import { playCheckReminderOperation } from "./operations/play-check-reminder-operation.js";

describe("findInteractionOperation", () => {
	it("PING と autocomplete をフラットな key から routing する", () => {
		expect(findInteractionOperation({ type: 1 })).toBe(pingOperation);
		expect(findInteractionOperation({ type: 4 })).toBe(autocompleteOperation);
	});

	it("/command を {commandName}-command で routing する", () => {
		expect(findInteractionOperation({ type: 2, commandName: "hello" })).toBe(
			helloCommandOperation,
		);
	});

	it("message component を {prefix}-message で routing する", () => {
		expect(
			findInteractionOperation({
				type: 3,
				customId: "play-check-reminder:123:won",
			}),
		).toBe(playCheckReminderOperation);
	});

	it("どの route 定義にも一致しない interaction には operation を返さない", () => {
		expect(
			findInteractionOperation({ type: 2, commandName: "unknown" }),
		).toBeUndefined();
		expect(
			findInteractionOperation({ type: 3, customId: "unknown:123:won" }),
		).toBeUndefined();
		expect(
			findInteractionOperation({
				type: 3,
				customId: "play-check-reminder-other:123:won",
			}),
		).toBeUndefined();
		expect(findInteractionOperation({ type: 99 })).toBeUndefined();
	});
});
