/**
 * Tool Transformer
 * 将MCP工具调用转换为OpenClaw工具调用
 */

import { MCPClientManager } from '../mcp/client';
import { ToolIdGenerator } from './registry';
import { logInfo, logDebug, logError, logToolCall, logPerformance, logErrorWithStack } from '../utils/logger';

/**
 * 工具调用上下文
 */
interface IToolContext {
  userId: string;
  channelId: string;
  metadata?: any;
}

/**
 * 工具调用结果
 */
interface IToolResult {
  success: boolean;
  data?: any;
  error?: string;
  mcpMetadata?: {
    server: string;
    tool: string;
    duration: number;
  };
}

/**
 * 参数转换器
 */
class ParameterTransformer {
  /**
   * OpenClaw参数 → MCP参数
   */
  static toMCP(openclawParams: any, mcpToolSchema: any): any {
    const mcpParams = {};

    // 基本类型映射
    for (const [key, value] of Object.entries(openclawParams)) {
      if (value === undefined || value === null) {
        continue;
      }

      // 根据MCP schema转换类型
      const schemaType = mcpToolSchema.properties?.[key]?.type;
      
      switch (schemaType) {
        case 'string':
          mcpParams[key] = String(value);
          break;
        case 'number':
        case 'integer':
          mcpParams[key] = Number(value);
          break;
        case 'boolean':
          mcpParams[key] = Boolean(value);
          break;
        case 'array':
          mcpParams[key] = Array.isArray(value) ? value : [value];
          break;
        case 'object':
          mcpParams[key] = typeof value === 'object' ? value : JSON.parse(value);
          break;
        default:
          mcpParams[key] = value;
      }
    }

    return mcpParams;
  }

  /**
   * MCP结果 → OpenClaw结果
   */
  static fromMCP(mcpResult: any, mcpToolName: string): IToolResult {
    return {
      success: true,
      data: mcpResult,
      mcpMetadata: {
        server: mcpResult.server,
        tool: mcpToolName,
        duration: mcpResult.duration || 0
      }
    };
  }

  /**
   * 错误处理
   */
  static fromError(error: Error, mcpToolName: string): IToolResult {
    return {
      success: false,
      error: error.message,
      mcpMetadata: {
        server: 'unknown',
        tool: mcpToolName,
        duration: 0
      }
    };
  }
}

/**
 * 工具转换器
 */
class ToolTransformer {
  /**
   * 创建OpenClaw工具处理器
   */
  static createHandler(
    serverId: string,
    mcpToolName: string,
    mcpToolSchema: any
  ) {
    const toolId = ToolIdGenerator.generate(serverId, mcpToolName);

    return async (openclawArgs: any, context: IToolContext) => {
      const startTime = Date.now();
      const mcpClientManager = new MCPClientManager();

      try {
        logDebug(`Transforming OpenClaw call to MCP call`, {
          toolId,
          openclawArgs,
          context
        });

        // 转换参数
        const mcpArgs = ParameterTransformer.toMCP(openclawArgs, mcpToolSchema);

        // 调用MCP工具
        const mcpResult = await mcpClientManager.callTool(serverId, mcpToolName, mcpArgs);

        const duration = Date.now() - startTime;

        // 性能日志
        logPerformance('Tool Call', duration, 500);

        // 工具调用日志
        logToolCall(serverId, mcpToolName, mcpArgs, mcpResult.data, null, duration);

        // 转换结果
        return ParameterTransformer.fromMCP(mcpResult, mcpToolName);
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logErrorWithStack(`MCP tool call failed`, error, {
          toolId,
          serverId,
          mcpToolName
        });

        logToolCall(serverId, mcpToolName, mcpArgs, null, error.message, duration);

        return ParameterTransformer.fromError(error, mcpToolName);
      }
    };
  }
}

export default ToolTransformer;
