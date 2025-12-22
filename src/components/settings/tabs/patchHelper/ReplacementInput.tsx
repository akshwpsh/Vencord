/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FormSwitch } from "@components/FormSwitch";
import { Margins } from "@utils/margins";
import { Forms, Parser, TextInput, useEffect, useState } from "@webpack/common";

const RegexGuide = {
    "\\i": "식별자(변수명, 클래스명 등)를 매칭하는 특수 정규식 이스케이프",
    "$$": "$ 기호 삽입",
    "$&": "전체 매치 결과 삽입",
    "$`\u200b": "매치 이전 부분 문자열 삽입",
    "$'": "매치 이후 부분 문자열 삽입",
    "$n": "n번째 캡처 그룹 삽입 ($1, $2...)",
    "$self": "플러그인 인스턴스 삽입",
} as const;

export function ReplacementInput({ replacement, setReplacement, replacementError }) {
    const [isFunc, setIsFunc] = useState(false);
    const [error, setError] = useState<string>();

    function onChange(v: string) {
        setError(void 0);

        if (isFunc) {
            try {
                const func = (0, eval)(v);
                if (typeof func === "function")
                    setReplacement(() => func);

                else
                    setError("치환값은 함수여야 합니다");
            } catch (e) {
                setReplacement(v);
                setError((e as Error).message);
            }
        } else {
            setReplacement(v);
        }
    }

    useEffect(() => {
        if (isFunc)
            onChange(replacement);
        else
            setError(void 0);
    }, [isFunc]);

    return (
        <>
            {/* FormTitle adds a class if className is not set, so we set it to an empty string to prevent that */}
            <Forms.FormTitle className="">치환값</Forms.FormTitle>
            <TextInput
                value={replacement?.toString()}
                onChange={onChange}
                error={error ?? replacementError}
            />
            {!isFunc && (
                <div>
                    <Forms.FormTitle className={Margins.top8}>치트시트</Forms.FormTitle>

                    {Object.entries(RegexGuide).map(([placeholder, desc]) => (
                        <Forms.FormText key={placeholder}>
                            {Parser.parse("`" + placeholder + "`")}: {desc}
                        </Forms.FormText>
                    ))}
                </div>
            )}

            <FormSwitch
                className={Margins.top16}
                value={isFunc}
                onChange={setIsFunc}
                title={"치환값을 함수로 처리"}
                description='이 옵션을 켜면 "치환값"을 함수로 평가합니다'
                hideBorder
            />
        </>
    );
}
