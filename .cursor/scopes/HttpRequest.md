# HTTP 请求器字段捷径说明书

## 目标
创建一个字段捷径，通过 HTTP POST 请求将数据发送到用户配置的指定 URL。此版本优化了参数输入方式，统一使用 JSON 格式以确保最大的兼容性和稳定性。

## 用户问题
用户希望通过多维表格字段触发 HTTP 回调。为了支持复杂的 API 请求结构（如嵌套对象、数组）并便于直接复用 API 文档中的示例，需要统一参数格式。

## 核心设计原则
1.  **双模式支持**:
    -   **JSON 模式**: 优先尝试解析为 JSON，支持完整对象结构。
    -   **键值对 (KV) 模式**: 解析失败时回退到 KV 模式，支持 `key=value` 格式，多参数用换行或分号分隔。
2.  **兼容性**: 直接支持 API 文档中常见的 JSON 请求体粘贴。
3.  **低门槛**: 简单参数可通过 `key=value` 快速输入，无需关心 JSON 语法。
4.  **纯净透传**: 不注入额外 Context，直接发送解析后的 Payload。

## 实现细节

### 输入项 (Form Items)

1.  **请求地址** (`url`):
    -   **组件**: `Input`
    -   **校验**: 必填
    -   **多语言**: 提示用户输入 URL。

2.  **请求参数** (`payload`):
    -   **组件**: `Input` (文本输入框)
    -   **格式**: **JSON 或 Key-Value**
    -   **说明**: 
        -   优先作为 JSON 解析。
        -   若非合法 JSON，则按 `key=value` 解析（分隔符支持换行或分号 `;`）。
        -   KV 模式支持基础类型自动推断（数字、布尔值、null）。
    -   **Props**:
        -   `placeholder`: 提供双模提示，例如 `{"key": "value"} 或 key=value`。
    -   **校验**: 必填

### 逻辑流程

1.  **输入处理**:
    -   获取 `url` 和 `payload`。
    -   **参数解析逻辑**:
        1.  **尝试 JSON 解析**: `JSON.parse(payload)`。成功则直接使用。
        2.  **回退 KV 解析**:
            -   按换行符 `\n` 或分号 `;` 分割字符串。
            -   每项按第一个 `=` 分割为 Key 和 Value。
            -   去除 Key/Value 首尾空格。
            -   **类型推断**:
                -   `true`/`false` -> Boolean
                -   `null` -> null
                -   数字字符串 -> Number
                -   其他 -> String
        3.  **容错处理**: 如果输入为空字符串，默认为 `{}`。

2.  **构建请求**:
    -   **方法**: `POST`
    -   **Headers**: `Content-Type: application/json`
    -   **Body**: 直接发送解析后的 JSON 对象。
        ```json
        <parsed_json_object>
        ```

3.  **执行请求**:
    -   使用 `context.fetch` 发送请求。

4.  **错误处理**:
    -   如果 JSON 解析失败且 KV 解析未提取到有效键值对（且输入不为空），可视为格式错误或作为空对象处理（视具体体验而定，建议记录日志但不阻断，除非完全无法解析）。

### 输出项 (Result Type)
- **类型**: 文本 (Text)
- **内容**: 直接返回 HTTP 响应体内容 (Response Body)。

## 示例 (Example)

**输入 Payload**:
```json
{
  "model": "ep-20251002114744-5hr7j",
  "messages": [
    {"role": "system","content": "你是人工智能助手."},
    {"role": "user","content": "你好"}
  ]
}
```

**发送的请求 Body**:
```json
{
  "model": "ep-20251002114744-5hr7j",
  "messages": [
    {"role": "system","content": "你是人工智能助手."},
    {"role": "user","content": "你好"}
  ]
}
```
*(完全透传，无额外字段)*

## 变更记录
- **v7**: 恢复 KV (Key-Value) 输入模式支持，实现 JSON/KV 双模解析。
- **v6**: 将输出类型从 Object 改为 Text，只返回响应内容本身，移除 status/timestamp 等元数据。
- **v5**: 移除 context 自动注入和 data 包裹，恢复为直接发送用户 payload，简化功能。
- **v4**: 强制将用户 Payload 包裹在 `data` 字段中，并注入 `context` (baseToken, tableId, recordId)。移除 `viewId`。
- **v3**: 废弃 KV 格式，统一为 JSON 格式，以支持复杂结构和 API 文档直接复制。
- **v2**: 将 `payload` 输入方式从 `FieldSelect` 改为 `Input`，支持 KV 字符串和 JSON 解析，支持类型自动推断。
