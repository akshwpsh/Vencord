/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Forms, TextArea, useState } from "@webpack/common";

export function OnlineThemesTab() {
    const settings = useSettings(["themeLinks"]);

    const [themeText, setThemeText] = useState(settings.themeLinks.join("\n"));

    // When the user leaves the online theme textbox, update the settings
    function onBlur() {
        settings.themeLinks = [...new Set(
            themeText
                .trim()
                .split(/\n+/)
                .map(s => s.trim())
                .filter(Boolean)
        )];
    }

    return (
        <Flex flexDirection="column" gap="1em">
            <Card variant="warning" defaultPadding>
                <Forms.FormText size="md">
                    이 영역은 고급 사용자용입니다. 사용이 어렵다면 로컬 테마 탭을 이용하세요.
                </Forms.FormText>
            </Card>
            <Card>
                <Forms.FormTitle tag="h5">CSS 파일 링크를 여기에 붙여넣으세요</Forms.FormTitle>
                <Forms.FormText>한 줄에 하나의 링크만 입력하세요</Forms.FormText>
                <Forms.FormText>@light 또는 @dark 접두사를 붙여 Discord 테마에 따라 토글할 수 있습니다</Forms.FormText>
                <Forms.FormText>파일에 직접 접근하는 링크(raw 또는 github.io 등)를 사용하세요!</Forms.FormText>
            </Card>

            <section>
                <Forms.FormTitle tag="h5">온라인 테마</Forms.FormTitle>
                <TextArea
                    value={themeText}
                    onChange={setThemeText}
                    className={"vc-settings-theme-links"}
                    placeholder="테마 링크를 입력하세요..."
                    spellCheck={false}
                    onBlur={onBlur}
                    rows={10}
                />
            </section>
        </Flex>
    );
}
