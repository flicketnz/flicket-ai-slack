"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mrkdwn = mrkdwn;
exports.plainText = plainText;
exports.section = section;
exports.divider = divider;
exports.context = context;
exports.codeBlock = codeBlock;
exports.formatSlackMessage = formatSlackMessage;
/**
 * Format a text string as a Slack mrkdwn text object
 */
function mrkdwn(text) {
    return {
        type: "mrkdwn",
        text,
        verbatim: true,
    };
}
/**
 * Format a text string as a Slack plain_text object
 */
function plainText(text, emoji = true) {
    return {
        type: "plain_text",
        text,
        emoji,
    };
}
/**
 * Create a Slack section block with text
 */
function section(text) {
    return {
        type: "section",
        text: mrkdwn(text),
    };
}
/**
 * Create a Slack divider block
 */
function divider() {
    return {
        type: "divider",
    };
}
/**
 * Create a Slack context block with text
 */
function context(text) {
    return {
        type: "context",
        elements: [mrkdwn(text)],
    };
}
/**
 * Create a Slack code block for code snippets
 */
function codeBlock(code, language = "") {
    return {
        type: "rich_text",
        elements: [
            {
                type: "rich_text_preformatted",
                elements: [
                    {
                        type: "text",
                        text: code,
                        code: true,
                        language: language || undefined,
                    },
                ],
            },
        ],
    };
}
/**
 * Parse markdown-style code blocks into Slack code blocks
 */
function parseCodeBlocks(text) {
    const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;
    const blocks = [];
    let lastIndex = 0;
    let match;
    // Find all code blocks
    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Add text before code block as a section if it exists
        const beforeText = text.substring(lastIndex, match.index).trim();
        if (beforeText) {
            blocks.push(section(beforeText));
        }
        // Add the code block
        const language = match[1];
        const code = match[2];
        blocks.push(codeBlock(code, language));
        lastIndex = match.index + match[0].length;
    }
    // Add remaining text after the last code block
    const remainingText = text.substring(lastIndex).trim();
    return { blocks, remainingText };
}
/**
 * Split text into paragraphs and create section blocks
 */
function textToSections(text) {
    if (!text)
        return [];
    // Split by double newlines to get paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs
        .filter(p => p.trim().length > 0)
        .map(p => section(p.trim()));
}
/**
 * Format a message for Slack using Block Kit
 * This converts a raw text message into Slack blocks with proper formatting
 */
function formatSlackMessage(text, options = {}) {
    const { parseMarkdown = true, includeRawText = false } = options;
    const blocks = [];
    if (parseMarkdown) {
        // Parse code blocks first
        const { blocks: codeBlocks, remainingText } = parseCodeBlocks(text);
        blocks.push(...codeBlocks);
        // Process remaining text as sections
        if (remainingText) {
            blocks.push(...textToSections(remainingText));
        }
    }
    else {
        // Just add the text as a single section
        blocks.push(section(text));
    }
    return {
        // Include the raw text for fallback
        text: includeRawText ? text : undefined,
        blocks,
    };
}
