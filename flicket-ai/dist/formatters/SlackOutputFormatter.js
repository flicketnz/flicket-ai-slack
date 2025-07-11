"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackOutputFormatter = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const slackFormatting_1 = require("../utils/slackFormatting");
/**
 * Output parser that formats LLM responses for Slack's rich text format
 * This parser takes the raw text output from the LLM and converts it to
 * a format that can be used with Slack's Block Kit API
 */
class SlackOutputFormatter extends output_parsers_1.BaseOutputParser {
    static lc_name() {
        return "SlackOutputFormatter";
    }
    constructor(options = {
        parseMarkdown: true,
        includeRawText: false,
    }) {
        super();
        this.options = options;
        this.lc_namespace = ["flicket", "formatters"];
    }
    /**
     * Parse the LLM output into Slack blocks
     * @param text - The raw text output from the LLM
     * @returns A formatted Slack message with blocks
     */
    async parse(text) {
        return (0, slackFormatting_1.formatSlackMessage)(text, this.options);
    }
    /**
     * Get the format instructions for the LLM
     * @returns Instructions for the LLM on how to format its output
     */
    getFormatInstructions() {
        return `
Format your response using Slack's mrkdwn syntax:
- Use *bold* for emphasis
- Use _italic_ for emphasis
- Use ~strikethrough~ for strikethrough
- Use \`code\` for inline code
- Use \`\`\`code blocks\`\`\` for multi-line code (specify language after first backticks)
- Use > for blockquotes
- Use bullet points with • or -
- Use numbered lists with 1. 2. 3.
- Use <URL|text> for links

Your response will be parsed and formatted for Slack's Block Kit API.
`;
    }
}
exports.SlackOutputFormatter = SlackOutputFormatter;
