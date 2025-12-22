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

import { useSettings } from "@api/Settings";
import { authorizeCloud, deauthorizeCloud } from "@api/SettingsSync/cloudSetup";
import { deleteCloudSettings, eraseAllCloudData, getCloudSettings, putCloudSettings } from "@api/SettingsSync/cloudSync";
import { BaseText } from "@components/BaseText";
import { Button, ButtonProps } from "@components/Button";
import { CheckedTextInput } from "@components/CheckedTextInput";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { FormSwitch } from "@components/FormSwitch";
import { Grid } from "@components/Grid";
import { Heading } from "@components/Heading";
import { CloudDownloadIcon, CloudUploadIcon, DeleteIcon, RestartIcon } from "@components/Icons";
import { Link } from "@components/Link";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { localStorage } from "@utils/localStorage";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { IconComponent } from "@utils/types";
import { Alerts, Select, Tooltip } from "@webpack/common";

function validateUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch {
        return "유효하지 않은 URL";
    }
}

const SectionHeading = ({ text }: { text: string; }) => (
    <BaseText
        tag="h5"
        size="lg"
        weight="semibold"
        className={Margins.bottom16}
    >
        {text}
    </BaseText>
);

function ButtonWithIcon({ children, Icon, className, ...buttonProps }: ButtonProps & { Icon: IconComponent; }) {
    return (
        <Button {...buttonProps} className={classes("vc-cloud-icon-with-button", className)}>
            <Icon className={"vc-cloud-button-icon"} />
            {children}
        </Button>
    );
}

function CloudSetupSection() {
    const { cloud } = useSettings(["cloud.authenticated", "cloud.url"]);

    return (
        <section>
            <SectionHeading text="클라우드 연동" />

            <Paragraph size="md" className={Margins.bottom20}>
                Vencord는 기기 간 설정 동기화 등을 제공하는 클라우드 연동을 지원합니다.
                <Link href="https://vencord.dev/cloud/privacy">개인정보를 존중하며</Link>,
                <Link href="https://github.com/Vencord/Backend">소스 코드</Link>는 AGPL 3.0 라이선스로 제공되어 직접 호스팅할 수도 있습니다.
            </Paragraph>
            <FormSwitch
                key="backend"
                title="클라우드 연동 활성화"
                description="아직 설정하지 않았다면 인증을 요청합니다."
                value={cloud.authenticated}
                onChange={v => {
                    if (v)
                        authorizeCloud();
                    else
                        cloud.authenticated = v;
                }}
            />
            <Heading tag="h5" className={Margins.top16}>백엔드 URL</Heading>
            <Paragraph className={Margins.bottom8}>
                클라우드 연동 시 사용할 백엔드 주소입니다.
            </Paragraph>
            <CheckedTextInput
                key="backendUrl"
                value={cloud.url}
                onChange={async v => {
                    cloud.url = v;
                    cloud.authenticated = false;
                    deauthorizeCloud();
                }}
                validate={validateUrl}
            />

            <Grid columns={1} gap="1em" className={Margins.top8}>
                <ButtonWithIcon
                    variant="primary"
                    disabled={!cloud.authenticated}
                    onClick={async () => {
                        await deauthorizeCloud();
                        cloud.authenticated = false;
                        await authorizeCloud();
                    }}
                    Icon={RestartIcon}
                >
                    다시 인증
                </ButtonWithIcon>
            </Grid>
        </section>
    );
}

