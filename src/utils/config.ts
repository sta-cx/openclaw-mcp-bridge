/**
 * Config Storage
 * 配置存储管理（支持文件和内存）
 */

/**
 * 内存存储（开发用）
 */
const memoryStorage = new Map<string, any>();

/**
 * 读取配置
 */
export const configStorage = {
  async get(key: string): Promise<any> {
    // 优先从内存读取
    if (memoryStorage.has(key)) {
      return memoryStorage.get(key);
    }

    // TODO: 从文件系统读取
    return null;
  },

  async set(key: string, value: any): Promise<void> {
    // 存储到内存
    memoryStorage.set(key, value);

    // TODO: 持久化到文件系统
  },

  async delete(key: string): Promise<void> {
    memoryStorage.delete(key);

    // TODO: 从文件系统删除
  },

  async has(key: string): Promise<boolean> {
    return memoryStorage.has(key);
  },

  async clear(): Promise<void> {
    memoryStorage.clear();
  }
};

/**
 * 配置Schema
 */
export const configSchemas = {
  mcpServers: {
    type: 'object',
    additionalProperties: true,
    properties: {},
    description: 'MCP服务器配置'
  },

  toolMapping: {
    type: 'object',
    additionalProperties: true,
    properties: {
      mcpTool: {
        type: 'string',
        description: 'MCP工具名称'
      },
      openclawTool: {
        type: 'string',
        description: 'OpenClaw工具名称'
      }
    },
    required: ['mcpTool', 'openclawTool']
  }
};

/**
 * 配置验证器
 */
export const validateConfig = async (config: any, schema: any): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  // 检查必需字段
  if (schema === configSchemas.mcpServers) {
    for (const [serverId, serverConfig] of Object.entries(config)) {
      if (!serverConfig.type) {
        errors.push(`MCP server ${serverId} missing 'type'`);
      }

      if (!['stdio', 'http'].includes(serverConfig.type)) {
        errors.push(`MCP server ${serverId} invalid type: ${serverConfig.type}`);
      }

      if (serverConfig.type === 'stdio' && !serverConfig.command) {
        errors.push(`MCP server ${serverId} missing 'command'`);
      }

      if (serverConfig.type === 'http' && !serverConfig.url) {
        errors.push(`MCP server ${serverId} missing 'url'`);
      }

      if (!serverConfig.enabled) {
        errors.push(`MCP server ${serverId} must be explicitly enabled`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * 默认配置
 */
export const defaultConfigs = {
  mcpServers: {
    'zai-vision': {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@z_ai/mcp-server'],
      env: {
        Z_AI_API_KEY: '{{Z_AI_API_KEY}}',
        Z_AI_MODE: 'ZHIPU'
      },
      enabled: true
    }
  }
};

export default configStorage;
