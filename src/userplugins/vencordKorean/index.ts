/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2026 akshwpsh
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import definePlugin from "@utils/types";
import { Alerts, React } from "@webpack/common";

const exactTranslations = new Map<string, string>([
    ["Where to put the Vencord settings section", "Vencord 설정 섹션을 어디에 배치할지"],
    ["At the very top", "맨 위에 배치"],
    ["Above the Nitro section", "니트로 섹션 위"],
    ["Below the Nitro section", "니트로 섹션 아래"],
    ["Above Activity Settings", "활동 설정 위"],
    ["Below Activity Settings", "활동 설정 아래"],
    ["At the very bottom", "맨 아래에 배치"],
    ["Adds Settings UI and debug info", "설정 UI와 디버그 정보를 추가합니다"],
    ["Vencord Settings", "Vencord 설정"],
    ["Plugins", "플러그인"],
    ["Themes", "테마"],
    ["Updater", "업데이트"],
    ["Vencord Updater", "Vencord 업데이트"],
    ["Cloud", "클라우드"],
    ["Vencord Cloud", "Vencord 클라우드"],
    ["Backup & Restore", "백업 및 복원"],
    ["Patch Helper", "패치 헬퍼"],
    ["Restart required!", "재시작 필요!"],
    ["Restart required", "재시작 필요"],
    ["Restart Required", "재시작 필요"],
    ["Restart now", "지금 재시작"],
    ["Restart", "재시작"],
    ["Later!", "나중에"],
    ["Not now!", "나중에"],
    ["Plugin Management", "플러그인 관리"],
    ["Press the cog wheel or info icon to get more info on a plugin", "플러그인 정보를 보려면 톱니바퀴나 정보 아이콘을 눌러주세요"],
    ["Plugins with a cog wheel have settings you can modify!", "톱니바퀴가 있는 플러그인은 설정을 변경할 수 있습니다!"],
    ["Discord Desktop app or Vesktop", "Discord 데스크톱 앱 또는 Vesktop"],
    ["Discord Desktop app", "Discord 데스크톱 앱"],
    ["Vesktop app", "Vesktop 앱"],
    ["Vesktop app and the Web version of Discord", "Vesktop 앱과 Discord 웹 버전"],
    ["Developer version of Vencord", "Vencord 개발 버전"],
    ["Are you looking for:", "혹시 찾고 계신 플러그인은:"],
    ["No plugins meet the search criteria.", "검색 조건에 맞는 플러그인이 없습니다."],
    ["The following plugins require a restart:", "다음 플러그인을 적용하려면 재시작이 필요합니다:"],
    ["This plugin is required for Vencord to function.", "이 플러그인은 Vencord 동작에 필수입니다."],
    ["Filters", "필터"],
    ["Search for a plugin...", "플러그인 검색..."],
    ["Show All", "모두 보기"],
    ["Show Enabled", "사용 중인 플러그인"],
    ["Show Disabled", "사용 중이 아닌 플러그인"],
    ["Show New", "새 플러그인"],
    ["Show UserPlugins", "사용자 플러그인만"],
    ["Show API Plugins", "API 플러그인만"],
    ["Required Plugins", "필수 플러그인"],
    ["This plugin is required by:", "이 플러그인을 필요로 하는 항목:"],
    ["There are no settings for this plugin.", "이 플러그인은 설정이 없습니다."],
    ["View more info", "자세히 보기"],
    ["View source code", "소스 코드 보기"],
    ["Authors", "제작자"],
    ["Settings", "설정"],
    ["An error occurred while rendering this plugin's custom Info Component", "플러그인의 커스텀 정보 컴포넌트를 렌더링하는 중 오류가 발생했습니다"],
    ["Manage plugin UI elements", "플러그인 UI 요소 관리"],
    ["Allows you to hide buttons you don't like", "필요 없는 버튼을 숨길 수 있습니다"],
    ["Chatbar Buttons", "채팅창 버튼"],
    ["These are the buttons on the right side of the chat input bar", "채팅 입력창 오른쪽에 있는 버튼들입니다"],
    ["Message Popover Buttons", "메시지 팝오버 버튼"],
    ["These are the floating buttons on the right when you hover over a message", "메시지에 마우스를 올렸을 때 오른쪽에 뜨는 버튼들입니다"],
    ["Invalid input provided", "입력값이 올바르지 않습니다"],
    ["Enter a number", "숫자를 입력하세요"],
    ["Select an option", "옵션을 선택하세요"],
    ["Enter a value", "값을 입력하세요"],
    ["Warning", "경고"],
    ["Importing a settings file will overwrite your current settings.", "설정 파일을 불러오면 현재 설정이 덮어씌워집니다."],
    ["Settings Export contains:", "내보내기 항목:"],
    ["Custom QuickCSS", "커스텀 QuickCSS"],
    ["Theme Links", "테마 링크"],
    ["Plugin Settings", "플러그인 설정"],
    ["Import Settings", "설정 불러오기"],
    ["Export Settings", "설정 내보내기"],
    ["Invalid URL", "유효하지 않은 URL"],
    ["Cloud Integrations", "클라우드 연동"],
    ["respects your privacy", "개인정보를 존중하며"],
    ["Enable Cloud Integrations", "클라우드 연동 활성화"],
    ["This will request authorization if you have not yet set up cloud integrations.", "아직 설정하지 않았다면 인증을 요청합니다."],
    ["Backend URL", "백엔드 URL"],
    ["Which backend to use when using cloud integrations.", "클라우드 연동 시 사용할 백엔드 주소입니다."],
    ["Reauthorise", "다시 인증"],
    ["Settings Sync", "설정 동기화"],
    ["Enable Settings Sync", "설정 동기화 사용"],
    ["Save your Vencord settings to the cloud so you can easily keep them the same on all your devices", "Vencord 설정을 클라우드에 저장해 모든 기기에서 동일하게 유지합니다"],
    ["Sync Rules for This Device", "이 기기의 동기화 규칙"],
    ["Two-way sync (changes go both directions)", "양방향 동기화 (변경 사항이 서로 동기화)"],
    ["This device is the source (upload only)", "이 기기를 기준으로 함 (업로드만)"],
    ["The cloud is the source (download only)", "클라우드를 기준으로 함 (다운로드만)"],
    ["Do not sync automatically (manual sync via buttons below only)", "자동 동기화 안 함 (아래 버튼으로 수동 동기화)"],
    ["Upload Settings", "설정 업로드"],
    ["This will replace your current settings with the ones saved in the cloud. Be careful!", "현재 설정을 클라우드에 저장된 값으로 덮어씁니다. 주의하세요!"],
    ["Download Settings", "설정 다운로드"],
    ["Reset Cloud Data", "클라우드 데이터 초기화"],
    ["Delete Settings from Cloud", "클라우드에 저장된 설정 삭제"],
    ["Are you sure?", "정말 삭제할까요?"],
    ["Erase it!", "삭제하기"],
    ["Nevermind", "취소"],
    ["Delete your Cloud Account", "클라우드 계정 삭제"],
    ["Failed to check updates. Check the console for more info", "업데이트 확인에 실패했습니다. 콘솔에서 자세히 확인하세요"],
    ["An unknown error occurred", "알 수 없는 오류가 발생했습니다"],
    ["Up to Date!", "최신 상태입니다!"],
    ["Update Success!", "업데이트 완료!"],
    ["Successfully updated. Restart now to apply the changes?", "업데이트를 완료했습니다. 변경 사항을 적용하려면 지금 재시작할까요?"],
    ["No updates found!", "새 업데이트가 없습니다!"],
    ["Automatically update", "자동 업데이트"],
    ["Automatically update Vencord without confirmation prompt", "확인 없이 Vencord를 자동으로 업데이트합니다"],
    ["Get notified when an automatic update completes", "자동 업데이트 완료 시 알림 받기"],
    ["Show a notification when Vencord automatically updates", "Vencord가 자동 업데이트되면 알림을 표시합니다"],
    ["Repo", "저장소"],
    ["Failed to retrieve - check console", "가져오지 못했습니다 - 콘솔을 확인하세요"],
    ["Updates", "업데이트"],
    ["An unknown error occurred.\nPlease try again or see the console for more info.", "알 수 없는 오류가 발생했습니다.\n다시 시도하거나 콘솔에서 상세 정보를 확인하세요."],
    ["Oops!", "앗!"],
    ["Window vibrancy style (requires restart)", "창 비브런시 스타일(재시작 필요)"],
    ["Window vibrancy style", "창 비브런시 스타일"],
    ["No vibrancy", "비브런시 사용 안 함"],
    ["Under Page (window tinting)", "Under Page (창 틴팅)"],
    ["Content", "Content (내용)"],
    ["Window", "Window (창)"],
    ["Selection", "Selection (선택 영역)"],
    ["Titlebar", "Titlebar (제목 표시줄)"],
    ["Sidebar", "Sidebar (사이드바)"],
    ["Tooltip", "Tooltip (툴팁)"],
    ["Menu", "Menu (메뉴)"],
    ["Fullscreen UI (transparent but slightly muted)", "전체 화면 UI (투명하지만 약간 차분함)"],
    ["HUD (Most transparent)", "HUD (가장 투명)"],
    ["Notifications", "알림"],
    ["Notification Settings", "알림 설정"],
    ["View Notification Log", "알림 로그 보기"],
    ["Notification Style", "알림 스타일"],
    ["Desktop Notification Permission denied", "데스크톱 알림 권한 거부됨"],
    ["You have denied Notification Permissions. Thus, Desktop notifications will not work!", "알림 권한을 거부하여 데스크톱 알림이 동작하지 않습니다."],
    ["Some plugins may show you notifications. These come in two styles:", "일부 플러그인이 알림을 표시할 수 있으며, 다음 두 가지 방식이 있습니다:"],
    ["Vencord Notifications", "Vencord 알림"],
    ["These are in-app notifications", "클라이언트 안에서 표시되는 알림"],
    ["Desktop Notifications", "데스크톱 알림"],
    ["Native Desktop notifications (like when you get a ping)", "운영체제 기본 알림 (메시지 수신과 동일)"],
    ["Notification Position", "알림 위치"],
    ["Bottom Right", "오른쪽 아래"],
    ["Top Right", "오른쪽 위"],
    ["Notification Timeout", "알림 표시 시간"],
    ["Set to 0s to never automatically time out", "0초로 설정하면 자동으로 사라지지 않습니다"],
    ["Notification Log Limit", "알림 로그 최대 개수"],
    ["Quick Actions", "빠른 작업"],
    ["Notification Log", "알림 기록"],
    ["Edit QuickCSS", "QuickCSS 편집"],
    ["Relaunch Discord", "Discord 다시 시작"],
    ["Open Settings Folder", "설정 폴더 열기"],
    ["View Source Code", "소스 코드 보기"],
    ["Hint: You can change the position of this settings section in the", "팁: 이 설정 섹션의 위치는"],
    ["settings of the Settings plugin", "Settings 플러그인 설정"],
    ["Support the Project", "프로젝트를 후원해주세요"],
    ["Please consider supporting the development of Vencord by donating!", "후원을 통해 Vencord 개발을 응원해 주세요!"],
    ["Donations", "후원"],
    ["Thank you for donating!", "후원해 주셔서 감사합니다!"],
    ["Contributions", "기여"],
    ["Thank you for contributing!", "기여해 주셔서 감사합니다!"],
    ["See what you've contributed to", "내가 기여한 내용 보기"],
    ["Find Themes:", "테마 찾기:"],
    ["External Resources", "외부 리소스"],
    ["Local Themes", "로컬 테마"],
    ["Upload Theme", "테마 업로드"],
    ["Open Themes Folder", "테마 폴더 열기"],
    ["Load missing Themes", "누락된 테마 다시 로드"],
    ["Edit ClientTheme", "ClientTheme 편집"],
    ["Paste links to css files here", "CSS 파일 링크를 여기에 붙여넣으세요"],
    ["One link per line", "한 줄에 하나의 링크만 입력하세요"],
    ["You can prefix lines with @light or @dark to toggle them based on your Discord theme", "@light 또는 @dark 접두사를 붙여 Discord 테마에 따라 토글할 수 있습니다"],
    ["Make sure to use direct links to files (raw or github.io)!", "파일에 직접 접근하는 링크(raw 또는 github.io 등)를 사용하세요!"],
    ["Online Themes", "온라인 테마"],
    ["Enter Theme Links...", "테마 링크를 입력하세요..."],
    ["Website", "웹사이트"],
    ["Discord Server", "디스코드 서버"],
    ["Themes are not supported on the Userscript!", "유저스크립트에서는 테마가 지원되지 않습니다!"],
    ["Stylus extension", "Stylus 확장 프로그램"],
    ["Blocked Resources", "차단된 리소스"],
    ["Blocked URLs", "차단된 URL"],
    ["Allow", "허용"],
    ["No match. Perhaps that module is lazy loaded?", "일치하는 항목이 없습니다. 모듈이 지연 로드되었을 수 있습니다."],
    ["Multiple matches. Please refine your filter", "여러 항목이 일치합니다. 필터를 더 구체적으로 입력하세요"],
    ["Full patch", "전체 패치"],
    ["Find", "검색"],
    ["Match", "매칭"],
    ["Code", "코드"],
    ["Copy to Clipboard", "클립보드에 복사"],
    ["Copy as Codeblock", "코드 블록으로 복사"],
    ["No 'find' field", "'find' 필드가 없습니다"],
    ["No 'replacement' field", "'replacement' 필드가 없습니다"],
    ["Invalid replacement", "잘못된 replacement 값입니다"],
    ["No 'replacement.match' field", "'replacement.match' 필드가 없습니다"],
    ["No 'replacement.replace' field", "'replacement.replace' 필드가 없습니다"],
    ["Paste your full JSON patch here to fill out the fields", "전체 JSON 패치를 붙여넣어 필드를 자동으로 채우세요"],
    ["Diff", "차이"],
    ["Compiled successfully", "컴파일 성공"],
    ["Compile", "컴파일"],
    ["Replacement", "치환값"],
    ["Cheat Sheet", "치트시트"],
    ["Treat Replacement as function", "치환값을 함수로 처리"],
    ["\"Replacement\" will be evaluated as a function if this is enabled", "이 옵션을 켜면 \"치환값\"을 함수로 평가합니다"],
]);