function SettingsSyncSection() {
    const { cloud } = useSettings(["cloud.authenticated", "cloud.settingsSync"]);
    const sectionEnabled = cloud.authenticated && cloud.settingsSync;

    return (
        <section>
            <SectionHeading text="설정 동기화" />
            <Flex flexDirection="column" gap="1em">
                <FormSwitch
                    key="cloud-sync"
                    title="설정 동기화 사용"
                    description="Vencord 설정을 클라우드에 저장해 모든 기기에서 동일하게 유지합니다"
                    value={cloud.settingsSync}
                    onChange={v => { cloud.settingsSync = v; }}
                    disabled={!cloud.authenticated}
                    hideBorder
                />

                <div>
                    <Heading tag="h5">
                        이 기기의 동기화 규칙
                    </Heading>
                    <Paragraph className={Margins.bottom8}>
                        <strong>이 기기</strong>와 클라우드 간 설정 이동 방식을 선택합니다.
                        양방향으로 동기화하거나, 한 쪽을 기준으로 삼을 수 있습니다.
                    </Paragraph>
                    <Select
                        options={[
                            {
                                label: "양방향 동기화 (변경 사항이 서로 동기화)",
                                value: "both",
                                default: true,
                            },
                            {
                                label: "이 기기를 기준으로 함 (업로드만)",
                                value: "push",
                            },
                            {
                                label: "클라우드를 기준으로 함 (다운로드만)",
                                value: "pull",
                            },
                            {
                                label: "자동 동기화 안 함 (아래 버튼으로 수동 동기화)",
                                value: "manual",
                            }
                        ]}
                        isSelected={v => v === localStorage.Vencord_cloudSyncDirection}
                        serialize={v => String(v)}
                        select={v => {
                            localStorage.Vencord_cloudSyncDirection = v;
                        }}
                        closeOnSelect={true}
                    />
                </div>

                <Grid columns={2} gap="1em" className={Margins.top20}>
                    <ButtonWithIcon
                        variant="positive"
                        disabled={!sectionEnabled}
                        onClick={() => putCloudSettings(true)}
                        Icon={CloudUploadIcon}
                    >
                        설정 업로드
                    </ButtonWithIcon>
                    <Tooltip text="현재 설정을 클라우드에 저장된 값으로 덮어씁니다. 주의하세요!">
                        {({ onMouseLeave, onMouseEnter }) => (
                            <ButtonWithIcon
                                variant="dangerPrimary"
                                onMouseLeave={onMouseLeave}
                                onMouseEnter={onMouseEnter}
                                disabled={!sectionEnabled}
                                onClick={() => getCloudSettings(true, true)}
                                Icon={CloudDownloadIcon}
                            >
                                설정 다운로드
                            </ButtonWithIcon>
                        )}
                    </Tooltip>
                </Grid>
            </Flex>
        </section>
    );
}

function ResetSection() {
    const { authenticated, settingsSync } = useSettings(["cloud.authenticated", "cloud.settingsSync"]).cloud;

    return (
        <section>
            <SectionHeading text="클라우드 데이터 초기화" />

            <Grid columns={2} gap="1em">
                <ButtonWithIcon
                    variant="dangerPrimary"
                    disabled={!authenticated || !settingsSync}
                    onClick={() => deleteCloudSettings()}
                    Icon={DeleteIcon}
                >
                    클라우드에 저장된 설정 삭제
                </ButtonWithIcon>
                <ButtonWithIcon
                    variant="dangerPrimary"
                    disabled={!authenticated}
                    onClick={() => Alerts.show({
                        title: "정말 삭제할까요?",
                        body: "데이터를 지우면 복구할 수 없습니다. 이 작업은 되돌릴 수 없습니다!",
                        onConfirm: eraseAllCloudData,
                        confirmText: "삭제하기",
                        confirmColor: "vc-cloud-erase-data-danger-btn",
                        cancelText: "취소"
                    })}
                    Icon={DeleteIcon}
                >
                    클라우드 계정 삭제
                </ButtonWithIcon>
            </Grid>
        </section>
    );
}

function CloudTab() {
    return (
        <SettingsTab>
            <Flex flexDirection="column" gap="1em">
                <CloudSetupSection />
                <Divider />
                <SettingsSyncSection />
                <Divider />
                <ResetSection />
            </Flex>
        </SettingsTab>
    );
}

export default wrapTab(CloudTab, "클라우드");
