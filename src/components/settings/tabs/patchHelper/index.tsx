/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
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

import { CodeBlock } from "@components/CodeBlock";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { HeadingTertiary } from "@components/Heading";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { debounce } from "@shared/debounce";
import { copyWithToast } from "@utils/discord";
import { Margins } from "@utils/margins";
import { stripIndent } from "@utils/text";
import { ReplaceFn } from "@utils/types";
import { search } from "@webpack";
import { Button, React, TextInput, useMemo, useState } from "@webpack/common";

import { FullPatchInput } from "./FullPatchInput";
import { PatchPreview } from "./PatchPreview";
import { ReplacementInput } from "./ReplacementInput";

const findCandidates = debounce(function ({ find, setModule, setError }) {
    const candidates = search(find);
    const keys = Object.keys(candidates);
    const len = keys.length;

    if (len === 0)
        setError("일치하는 항목이 없습니다. 모듈이 지연 로드되었을 수 있습니다.");
    else if (len !== 1)
        setError("여러 항목이 일치합니다. 필터를 더 구체적으로 입력하세요");
    else
        setModule([keys[0], candidates[keys[0]]]);
});

function PatchHelper() {
    const [find, setFind] = useState("");
    const [match, setMatch] = useState("");
    const [replacement, setReplacement] = useState<string | ReplaceFn>("");

    const [parsedFind, setParsedFind] = useState<string | RegExp>("");

    const [findError, setFindError] = useState<string>();
    const [matchError, setMatchError] = useState<string>();
    const [replacementError, setReplacementError] = useState<string>();

    const [module, setModule] = useState<[number, Function]>();

    const code = useMemo(() => {
        const find = parsedFind instanceof RegExp ? parsedFind.toString() : JSON.stringify(parsedFind);
        const replace = typeof replacement === "function" ? replacement.toString() : JSON.stringify(replacement);

        return stripIndent`
            {
                find: ${find},
                replacement: {
                    match: /${match.replace(/(?<!\\)\//g, "\\/")}/,
                    replace: ${replace}
                }
            }
        `;
    }, [parsedFind, match, replacement]);

    function onFindChange(v: string) {
        setFind(v);

        try {
            let parsedFind = v as string | RegExp;
            if (/^\/.+?\/$/.test(v)) parsedFind = new RegExp(v.slice(1, -1));

            setFindError(void 0);
            setParsedFind(parsedFind);

            if (v.length) {
                findCandidates({ find: parsedFind, setModule, setError: setFindError });
            }
        } catch (e: any) {
            setFindError((e as Error).message);
        }
    }

    function onMatchChange(v: string) {
        setMatch(v);

        try {
            new RegExp(v);
            setMatchError(void 0);
        } catch (e: any) {
            setMatchError((e as Error).message);
        }
    }

    return (
        <SettingsTab>
            <HeadingTertiary>전체 패치</HeadingTertiary>
            <FullPatchInput
                setFind={onFindChange}
                setParsedFind={setParsedFind}
                setMatch={onMatchChange}
                setReplacement={setReplacement}
            />

            <HeadingTertiary className={Margins.top8}>검색</HeadingTertiary>
            <TextInput
                type="text"
                value={find}
                onChange={onFindChange}
                error={findError}
            />

            <HeadingTertiary className={Margins.top8}>매칭</HeadingTertiary>
            <TextInput
                type="text"
                value={match}
                onChange={onMatchChange}
                error={matchError}
            />

            <div className={Margins.top8} />
            <ReplacementInput
                replacement={replacement}
                setReplacement={setReplacement}
                replacementError={replacementError}
            />

            <Divider />
            {module && (
                <PatchPreview
                    module={module}
                    match={match}
                    replacement={replacement}
                    setReplacementError={setReplacementError}
                />
            )}

            {!!(find && match && replacement) && (
                <>
                    <HeadingTertiary className={Margins.top20}>코드</HeadingTertiary>
                    <CodeBlock lang="js" content={code} />
                    <Flex className={Margins.top16}>
                        <Button onClick={() => copyWithToast(code)}>
                            클립보드에 복사
                        </Button>
                        <Button onClick={() => copyWithToast("```ts\n" + code + "\n```")}>
                            코드 블록으로 복사
                        </Button>
                    </Flex>
                </>
            )}
        </SettingsTab>
    );
}

export default IS_DEV ? wrapTab(PatchHelper, "패치 헬퍼") : null;