const regexTranslations: Array<[RegExp, (...args: string[]) => string]> = [
    [/^Failed to render the (.+) tab\. If this issue persists, try using the installer to reinstall!$/, tab => `${tab} 탭을 렌더링하지 못했습니다. 문제가 계속되면 인스톨러로 재설치해 보세요!`],
    [/^Error while stopping plugin (.+)$/, plugin => `플러그인 ${plugin}을(를) 비활성화하는 중 오류가 발생했습니다`],
    [/^Error while starting plugin (.+)$/, plugin => `플러그인 ${plugin}을(를) 활성화하는 중 오류가 발생했습니다`],
    [/^There are (\d+) Updates$/, count => `업데이트 ${count}개가 있습니다`],
    [/^There is 1 Update$/, () => "업데이트 1개가 있습니다"],
    [/^Command `(.+)` not found\.\nPlease install it and try again\.$/, path => `명령 \`${path}\`를 찾을 수 없습니다.\n설치 후 다시 시도해주세요.`],
    [/^Code `(.+)`\. See the console for more info\.$/, code => `코드 \`${code}\`. 콘솔에서 자세히 확인하세요.`],
    [/^An error occurred while running `(.+)`:\n(.+)$/, (cmd, extra) => `\`${cmd}\` 실행 중 오류가 발생했습니다:\n${extra}`],
    [/^Module (.+)$/, id => `모듈 ${id}`],
];

