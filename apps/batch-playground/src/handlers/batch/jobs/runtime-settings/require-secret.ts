// In scope: SST link された secret 値の解決と、未 link・未設定時の日本語エラーへの変換を提供する
// Out of scope: 各 job 固有の設定型の組み立てを行う
import { Resource } from "sst/resource";

/** SST link された secret の値を解決する。未 link・空値はエラーとして扱う。 */
export const requireSecret = (secretName: string): string => {
	let linkedValue: string | undefined;

	try {
		const resources = Resource as unknown as Record<string, { value?: string }>;
		// 未 link の resource へのアクセスは SST の Resource proxy が throw する
		linkedValue = resources[secretName].value;
	} catch {
		throw new Error(`${secretName} secret が link されていません。`);
	}

	const value = linkedValue?.trim() ?? "";

	if (!value) {
		throw new Error(`${secretName} secret が設定されていません。`);
	}

	return value;
};
