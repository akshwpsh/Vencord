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

import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { useSettings } from "@api/Settings";
import { Divider } from "@components/Divider";
import { FormSwitch } from "@components/FormSwitch";
import { FolderIcon, GithubIcon, LogIcon, PaintbrushIcon, RestartIcon } from "@components/Icons";
import { QuickAction, QuickActionCard } from "@components/settings/QuickAction";
import { SpecialCard } from "@components/settings/SpecialCard";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { openContributorModal } from "@components/settings/tabs/plugins/ContributorModal";
import { openPluginModal } from "@components/settings/tabs/plugins/PluginModal";
import { gitRemote } from "@shared/vencordUserAgent";
import { IS_MAC, IS_WINDOWS } from "@utils/constants";
import { Margins } from "@utils/margins";
import { isPluginDev } from "@utils/misc";
import { relaunch } from "@utils/native";
import { Alerts, Forms, React, useMemo, UserStore } from "@webpack/common";

import { DonateButtonComponent, isDonor } from "./DonateButton";
import { VibrancySettings } from "./MacVibrancySettings";
import { NotificationSection } from "./NotificationSettings";

const DEFAULT_DONATE_IMAGE = "https://cdn.discordapp.com/emojis/1026533090627174460.png";
const SHIGGY_DONATE_IMAGE = "https://media.discordapp.net/stickers/1039992459209490513.png";
const VENNIE_DONATOR_IMAGE = "https://cdn.discordapp.com/emojis/1238120638020063377.png";
const COZY_CONTRIB_IMAGE = "https://cdn.discordapp.com/emojis/1026533070955872337.png";
const DONOR_BACKGROUND_IMAGE = "https://media.discordapp.net/stickers/1311070116305436712.png?size=2048";
const CONTRIB_BACKGROUND_IMAGE = "https://media.discordapp.net/stickers/1311070166481895484.png?size=2048";

type KeysOfType<Object, Type> = {
    [K in keyof Object]: Object[K] extends Type ? K : never;
}[keyof Object];

function Switches() {
    const settings = useSettings(["useQuickCss", "enableReactDevtools", "frameless", "winNativeTitleBar", "transparent", "winCtrlQ", "disableMinSize"]);

    const Switches = [
        {
            key: "useQuickCss",
            title: "맞춤 CSS 사용",
        },
        !IS_WEB && {
            key: "enableReactDevtools",
            title: "React 개발자 도구 활성화",
            restartRequired: true
        },
        !IS_WEB && (!IS_DISCORD_DESKTOP || !IS_WINDOWS ? {
            key: "frameless",
            title: "창 프레임 비활성화",
            restartRequired: true
        } : {
            key: "winNativeTitleBar",
            title: "Discord 커스텀 대신 Windows 기본 제목 표시줄 사용",
            restartRequired: true
        }),
        !IS_WEB && {
            key: "transparent",
            title: "창 투명도 활성화",
            description: "투명도를 지원하는 테마가 있어야 적용됩니다. 부수 효과로 창 크기 조절이 비활성화됩니다",
            restartRequired: true
        },
        IS_DISCORD_DESKTOP && {
            key: "disableMinSize",
            title: "창 최소 크기 제한 해제",
            restartRequired: true
        },
        !IS_WEB && IS_WINDOWS && {
            key: "winCtrlQ",
            title: "Ctrl+Q를 Discord 종료 단축키로 등록 (Alt+F4 대안)",
            restartRequired: true
        },
    ] satisfies Array<false | {
        key: KeysOfType<typeof settings, boolean>;
        title: string;
        description?: string;
        restartRequired?: boolean;
    }>;

    return Switches.map(setting => {
        if (!setting) {
            return null;
        }

        const { key, title, description, restartRequired } = setting;

        return (
            <FormSwitch
                key={key}
                title={title}
                description={description}
                value={settings[key]}
                onChange={v => {
                    settings[key] = v;

                    if (restartRequired) {
                        Alerts.show({
                            title: "재시작 필요",
                            body: "변경 사항을 적용하려면 재시작이 필요합니다",
                            confirmText: "지금 재시작",
                            cancelText: "나중에",
                            onConfirm: relaunch
                        });
                    }
                }}
            />
        );
    });
}

function VencordSettings() {
    const donateImage = useMemo(() =>
        Math.random() > 0.5 ? DEFAULT_DONATE_IMAGE : SHIGGY_DONATE_IMAGE,
        []
    );

    const needsVibrancySettings = IS_DISCORD_DESKTOP && IS_MAC;

    const user = UserStore?.getCurrentUser();

    return (
        <SettingsTab>
            {isDonor(user?.id)
                ? (
                    <SpecialCard
                        title="후원"
                        subtitle="후원해 주셔서 감사합니다!"
                        description="@vending.machine 에게 DM을 보내 언제든지 혜택을 관리할 수 있습니다."
                        cardImage={VENNIE_DONATOR_IMAGE}
                        backgroundImage={DONOR_BACKGROUND_IMAGE}
                        backgroundColor="#ED87A9"
                    >
                        <DonateButtonComponent />
                    </SpecialCard>
                )
                : (
                    <SpecialCard
                        title="프로젝트를 후원해주세요"
                        description="후원을 통해 Vencord 개발을 응원해 주세요!"
                        cardImage={donateImage}
                        backgroundImage={DONOR_BACKGROUND_IMAGE}
                        backgroundColor="#c3a3ce"
                    >
                        <DonateButtonComponent />
                    </SpecialCard>
                )
            }

            {isPluginDev(user?.id) && (
                <SpecialCard
                    title="기여"
                    subtitle="기여해 주셔서 감사합니다!"
                    description="Vencord에 기여해 주셔서 멋진 배지를 드립니다!"
                    cardImage={COZY_CONTRIB_IMAGE}
                    backgroundImage={CONTRIB_BACKGROUND_IMAGE}
                    backgroundColor="#EDCC87"
                    buttonTitle="내가 기여한 내용 보기"
                    buttonOnClick={() => openContributorModal(user)}
                />
            )}

            <section>
                <Forms.FormTitle tag="h5">빠른 작업</Forms.FormTitle>

                <QuickActionCard>
                    <QuickAction
                        Icon={LogIcon}
                        text="알림 기록"
                        action={openNotificationLogModal}
                    />
                    <QuickAction
                        Icon={PaintbrushIcon}
                        text="QuickCSS 편집"
                        action={() => VencordNative.quickCss.openEditor()}
                    />
                    {!IS_WEB && (
                        <>
                            <QuickAction
                                Icon={RestartIcon}
                                text="Discord 다시 시작"
                                action={relaunch}
                            />
                            <QuickAction
                                Icon={FolderIcon}
                                text="설정 폴더 열기"
                                action={() => VencordNative.settings.openFolder()}
                            />
                        </>
                    )}
                    <QuickAction
                        Icon={GithubIcon}
                        text="소스 코드 보기"
                        action={() => VencordNative.native.openExternal("https://github.com/" + gitRemote)}
                    />
                </QuickActionCard>
            </section>

            <Divider />

            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">설정</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom20} style={{ color: "var(--text-muted)" }}>
                    팁: 이 설정 섹션의 위치는{" "}
                    <a onClick={() => openPluginModal(Vencord.Plugins.plugins.Settings)}>
                        Settings 플러그인 설정
                    </a>에서 변경할 수 있습니다!
                </Forms.FormText>

                <Switches />
            </section>


            {needsVibrancySettings && <VibrancySettings />}

            <NotificationSection />
        </SettingsTab>
    );
}

export default wrapTab(VencordSettings, "Vencord 설정");
