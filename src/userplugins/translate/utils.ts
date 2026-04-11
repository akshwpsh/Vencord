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

import { classNameFactory } from "@utils/css";
import { onlyOnce } from "@utils/onlyOnce";
import { showToast, Toasts } from "@webpack/common";

import { DeeplLanguages, deeplLanguageToGoogleLanguage, GeminiLanguages, GoogleLanguages } from "./languages";
import { resetLanguageDefaults, settings } from "./settings";

export const cl = classNameFactory("vc-trans-");

type TranslateNative = {
    makeDeeplTranslateRequest(pro: boolean, apiKey: string, payload: string): Promise<{
        status: number;
        data: string;
    }>;
};

const Native = VencordNative.pluginHelpers.Translate as TranslateNative;

interface GoogleData {
    translation: string;
    sourceLanguage: string;
}

interface DeeplData {
    translations: {
        detected_source_language: string;
        text: string;
    }[];
}

export interface TranslationValue {
    sourceLanguage: string;
    text: string;
}

export const getLanguages = () => IS_WEB || settings.store.service === "google"
    ? GoogleLanguages
    : settings.store.service === "gemini"
        ? GeminiLanguages
        : DeeplLanguages;

export async function translate(kind: "received" | "sent", text: string): Promise<TranslationValue> {
    const translateImpl = IS_WEB || settings.store.service === "google"
        ? googleTranslate
        : settings.store.service === "gemini"
            ? geminiTranslate
            : deeplTranslate;

    try {
        return await translateImpl(
            text,
            settings.store[`${kind}Input`],
            settings.store[`${kind}Output`]
        );
    } catch (e) {
        const userMessage = typeof e === "string"
            ? e
            : "번역 중 문제가 발생했습니다. 계속되면 콘솔을 확인하거나 지원 서버에서 도움을 받아주세요.";

        showToast(userMessage, Toasts.Type.FAILURE);

        throw e instanceof Error
            ? e
            : new Error(userMessage);
    }
}

async function googleTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    const url = "https://translate-pa.googleapis.com/v1/translate?" + new URLSearchParams({
        "params.client": "gtx",
        "dataTypes": "TRANSLATION",
        "key": "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA",
        "query.sourceLanguage": sourceLang,
        "query.targetLanguage": targetLang,
        "query.text": text,
    });

    const res = await fetch(url);
    if (!res.ok)
        throw new Error(
            `Failed to translate "${text}" (${sourceLang} -> ${targetLang})`
            + `\n${res.status} ${res.statusText}`
        );

    const { sourceLanguage, translation }: GoogleData = await res.json();

    return {
        sourceLanguage: GoogleLanguages[sourceLanguage] ?? sourceLanguage,
        text: translation
    };
}

async function geminiTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    if (!settings.store.geminiApiKey) {
        showToast("Google Gemini API 키가 없어 Google Translate로 되돌립니다.", Toasts.Type.FAILURE);

        settings.store.service = "google";
        resetLanguageDefaults();

        return googleTranslate(text, sourceLang, targetLang);
    }

    const sourceLanguageName = GoogleLanguages[sourceLang as keyof typeof GoogleLanguages] ?? sourceLang;
    const targetLanguageName = GoogleLanguages[targetLang as keyof typeof GoogleLanguages] ?? targetLang;

    const prompt = sourceLang === "auto"
        ? `Only provide the translated text without any explanation:\n\nTranslate to ${targetLanguageName}:\n\n${text}`
        : `Only provide the translated text without any explanation:\n\nTranslate from ${sourceLanguageName} to ${targetLanguageName}:\n\n${text}`;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${settings.store.geminiApiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        );

        if (!res.ok) {
            if (res.status === 401 || res.status === 403)
                throw "유효하지 않은 Google Gemini API 키입니다";

            throw new Error(
                `Failed to translate "${text}" (${sourceLang} -> ${targetLang})`
                + `\n${res.status} ${res.statusText}`
            );
        }

        const data = await res.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text)
            throw "Google Gemini API 응답 형식이 올바르지 않습니다";

        const translatedText = data.candidates[0].content.parts[0].text.trim();

        return {
            sourceLanguage: sourceLanguageName,
            text: translatedText
        };
    } catch (e) {
        if (typeof e === "string")
            throw e;

        throw `Google Gemini API에 연결하지 못했습니다: ${e instanceof Error ? e.message : String(e)}`;
    }
}

function fallbackToGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    return googleTranslate(
        text,
        deeplLanguageToGoogleLanguage(sourceLang),
        deeplLanguageToGoogleLanguage(targetLang)
    );
}

const showDeeplApiQuotaToast = onlyOnce(
    () => showToast("DeepL API 할당량을 초과해 Google Translate로 대체합니다.", Toasts.Type.FAILURE)
);

async function deeplTranslate(text: string, sourceLang: string, targetLang: string): Promise<TranslationValue> {
    if (!settings.store.deeplApiKey) {
        showToast("DeepL API 키가 없어 Google Translate로 되돌립니다.", Toasts.Type.FAILURE);

        settings.store.service = "google";
        resetLanguageDefaults();

        return fallbackToGoogle(text, sourceLang, targetLang);
    }

    const { status, data } = await Native.makeDeeplTranslateRequest(
        settings.store.service === "deepl-pro",
        settings.store.deeplApiKey,
        JSON.stringify({
            text: [text],
            target_lang: targetLang,
            source_lang: sourceLang.split("-")[0]
        })
    );

    switch (status) {
        case 200:
            break;
        case -1:
            throw "DeepL API에 연결하지 못했습니다: " + data;
        case 403:
            throw "유효하지 않은 DeepL API 키이거나 잘못된 API 버전입니다";
        case 456:
            showDeeplApiQuotaToast();
            return fallbackToGoogle(text, sourceLang, targetLang);
        default:
            throw new Error(`Failed to translate "${text}" (${sourceLang} -> ${targetLang})\n${status} ${data}`);
    }

    const { translations }: DeeplData = JSON.parse(data);
    const src = translations[0].detected_source_language;

    return {
        sourceLanguage: DeeplLanguages[src] ?? src,
        text: translations[0].text
    };
}
