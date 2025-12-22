/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    receivedInput: {
        type: OptionType.STRING,
        description: "번역할 메시지의 원래 언어",
        default: "auto",
        hidden: true
    },
    receivedOutput: {
        type: OptionType.STRING,
        description: "받은 메시지를 번역할 언어",
        default: "ko",
        hidden: true
    },
    sentInput: {
        type: OptionType.STRING,
        description: "보낼 메시지의 원래 언어",
        default: "auto",
        hidden: true
    },
    sentOutput: {
        type: OptionType.STRING,
        description: "보낼 메시지를 번역할 언어",
        default: "ko",
        hidden: true
    },

    service: {
        type: OptionType.SELECT,
        description: IS_WEB ? "번역 서비스 (웹에서는 지원되지 않음!)" : "번역 서비스",
        disabled: () => IS_WEB,
        options: [
            { label: "Google Translate", value: "google", default: true },
            { label: "Google Gemini", value: "gemini" },
            { label: "DeepL Free", value: "deepl" },
            { label: "DeepL Pro", value: "deepl-pro" }
        ] as const,
        onChange: resetLanguageDefaults
    },
    geminiApiKey: {
        type: OptionType.STRING,
        description: "Google Gemini API 키",
        default: "",
        placeholder: "https://aistudio.google.com/apikey 에서 API 키를 받으세요",
        disabled: () => IS_WEB
    },
    deeplApiKey: {
        type: OptionType.STRING,
        description: "DeepL API 키",
        default: "",
        placeholder: "https://deepl.com/your-account 에서 API 키를 받으세요",
        disabled: () => IS_WEB
    },
    autoTranslate: {
        type: OptionType.BOOLEAN,
        description: "메시지 전송 전에 자동으로 번역합니다. 번역 버튼을 Shift/우클릭으로도 토글할 수 있습니다",
        default: false
    },
    autoTranslateReceived: {
        type: OptionType.BOOLEAN,
        description: "받은 메시지를 자동으로 번역합니다",
        default: false
    },
    translateMessageGroup: {
        type: OptionType.BOOLEAN,
        description: "같은 사용자의 연속된 메시지를 한 번에 번역합니다",
        default: true
    },
    showAutoTranslateTooltip: {
        type: OptionType.BOOLEAN,
        description: "메시지가 자동으로 번역될 때 채팅창 버튼에 툴팁을 표시합니다",
        default: true
    },
}).withPrivateSettings<{
    showAutoTranslateAlert: boolean;
}>();

export function resetLanguageDefaults() {
    if (IS_WEB || settings.store.service === "google") {
        settings.store.receivedInput = "auto";
        settings.store.receivedOutput = "ko";
        settings.store.sentInput = "auto";
        settings.store.sentOutput = "ko";
    } else {
        settings.store.receivedInput = "";
        settings.store.receivedOutput = "ko";
        settings.store.sentInput = "";
        settings.store.sentOutput = "ko";
    }
}