const translatablePropKeys = new Set([
    "body",
    "cancelText",
    "children",
    "confirmText",
    "description",
    "error",
    "label",
    "message",
    "options",
    "placeholder",
    "secondaryConfirmText",
    "subtitle",
    "text",
    "title",
]);

const LocalDevs = [{ name: "akshwpsh", id: 0n, badge: false }] as const;
let originalCreateElement = React.createElement;
let originalAlertShow = Alerts.show;

function normalizeWhitespace(value: string) {
    return value.replace(/\s+/g, " ").trim();
}

function preserveSurroundingWhitespace(original: string, translated: string) {
    const leading = original.match(/^\s*/)?.[0] ?? "";
    const trailing = original.match(/\s*$/)?.[0] ?? "";
    return `${leading}${translated}${trailing}`;
}

function translateString(value: string) {
    const direct = exactTranslations.get(value);
    if (direct) return direct;

    const normalized = normalizeWhitespace(value);
    const normalizedDirect = exactTranslations.get(normalized);
    if (normalizedDirect) return preserveSurroundingWhitespace(value, normalizedDirect);

    for (const [pattern, replacer] of regexTranslations) {
        const match = normalized.match(pattern);
        if (!match) continue;
        return preserveSurroundingWhitespace(value, replacer(...match.slice(1)));
    }

    return value;
}

