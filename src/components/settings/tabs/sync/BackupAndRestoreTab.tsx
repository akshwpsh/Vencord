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

import { downloadSettingsBackup, uploadSettingsBackup } from "@api/SettingsSync/offline";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Heading } from "@components/Heading";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { Margins } from "@utils/margins";
import { Button, Text } from "@webpack/common";

function BackupAndRestoreTab() {
    return (
        <SettingsTab>
            <Flex flexDirection="column" gap="0.5em">
                <Card variant="warning">
                    <Heading tag="h4">경고</Heading>
                    <Paragraph>설정 파일을 불러오면 현재 설정이 덮어씌워집니다.</Paragraph>
                </Card>

                <Text variant="text-md/normal" className={Margins.bottom8}>
                    Vencord 설정을 JSON 파일로 내보내거나 불러올 수 있습니다.
                    이를 통해 다른 기기로 설정을 옮기거나,
                    Vencord나 Discord를 재설치한 뒤 설정을 복구할 수 있습니다.
                </Text>

                <Heading tag="h4">내보내기 항목:</Heading>
                <Text variant="text-md/normal" className={Margins.bottom8}>
                    <ul>
                        <li>&mdash; 커스텀 QuickCSS</li>
                        <li>&mdash; 테마 링크</li>
                        <li>&mdash; 플러그인 설정</li>
                    </ul>
                </Text>

                <Flex>
                    <Button onClick={() => uploadSettingsBackup()}>
                        설정 불러오기
                    </Button>
                    <Button onClick={downloadSettingsBackup}>
                        설정 내보내기
                    </Button>
                </Flex>
            </Flex>
        </SettingsTab >
    );
}

export default wrapTab(BackupAndRestoreTab, "백업 및 복원");
