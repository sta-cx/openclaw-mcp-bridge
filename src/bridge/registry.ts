/**
 * Bridge Tool Registry
 * 注册和管理OpenClaw工具
 */

import { MCPClientManager } from '../mcp/client';
import { logInfo, logDebug } from '../utils/logger';

/**
 * OpenClaw工具接口
 */
interface IOpenClawTool {
  id: string;
  name: string;
  description: string;
  parameters: any;
  handler: (args: any, context: any) => Promise<any>;
}

/**
 * 工具注册表
 */
class BridgeToolRegistry {
  private tools: Map<string, IOpenClawTool> = new Map();

  /**
   * 注册OpenClaw工具
   */
  register(tool: IOpenClawTool): void {
    this.tools.set(tool.id, tool);
    logDebug(`Tool registered: ${tool.id}`);
  }

  /**
   * 根据ID获取工具
   */
  getTool(id: string): IOpenClawTool | undefined {
    return this.tools.get(id);
  }

  /**
   * 列出所有工具
   */
  listTools(): IOpenClawTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 批量注册工具
   */
  batchRegister(tools: IOpenClawTool[]): void {
    tools.forEach(tool => this.register(tool));
  }

  /**
   * 取消注册工具
   */
  unregister(id: string): void {
    this.tools.delete(id);
    logDebug(`Tool unregistered: ${id}`);
  }

  /**
   * 清除所有工具
   */
  clear(): void {
    this.tools.clear();
  }
}

/**
 * 工具ID生成器
 */
class ToolIdGenerator {
  private static prefix = 'mcp_bridge';

  /**
   * 生成工具ID
   */
  static generate(serverId: string, mcpToolName: string): string {
    return `${this.prefix}.${serverId}.${mcpToolName}`;
  }

  /**
   * 解析工具ID
   */
  static parse(toolId: string): { serverId: string; mcpToolName: string } | null {
    if (!toolId.startsWith(this.prefix)) {
      return null;
    }

    const parts = toolId.slice(this.prefix.length + 1).split('.');
    if (parts.length !== 2) {
      return null;
    }

    return {
      serverId: parts[0],
      mcpToolName: parts[1]
    };
  }
}

export default BridgeToolRegistry;
export { IOpenClawTool, ToolIdGenerator };
