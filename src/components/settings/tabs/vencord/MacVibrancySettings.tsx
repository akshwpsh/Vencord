/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Margins } from "@utils/margins";
import { identity } from "@utils/misc";
import { Forms, Select } from "@webpack/common";

export function VibrancySettings() {
    const settings = useSettings(["macosVibrancyStyle"]);

    return (
        <>
            <Forms.FormTitle tag="h5">창 비브런시 스타일(재시작 필요)</Forms.FormTitle>
            <ErrorBoundary noop>
                <Select
                    className={Margins.bottom20}
                    placeholder="창 비브런시 스타일"
                    options={[
                        // Sorted from most opaque to most transparent
                        {
                            label: "비브런시 사용 안 함", value: undefined
                        },
                        {
                            label: "Under Page (창 틴팅)",
                            value: "under-page"
                        },
                        {
                            label: "Content (내용)",
                            value: "content"
                        },
                        {
                            label: "Window (창)",
                            value: "window"
                        },
                        {
                            label: "Selection (선택 영역)",
                            value: "selection"
                        },
                        {
                            label: "Titlebar (제목 표시줄)",
                            value: "titlebar"
                        },
                        {
                            label: "Header",
                            value: "header"
                        },
                        {
                            label: "Sidebar (사이드바)",
                            value: "sidebar"
                        },
                        {
                            label: "Tooltip (툴팁)",
                            value: "tooltip"
                        },
                        {
                            label: "Menu (메뉴)",
                            value: "menu"
                        },
                        {
                            label: "Popover",
                            value: "popover"
                        },
                        {
                            label: "전체 화면 UI (투명하지만 약간 차분함)",
                            value: "fullscreen-ui"
                        },
                        {
                            label: "HUD (가장 투명)",
                            value: "hud"
                        },
                    ]}
                    select={v => settings.macosVibrancyStyle = v}
                    isSelected={v => settings.macosVibrancyStyle === v}
                    serialize={identity}
                />
            </ErrorBoundary>
        </>
    );
}
