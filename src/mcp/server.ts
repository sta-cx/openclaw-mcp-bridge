/**
 * MCP Server Manager
 * 管理MCP服务器连接和工具
 */

import { MCPClientManager } from './client';
import { logger } from './logger';
import { configStorage } from './config';

class MCPServerManager {
  /**
   * 管理MCP服务器
   */
  static async addServer(serverId: string, serverConfig: any): Promise<void> {
    try {
      const manager = new MCPClientManager();
      await manager.addServer(serverId, serverConfig);

      // 保存配置
      await MCPClientManager.saveServerConfig(serverId, serverConfig);

      logger.info(`MCP server ${serverId} added successfully`);
    } catch (error) {
      logger.error(`Failed to add MCP server ${serverId}:`, error);
      throw error;
    }
  }

  /**
   * 移除MCP服务器
   */
  static async removeServer(serverId: string): Promise<void> {
    try {
      const manager = new MCPClientManager();
      await manager.removeServer(serverId);

      // 删除配置
      await MCPClientManager.deleteServerConfig(serverId);

      logger.info(`MCP server ${serverId} removed successfully`);
    } catch (error) {
      logger.error(`Failed to remove MCP server ${serverId}:`, error);
      throw error;
    }
  }

  /**
   * 列出所有已配置的服务器
   */
  static async listServers(): Promise<any[]> {
    try {
      const configs = await MCPClientManager.getAllServerConfigs();
      const statuses = await new MCPClientManager().getAllServersStatus();

      return configs.map(config => {
        id: Object.keys(config)[0],
        ...config,
        status: statuses.find(s => s.server === Object.keys(config)[0]) || {
          server: Object.keys(config)[0],
          status: 'unknown'
        }
      });
    } catch (error) {
      logger.error('Failed to list MCP servers:', error);
      throw error;
    }
  }

  /**
   * 测试服务器连接
   */
  static async testConnection(serverId: string): Promise<any> {
    try {
      const manager = new MCPClientManager();
      const config = MCPClientManager.getServerConfig(serverId);
      const status = await manager.checkServerStatus(serverId);

      if (status.status !== 'connected') {
        // 尝试重新连接
        await manager.removeServer(serverId);
        await manager.addServer(serverId, config);
        const newStatus = await manager.checkServerStatus(serverId);

        return {
          server: serverId,
          originalStatus: status.status,
          currentStatus: newStatus.status,
          connected: newStatus.status === 'connected'
        };
      }

      return {
        server: serverId,
        status: status.status,
        connected: status.connected,
        toolsCount: status.toolsCount
      };
    } catch (error) {
      logger.error(`Failed to test connection for ${serverId}:`, error);
      return {
        server: serverId,
        status: 'error',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * 获取服务器的工具列表
   */
  static async getServerTools(serverId: string): Promise<any[]> {
    try {
      const manager = new MCPClientManager();
      return await manager.listTools(serverId);
    } catch (error) {
      logger.error(`Failed to get tools for ${serverId}:`, error);
      throw error;
    }
  }

  /**
   * 批量测试服务器连接
   */
  static async batchTestConnections(serverIds: string[]): Promise<any[]> {
    const results = [];

    for (const serverId of serverIds) {
      const result = await MCPServerManager.testConnection(serverId);
      results.push(result);
    }

    return results;
  }

  /**
   * 获取服务器统计
   */
  static async getStats(): Promise<any> {
    try {
      const configs = await MCPClientManager.getAllServerConfigs();
      const manager = new MCPClientManager();
      const statuses = await manager.getAllServersStatus();

      const stats = {
        totalServers: configs.length,
        connectedServers: statuses.filter(s => s.connected === true).length,
        disconnectedServers: statuses.filter(s => s.connected === false).length,
        totalTools: statuses.reduce((sum, s) => sum + (s.toolsCount || 0), 0),
        servers: configs.map(config => {
          id: Object.keys(config)[0],
          name: Object.values(config)[0]?.name || Object.keys(config)[0],
          status: statuses.find(s => s.server === Object.keys(config)[0])?.status || 'unknown',
          toolsCount: statuses.find(s => s.server === Object.keys(config)[0])?.toolsCount || 0
        })
      };

      logger.info('MCP server stats:', stats);
      return stats;
    } catch (error) {
      logger.error('Failed to get MCP server stats:', error);
      throw error;
    }
  }
}

export default MCPServerManager;
