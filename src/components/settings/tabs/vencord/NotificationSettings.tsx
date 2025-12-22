/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { useSettings } from "@api/Settings";
import { ErrorCard } from "@components/ErrorCard";
import { Flex } from "@components/Flex";
import { Margins } from "@utils/margins";
import { identity } from "@utils/misc";
import { ModalCloseButton, ModalContent, ModalHeader, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { Button, Forms, Select, Slider, Text } from "@webpack/common";

export function NotificationSection() {
    return (
        <section className={Margins.top16}>
            <Forms.FormTitle tag="h5">알림</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8}>
                Vencord가 보내는 알림 설정입니다.
                Discord 자체 알림(메시지 등)은 포함되지 않습니다.
            </Forms.FormText>
            <Flex>
                <Button onClick={openNotificationSettingsModal}>
                    알림 설정
                </Button>
                <Button onClick={openNotificationLogModal}>
                    알림 로그 보기
                </Button>
            </Flex>
        </section>
    );
}

export function openNotificationSettingsModal() {
    openModal(props => (
        <ModalRoot {...props} size={ModalSize.MEDIUM}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>알림 설정</Text>
                <ModalCloseButton onClick={props.onClose} />
            </ModalHeader>

            <ModalContent>
                <NotificationSettings />
            </ModalContent>
        </ModalRoot>
    ));
}

function NotificationSettings() {
    const settings = useSettings(["notifications.*"]).notifications;

    return (
        <div style={{ padding: "1em 0" }}>
            <Forms.FormTitle tag="h5">알림 스타일</Forms.FormTitle>
            {settings.useNative !== "never" && Notification?.permission === "denied" && (
                <ErrorCard style={{ padding: "1em" }} className={Margins.bottom8}>
                    <Forms.FormTitle tag="h5">데스크톱 알림 권한 거부됨</Forms.FormTitle>
                    <Forms.FormText>알림 권한을 거부하여 데스크톱 알림이 동작하지 않습니다.</Forms.FormText>
                </ErrorCard>
            )}
            <Forms.FormText className={Margins.bottom8}>
                일부 플러그인이 알림을 표시할 수 있으며, 다음 두 가지 방식이 있습니다:
                <ul>
                    <li><strong>Vencord 알림</strong>: 클라이언트 안에서 표시되는 알림</li>
                    <li><strong>데스크톱 알림</strong>: 운영체제 기본 알림 (메시지 수신과 동일)</li>
                </ul>
            </Forms.FormText>
            <Select
                placeholder="알림 스타일"
                options={[
                    { label: "Discord가 포커스되어 있지 않을 때만 데스크톱 알림 사용", value: "not-focused", default: true },
                    { label: "항상 데스크톱 알림 사용", value: "always" },
                    { label: "항상 Vencord 알림 사용", value: "never" },
                ] satisfies Array<{ value: typeof settings["useNative"]; } & Record<string, any>>}
                closeOnSelect={true}
                select={v => settings.useNative = v}
                isSelected={v => v === settings.useNative}
                serialize={identity}
            />

            <Forms.FormTitle tag="h5" className={Margins.top16 + " " + Margins.bottom8}>알림 위치</Forms.FormTitle>
            <Select
                isDisabled={settings.useNative === "always"}
                placeholder="알림 위치"
                options={[
                    { label: "오른쪽 아래", value: "bottom-right", default: true },
                    { label: "오른쪽 위", value: "top-right" },
                ] satisfies Array<{ value: typeof settings["position"]; } & Record<string, any>>}
                select={v => settings.position = v}
                isSelected={v => v === settings.position}
                serialize={identity}
            />

            <Forms.FormTitle tag="h5" className={Margins.top16 + " " + Margins.bottom8}>알림 표시 시간</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom16}>0초로 설정하면 자동으로 사라지지 않습니다</Forms.FormText>
            <Slider
                disabled={settings.useNative === "always"}
                markers={[0, 1000, 2500, 5000, 10_000, 20_000]}
                minValue={0}
                maxValue={20_000}
                initialValue={settings.timeout}
                onValueChange={v => settings.timeout = v}
                onValueRender={v => (v / 1000).toFixed(2) + "s"}
                onMarkerRender={v => (v / 1000) + "s"}
                stickToMarkers={false}
            />

            <Forms.FormTitle tag="h5" className={Margins.top16 + " " + Margins.bottom8}>알림 로그 최대 개수</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom16}>
                오래된 항목을 지우기 전까지 로그에 저장할 알림 개수입니다.
                <code>0</code>으로 설정하면 알림 로그를 끄고, <code>∞</code>로 설정하면 자동으로 삭제하지 않습니다.
            </Forms.FormText>
            <Slider
                markers={[0, 25, 50, 75, 100, 200]}
                minValue={0}
                maxValue={200}
                stickToMarkers={true}
                initialValue={settings.logLimit}
                onValueChange={v => settings.logLimit = v}
                onValueRender={v => v === 200 ? "∞" : v}
                onMarkerRender={v => v === 200 ? "∞" : v}
            />
        </div>
    );
}