function translateRenderable<T>(value: T): T {
    if (typeof value === "string")
        return translateString(value) as T;

    if (Array.isArray(value)) {
        let changed = false;
        const next = value.map(entry => {
            const translated = translateRenderable(entry);
            changed ||= translated !== entry;
            return translated;
        });
        return (changed ? next : value) as T;
    }

    if (!value || typeof value !== "object" || React.isValidElement(value))
        return value;

    let changed = false;
    const next: Record<string, unknown> = {};

    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
        if (typeof entry === "string") {
            const translated = translateString(entry);
            next[key] = translated;
            changed ||= translated !== entry;
            continue;
        }

        if (Array.isArray(entry) || (entry && typeof entry === "object")) {
            const translated = translateRenderable(entry);
            next[key] = translated;
            changed ||= translated !== entry;
            continue;
        }

        next[key] = entry;
    }

    return (changed ? next : value) as T;
}

function translateProps<T extends Record<string, any> | null | undefined>(props: T): T {
    if (!props) return props;

    let changed = false;
    const next = { ...props };

    for (const key of Object.keys(props)) {
        if (!translatablePropKeys.has(key)) continue;

        const translated = translateRenderable(props[key]);
        if (translated !== props[key]) {
            next[key] = translated;
            changed = true;
        }
    }

    return changed ? next : props;
}

export default definePlugin({
    name: "VencordKorean",
    description: "Vencord 설정 UI를 런타임에서 한국어로 표시합니다",
    authors: [...LocalDevs],
    enabledByDefault: true,

    start() {
        originalCreateElement = React.createElement;
        originalAlertShow = Alerts.show;

        React.createElement = function patchedCreateElement(type, props, ...children) {
            const translatedProps = translateProps(props);
            const translatedChildren = children.map(child => translateRenderable(child));
            return originalCreateElement(type, translatedProps, ...translatedChildren);
        } as typeof React.createElement;

        Alerts.show = ((options: Parameters<typeof Alerts.show>[0]) => {
            const translated = translateRenderable(options) as Parameters<typeof Alerts.show>[0];
            return originalAlertShow(translated);
        }) as typeof Alerts.show;
    },

    stop() {
        React.createElement = originalCreateElement;
        Alerts.show = originalAlertShow;
    },
});
