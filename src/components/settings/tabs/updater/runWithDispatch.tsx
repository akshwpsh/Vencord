/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ErrorCard } from "@components/ErrorCard";
import { UpdateLogger } from "@utils/updater";
import { Alerts, Parser } from "@webpack/common";

function getErrorMessage(e: any) {
    if (!e?.code || !e.cmd)
        return "알 수 없는 오류가 발생했습니다.\n다시 시도하거나 콘솔에서 상세 정보를 확인하세요.";

    const { code, path, cmd, stderr } = e;

    if (code === "ENOENT")
        return `명령 \`${path}\`를 찾을 수 없습니다.\n설치 후 다시 시도해주세요.`;

    const extra = stderr || `코드 \`${code}\`. 콘솔에서 자세히 확인하세요.`;

    return `\`${cmd}\` 실행 중 오류가 발생했습니다:\n${extra}`;
}

export function runWithDispatch(dispatch: React.Dispatch<React.SetStateAction<boolean>>, action: () => any) {
    return async () => {
        dispatch(true);

        try {
            await action();
        } catch (e: any) {
            UpdateLogger.error(e);

            const err = getErrorMessage(e);

            Alerts.show({
                title: "앗!",
                body: (
                    <ErrorCard>
                        {err.split("\n").map((line, idx) =>
                            <div key={idx}>{Parser.parse(line)}</div>
                        )}
                    </ErrorCard>
                )
            });
        } finally {
            dispatch(false);
        }
    };
}
