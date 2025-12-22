/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Margins } from "@utils/margins";
import { Patch, ReplaceFn } from "@utils/types";
import { Forms, TextArea, useEffect, useRef, useState } from "@webpack/common";

export interface FullPatchInputProps {
    setFind(v: string): void;
    setParsedFind(v: string | RegExp): void;
    setMatch(v: string): void;
    setReplacement(v: string | ReplaceFn): void;
}

export function FullPatchInput({ setFind, setParsedFind, setMatch, setReplacement }: FullPatchInputProps) {
    const [patch, setPatch] = useState<string>("");
    const [error, setError] = useState<string>("");

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    function update() {
        if (patch === "") {
            setError("");

            setFind("");
            setParsedFind("");
            setMatch("");
            setReplacement("");
            return;
        }

        try {
            let { find, replacement } = (0, eval)(`([${patch}][0])`) as Patch;

            if (!find) throw new Error("'find' 필드가 없습니다");
            if (!replacement) throw new Error("'replacement' 필드가 없습니다");

            if (replacement instanceof Array) {
                if (replacement.length === 0) throw new Error("잘못된 replacement 값입니다");

                // Only test the first replacement
                replacement = replacement[0];
            }

            if (!replacement.match) throw new Error("'replacement.match' 필드가 없습니다");
            if (replacement.replace == null) throw new Error("'replacement.replace' 필드가 없습니다");

            setFind(find instanceof RegExp ? `/${find.source}/` : find);
            setParsedFind(find);
            setMatch(replacement.match instanceof RegExp ? replacement.match.source : replacement.match);
            setReplacement(replacement.replace);
            setError("");
        } catch (e) {
            setError((e as Error).message);
        }
    }

    useEffect(() => {
        const { current: textArea } = textAreaRef;
        if (textArea) {
            textArea.style.height = "auto";
            textArea.style.height = `${textArea.scrollHeight}px`;
        }
    }, [patch]);

    return (
        <>
            <Forms.FormText className={Margins.bottom8}>
                전체 JSON 패치를 붙여넣어 필드를 자동으로 채우세요
            </Forms.FormText>
            <TextArea
                inputRef={textAreaRef}
                value={patch}
                onChange={setPatch}
                onBlur={update}
            />
            {error !== "" && <Forms.FormText style={{ color: "var(--text-feedback-critical)" }}>{error}</Forms.FormText>}
        </>
    );
}
