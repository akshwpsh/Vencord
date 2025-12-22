/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Divider } from "@components/Divider";
import { ErrorCard } from "@components/ErrorCard";
import { Link } from "@components/Link";
import { CspBlockedUrls, useCspErrors } from "@utils/cspViolations";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { relaunch } from "@utils/native";
import { useForceUpdater } from "@utils/react";
import { Alerts, Button, Forms } from "@webpack/common";

export function CspErrorCard() {
    if (IS_WEB) return null;

    const errors = useCspErrors();
    const forceUpdate = useForceUpdater();

    if (!errors.length) return null;

    const isImgurHtmlDomain = (url: string) => url.startsWith("https://imgur.com/");

    const allowUrl = async (url: string) => {
        const { origin: baseUrl, host } = new URL(url);

        const result = await VencordNative.csp.requestAddOverride(baseUrl, ["connect-src", "img-src", "style-src", "font-src"], "Vencord Themes");
        if (result !== "ok") return;

        CspBlockedUrls.forEach(url => {
            if (new URL(url).host === host) {
                CspBlockedUrls.delete(url);
            }
        });

        forceUpdate();

        Alerts.show({
            title: "재시작 필요",
            body: "변경 사항을 적용하려면 재시작이 필요합니다",
            confirmText: "지금 재시작",
            cancelText: "나중에",
            onConfirm: relaunch
        });
    };

    const hasImgurHtmlDomain = errors.some(isImgurHtmlDomain);

    return (
        <ErrorCard className={Margins.bottom16}>
            <Forms.FormTitle tag="h5">차단된 리소스</Forms.FormTitle>
            <Forms.FormText>허용되지 않은 도메인에서 로드되어 일부 이미지, 스타일, 폰트가 차단되었습니다.</Forms.FormText>
            <Forms.FormText>가능하면 GitHub나 Imgur로 옮기는 것을 권장합니다. 완전히 신뢰하는 도메인이라면 허용할 수도 있습니다.</Forms.FormText>
            <Forms.FormText>
                도메인을 허용한 뒤에는 {IS_DISCORD_DESKTOP ? "Discord" : "Vesktop"}를 완전히 종료(트레이/작업 관리자에서 종료) 후 다시 시작해야 적용됩니다.
            </Forms.FormText>

            <Forms.FormTitle tag="h5" className={classes(Margins.top16, Margins.bottom8)}>차단된 URL</Forms.FormTitle>
            <div className="vc-settings-csp-list">
                {errors.map((url, i) => (
                    <div key={url}>
                        {i !== 0 && <Divider className={Margins.bottom8} />}
                        <div className="vc-settings-csp-row">
                            <Link href={url}>{url}</Link>
                            <Button color={Button.Colors.PRIMARY} onClick={() => allowUrl(url)} disabled={isImgurHtmlDomain(url)}>
                                허용
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {hasImgurHtmlDomain && (
                <>
                    <Divider className={classes(Margins.top8, Margins.bottom16)} />
                    <Forms.FormText>
                        Imgur 링크는 <code>https://i.imgur.com/...</code> 형태의 직접 링크여야 합니다.
                    </Forms.FormText>
                    <Forms.FormText>직접 링크를 얻으려면 이미지를 우클릭하고 "이미지 주소 복사"를 선택하세요.</Forms.FormText>
                </>
            )}
        </ErrorCard>
    );
}
