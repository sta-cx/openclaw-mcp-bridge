/**
 * MCP Client Wrapper
 * 封装Model Context Protocol客户端
 */

import { Client } from '@modelcontextprotocol/sdk';
import { Server } from '@modelcontextprotocol/sdk/types.js';
import { logger } from './logger';
import { configStorage } from './config';

/**
 * MCP客户端管理器
 */
class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private tools: Map<string, Map<string, any>> = new Map();

  /**
   * 添加MCP服务器
   */
  async addServer(serverId: string, serverConfig: any): Promise<void> {
    try {
      const client = new Client({
        name: serverId,
        version: '1.0.0'
      });

      // 根据服务器类型连接
      if (serverConfig.type === 'stdio') {
        await client.connectStdioClient({
          command: serverConfig.command,
          args: serverConfig.args,
          env: serverConfig.env
        });
      } else if (serverConfig.type === 'http') {
        await client.connectToServer(serverConfig.url, {
          headers: serverConfig.headers || {}
        });
      } else {
        throw new Error(`Unsupported server type: ${serverConfig.type}`);
      }

      // 等待连接建立
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 列出可用工具
      const tools = await client.listTools();

      // 存储工具
      const toolMap = new Map<string, any>();
      for (const tool of tools.tools) {
        toolMap.set(tool.name, tool);
      }

      this.clients.set(serverId, client);
      this.tools.set(serverId, toolMap);

      logger.info(`MCP server ${serverId} connected with ${tools.tools.length} tools`);
    } catch (error) {
      logger.error(`Failed to connect MCP server ${serverId}:`, error);
      throw error;
    }
  }

  /**
   * 移除MCP服务器
   */
  async removeServer(serverId: string): Promise<void> {
    const client = this.clients.get(serverId);
    if (client) {
      await client.close();
      this.clients.delete(serverId);
      this.tools.delete(serverId);
      logger.info(`MCP server ${serverId} removed`);
    }
  }

  /**
   * 调用MCP工具
   */
  async callTool(
    serverId: string,
    toolName: string,
    args: any
  ): Promise<any> {
    const client = this.clients.get(serverId);
    const tools = this.tools.get(serverId);

    if (!client) {
      throw new Error(`MCP server ${serverId} not connected`);
    }

    const tool = tools?.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found on server ${serverId}`);
    }

    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args
      });

      return {
        success: true,
        data: result.content,
        server: serverId,
        tool: toolName,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to call tool ${toolName}:`, error);
      return {
        success: false,
        error: error.message,
        server: serverId,
        tool: toolName,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 列出服务器上的所有工具
   */
  async listTools(serverId: string): Promise<any[]> {
    const tools = this.tools.get(serverId);
    if (!tools) {
      return [];
    }

    return Array.from(tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  }

  /**
   * 检查服务器状态
   */
  async checkServerStatus(serverId: string): Promise<any> {
    const client = this.clients.get(serverId);
    if (!client) {
      return {
        server: serverId,
        status: 'disconnected',
        connected: false
      };
    }

    try {
      const tools = await this.listTools(serverId);
      return {
        server: serverId,
        status: 'connected',
        connected: true,
        toolsCount: tools.length
      };
    } catch (error) {
      return {
        server: serverId,
        status: 'error',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * 获取所有服务器状态
   */
  async getAllServersStatus(): Promise<any[]> {
    const statuses = [];

    for (const serverId of this.clients.keys()) {
      const status = await this.checkServerStatus(serverId);
      statuses.push(status);
    }

    return statuses;
  }

  /**
   * 批量调用工具
   */
  async batchCallTool(
    calls: Array<{ serverId: string; toolName: string; args: any }>
  ): Promise<any[]> {
    const results = [];

    for (const call of calls) {
      const result = await this.callTool(call.serverId, call.toolName, call.args);
      results.push(result);
    }

    return results;
  }

  /**
   * 获取服务器配置
   */
  static getServerConfig(serverId: string): any {
    return configStorage.get(`mcpServers.${serverId}`);
  }

  /**
   * 保存服务器配置
   */
  static async saveServerConfig(serverId: string, config: any): Promise<void> {
    await configStorage.set(`mcpServers.${serverId}`, config);
  }

  /**
   * 获取所有服务器配置
   */
  static async getAllServerConfigs(): Promise<any> {
    return configStorage.get('mcpServers') || {};
  }

  /**
   * 删除服务器配置
   */
  static async deleteServerConfig(serverId: string): Promise<void> {
    await configStorage.delete(`mcpServers.${serverId}`);
  }
}

export default MCPClientManager;
