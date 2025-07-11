"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericReplyAppMentionHandler = void 0;
const node_server_sdk_1 = require("@traceloop/node-server-sdk");
const config_1 = require("../../config/config");
const llm_1 = require("../../llm");
/**
 * Class that handles user messages sent to the AI bot directly as a DM.
 */
class GenericReplyAppMentionHandler {
    llmProvider = llm_1.LLMFactory.createProvider(config_1.appConfig);
    /**
     * Handles user messages sent to the AI bot directly as a DM.
     */
    async handle({ event, body, say }) {
        const generatedResponse = await this.llmProvider.generateResponse([], event.text, event.ts);
        await say({ text: generatedResponse });
    }
}
exports.GenericReplyAppMentionHandler = GenericReplyAppMentionHandler;
__decorate([
    (0, node_server_sdk_1.task)({ name: "GenericReplyAppMentionHandler.handle" })
], GenericReplyAppMentionHandler.prototype, "handle", null);
