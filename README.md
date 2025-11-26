# 【FBIF】集成平台传输工具

这是一个为飞书多维表格（Lark Base）设计的字段捷径插件，专门用于与**飞书集成平台 (AnyCross)** 进行数据交互。

## 核心功能

1.  **HTTP POST 请求**: 将数据发送到指定的 Webhook URL。
2.  **双模式输入支持**:
    *   **JSON 模式**: 支持直接粘贴 API 文档中的 JSON 请求体（如 `{"key": "value"}`），结构复杂也不怕。
    *   **KV 模式**: 支持简单的 `key=value` 格式（如 `name=test; age=18`），快速录入参数。
3.  **纯净透传 (Pass-through)**:
    *   **输入纯净**: 插件不会对您的请求体进行任何额外的 `data` 或 `context` 包裹。您输入什么，发出去的就是什么。
    *   **输出纯净**: 插件直接返回目标接口的原始响应内容（Response Body），方便后续节点直接引用。
4.  **原始文本输出**: 响应结果以文本形式存储，所见即所得。

## 使用指南

### 1. 配置字段捷径

在多维表格中添加此字段捷径后，您需要配置以下两项：

*   **请求地址 (URL)**: 填写集成平台 Webhook 的触发地址。
*   **请求参数 (Payload)**: 填写您要发送的数据。

### 2. 输入格式示例

#### 方式 A：JSON 格式（推荐，支持复杂结构）
直接粘贴标准的 JSON 对象：
```json
{
  "flow_key": "your_flow_key",
  "data": {
    "order_id": "12345",
    "items": ["apple", "banana"]
  }
}
```

#### 方式 B：Key-Value 格式（快捷输入）
适用于简单参数，支持换行或分号分隔：
```text
flow_key=your_flow_key
order_id=12345
status=pending
```
*注：KV 模式会自动推断数字、布尔值和 null 类型。*

### 3. 输出结果

插件会将接口返回的完整 Body 内容填入单元格。
例如，如果集成平台返回：
```json
{
  "code": 0,
  "msg": "success",
  "data": { "id": "rec123" }
}
```
单元格中就会显示上述完整的 JSON 字符串。

## 开发与发布

### 本地开发
1.  安装依赖: `npm install`
2.  启动服务: `npm start`
3.  测试运行: `npm run dev`

### 发布打包
运行以下命令生成 `output/output.zip` 文件，以上传至开发者后台：
```bash
npm run pack
```
