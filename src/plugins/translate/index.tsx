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

import "./styles.css";

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Message } from "@vencord/discord-types";
import { ChannelStore, Menu, MessageStore } from "@webpack/common";

import { settings } from "./settings";
import { setShouldShowTranslateEnabledTooltip, TranslateChatBarIcon, TranslateIcon } from "./TranslateIcon";
import { handleTranslate, TranslationAccessory } from "./TranslationAccessory";
import { translate } from "./utils";

function getMessagesInGroup(channelId: string, messageId: string, authorId: string): Message[] {
    if (!settings.store.translateMessageGroup) {
        const message = MessageStore.getMessage(channelId, messageId);
        return message ? [message] : [];
    }

    const messages = MessageStore.getMessages(channelId);
    if (!messages) return [];

    const allMessages = messages._array || [];
    const currentIndex = allMessages.findIndex((m: Message) => m.id === messageId);
    if (currentIndex === -1) return [];

    const group: Message[] = [allMessages[currentIndex]];

    // Find previous messages from the same author
    for (let i = currentIndex - 1; i >= 0; i--) {
        const msg = allMessages[i];
        if (msg.author.id !== authorId) break;

        // Check if messages are within 7 minutes (Discord's grouping rule)
        const timeDiff = Math.abs(new Date(group[0].timestamp).getTime() - new Date(msg.timestamp).getTime());
        if (timeDiff > 7 * 60 * 1000) break;

        group.unshift(msg);
    }

    // Find next messages from the same author
    for (let i = currentIndex + 1; i < allMessages.length; i++) {
        const msg = allMessages[i];
        if (msg.author.id !== authorId) break;

        const timeDiff = Math.abs(new Date(msg.timestamp).getTime() - new Date(group[group.length - 1].timestamp).getTime());
        if (timeDiff > 7 * 60 * 1000) break;

        group.push(msg);
    }

    return group.filter(m => getMessageContent(m));
}

async function translateMessageGroup(channelId: string, messageId: string, authorId: string) {
    const messages = getMessagesInGroup(channelId, messageId, authorId);
    if (messages.length === 0) return;

    if (messages.length === 1) {
        const content = getMessageContent(messages[0]);
        if (!content) return;
        const trans = await translate("received", content);
        handleTranslate(messages[0].id, trans);
        return;
    }

    // Combine all message contents
    const combinedContent = messages.map(m => getMessageContent(m)).join("\n\n");
    const trans = await translate("received", combinedContent);

    // Split the translation back and assign to each message
    const translatedParts = trans.text.split("\n\n");

    messages.forEach((msg, index) => {
        const translatedText = translatedParts[index] || translatedParts[translatedParts.length - 1];
        handleTranslate(msg.id, {
            sourceLanguage: trans.sourceLanguage,
            text: translatedText
        });
    });
}

const messageCtxPatch: NavContextMenuPatchCallback = (children, { message }: { message: Message; }) => {
    const content = getMessageContent(message);
    if (!content) return;

    const group = findGroupChildrenByChildId("copy-text", children);
    if (!group) return;

    group.splice(group.findIndex(c => c?.props?.id === "copy-text") + 1, 0, (
        <Menu.MenuItem
            id="vc-trans"
            label="번역"
            icon={TranslateIcon}
            action={() => translateMessageGroup(message.channel_id, message.id, message.author.id)}
        />
    ));
};


function getMessageContent(message: Message) {
    // Message snapshots is an array, which allows for nested snapshots, which Discord does not do yet.
    // no point collecting content or rewriting this to render in a certain way that makes sense
    // for something currently impossible.
    return message.content
        || message.messageSnapshots?.[0]?.message.content
        || message.embeds?.find(embed => embed.type === "auto_moderation_message")?.rawDescription || "";
}

let tooltipTimeout: any;

export default definePlugin({
    name: "Translate",
    description: "Google Translate 또는 DeepL로 메시지 번역",
    authors: [Devs.Ven, Devs.AshtonMemer],
    settings,
    contextMenus: {
        "message": messageCtxPatch
    },
    // not used, just here in case some other plugin wants it or w/e
    translate,

    renderMessageAccessory: props => <TranslationAccessory message={props.message} />,

    chatBarButton: {
        icon: TranslateIcon,
        render: TranslateChatBarIcon
    },

    messagePopoverButton: {
        icon: TranslateIcon,
        render(message: Message) {
            const content = getMessageContent(message);
            if (!content) return null;

            return {
                label: "번역",
                icon: TranslateIcon,
                message,
                channel: ChannelStore.getChannel(message.channel_id),
                onClick: () => translateMessageGroup(message.channel_id, message.id, message.author.id)
            };
        }
    },

    async onBeforeMessageSend(_, message) {
        if (!settings.store.autoTranslate) return;
        if (!message.content) return;

        setShouldShowTranslateEnabledTooltip?.(true);
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => setShouldShowTranslateEnabledTooltip?.(false), 2000);

        const trans = await translate("sent", message.content);
        message.content = trans.text;
    }
});
