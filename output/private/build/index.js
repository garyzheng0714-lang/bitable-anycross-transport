"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const { t } = block_basekit_server_api_1.field;
// Add the domain for the request
// 注意：如果你需要访问其他域名的接口，必须在此处添加域名白名单
// Note: If you need to access APIs from other domains, you must add them to this whitelist
block_basekit_server_api_1.basekit.addDomainList(['open.feishu.cn']);
block_basekit_server_api_1.basekit.addField({
    // Define i18n resources
    i18n: {
        messages: {
            'zh-CN': {
                'url': '请求地址',
                'url_placeholder': '请输入请求地址',
                'payload': '请求体 (Body)',
                'payload_placeholder': '支持 JSON 或 key=value 格式',
                'status': '状态码',
                'response': '响应结果',
                'timestamp': '请求时间',
                'extra_params': '更多参数',
                'retry_count': '重试次数',
                'retry_count_placeholder': '请输入重试次数，默认为0',
                'key1': '补充参数名 1',
                'value1': '补充参数值 1',
                'key2': '补充参数名 2',
                'value2': '补充参数值 2',
                'key3': '补充参数名 3',
                'value3': '补充参数值 3',
            },
            'en-US': {
                'url': 'Request URL',
                'url_placeholder': 'Please enter request URL',
                'payload': 'Request Body',
                'payload_placeholder': 'JSON or key=value format',
                'status': 'Status Code',
                'response': 'Response Body',
                'timestamp': 'Timestamp',
                'extra_params': 'More Parameters',
                'retry_count': 'Retry Count',
                'retry_count_placeholder': 'Please enter retry count, default is 0',
                'key1': 'Extra Key 1',
                'value1': 'Extra Value 1',
                'key2': 'Extra Key 2',
                'value2': 'Extra Value 2',
                'key3': 'Extra Key 3',
                'value3': 'Extra Value 3',
            },
            'ja-JP': {
                'url': 'リクエストURL',
                'url_placeholder': 'リクエストURLを入力してください',
                'payload': 'リクエストボディ',
                'payload_placeholder': 'JSON または key=value 形式',
                'status': 'ステータスコード',
                'response': 'レスポンス結果',
                'timestamp': 'タイムスタンプ',
                'extra_params': 'その他のパラメータ',
                'retry_count': 'リトライ回数',
                'retry_count_placeholder': 'リトライ回数を入力してください。デフォルトは0です',
                'key1': '追加キー 1',
                'value1': '追加値 1',
                'key2': '追加キー 2',
                'value2': '追加値 2',
                'key3': '追加キー 3',
                'value3': '追加値 3',
            },
        }
    },
    // Define input parameters
    formItems: [
        {
            key: 'url',
            label: t('url'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: t('url_placeholder'),
            },
            validator: {
                required: true,
            }
        },
        {
            key: 'payload',
            label: t('payload'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: t('payload_placeholder'),
            },
            validator: {
                required: false,
            }
        },
        {
            key: 'retry_count',
            label: t('retry_count'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: t('retry_count_placeholder'),
                defaultValue: '0',
            },
            validator: {
                required: false,
            }
        },
        {
            key: 'key1',
            label: t('key1'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {},
            validator: {
                required: false,
            }
        },
        {
            key: 'value1',
            label: t('value1'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {},
            validator: {
                required: false,
            }
        },
        {
            key: 'key2',
            label: t('key2'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {},
            validator: {
                required: false,
            }
        },
        {
            key: 'value2',
            label: t('value2'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {},
            validator: {
                required: false,
            }
        },
        {
            key: 'key3',
            label: t('key3'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {},
            validator: {
                required: false,
            }
        },
        {
            key: 'value3',
            label: t('value3'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {},
            validator: {
                required: false,
            }
        },
    ],
    // Define return result type
    resultType: {
        type: block_basekit_server_api_1.FieldType.Text,
    },
    // Execute function
    execute: async (formItemParams, context) => {
        const { url, payload, retry_count, key1, value1, key2, value2, key3, value3 } = formItemParams;
        // Debug logging helper
        function debugLog(arg, showContext = false) {
            // @ts-ignore
            if (!showContext) {
                console.log(JSON.stringify({ arg, logID: context.logID }), '\n');
                return;
            }
            console.log(JSON.stringify({
                formItemParams,
                context,
                arg
            }), '\n');
        }
        // Helper to extract text from field value
        function getTextFieldValue(fieldValue) {
            if (fieldValue === null || fieldValue === undefined)
                return '';
            if (typeof fieldValue === 'string')
                return fieldValue;
            if (typeof fieldValue === 'number')
                return String(fieldValue);
            // Handle array (e.g., from FieldSelect referencing a text/url field)
            if (Array.isArray(fieldValue)) {
                return fieldValue.map(item => {
                    if (typeof item === 'object') {
                        // Prioritize 'link' for URL fields, then 'text', then fallback to empty string
                        return item.link || item.text || '';
                    }
                    return String(item);
                }).join('');
            }
            // Handle object (e.g., single object field value)
            if (typeof fieldValue === 'object') {
                return fieldValue.link || fieldValue.text || JSON.stringify(fieldValue);
            }
            return String(fieldValue);
        }
        // Helper to parse payload string (JSON or Key-Value)
        function parsePayload(input) {
            if (!input || !input.trim())
                return {};
            // 1. Try JSON parsing first
            try {
                return JSON.parse(input);
            }
            catch (e) {
                // 2. Fallback to Key-Value parsing
                // Split by newline or semicolon
                const lines = input.split(/[\n;]/);
                const result = {};
                let hasKV = false;
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine)
                        continue;
                    // Find first '=' to split key and value
                    const equalIndex = trimmedLine.indexOf('=');
                    if (equalIndex === -1)
                        continue;
                    const key = trimmedLine.substring(0, equalIndex).trim();
                    const valueStr = trimmedLine.substring(equalIndex + 1).trim();
                    if (!key)
                        continue;
                    hasKV = true;
                    // Type inference
                    let value = valueStr;
                    if (valueStr === 'true')
                        value = true;
                    else if (valueStr === 'false')
                        value = false;
                    else if (valueStr === 'null')
                        value = null;
                    else if (!isNaN(Number(valueStr)) && valueStr !== '') {
                        value = Number(valueStr);
                    }
                    result[key] = value;
                }
                // If no valid KV found, but input wasn't empty, it might be malformed JSON or invalid format.
                // But we return the result anyway (might be empty object).
                // We can optionally log a warning if needed, but for now we just return what we parsed.
                if (!hasKV && input.trim()) {
                    console.warn('Payload parsing: Invalid JSON and no valid Key-Value pairs found.');
                }
                return result;
            }
        }
        debugLog('=====start HTTP Request=====', true);
        // Fetch wrapper with retry logic
        const fetch = async (url, init, authId) => {
            let retries = 0;
            const retryCountStr = getTextFieldValue(retry_count);
            const maxRetries = retryCountStr ? parseInt(retryCountStr, 10) : 0;
            while (true) {
                try {
                    const res = await context.fetch(url, init, authId);
                    const resText = await res.text();
                    debugLog({
                        [`===fetch res (attempt ${retries + 1})： ${url}`]: {
                            status: res.status,
                            resText: resText.slice(0, 4000),
                        }
                    });
                    // Check for 504 Gateway Time-out in HTML
                    const is504Html = resText.includes('<title>504 Gateway Time-out</title>');
                    // Check for specific JSON timeout error
                    let isJsonTimeout = false;
                    let parsedData = null;
                    try {
                        parsedData = JSON.parse(resText);
                        if (parsedData && parsedData.code === "5" && parsedData.message === "invoke timeout") {
                            isJsonTimeout = true;
                        }
                    }
                    catch {
                        // Not JSON, ignore
                    }
                    if ((is504Html || isJsonTimeout) && retries < maxRetries) {
                        console.log(`Request failed with timeout (504 or invoke timeout). Retrying... (${retries + 1}/${maxRetries})`);
                        retries++;
                        continue;
                    }
                    // Return result if no retry needed
                    if (parsedData) {
                        return {
                            status: res.status,
                            data: parsedData,
                            raw: resText
                        };
                    }
                    else {
                        return {
                            status: res.status,
                            data: resText,
                            raw: resText
                        };
                    }
                }
                catch (e) {
                    debugLog({
                        [`===fetch error (attempt ${retries + 1})： ${url}`]: {
                            error: e
                        }
                    });
                    if (retries < maxRetries) {
                        console.log(`Request failed with exception. Retrying... (${retries + 1}/${maxRetries})`);
                        retries++;
                        continue;
                    }
                    throw e;
                }
            }
        };
        try {
            // URL is from Input component, should be string, but use helper for safety
            const targetUrl = getTextFieldValue(url).trim();
            // Payload is from Input component, needs parsing
            const payloadStr = getTextFieldValue(payload);
            let payloadData;
            try {
                payloadData = parsePayload(payloadStr);
                // Merge extra params
                const extraParams = [
                    { key: key1, value: value1 },
                    { key: key2, value: value2 },
                    { key: key3, value: value3 }
                ];
                for (const param of extraParams) {
                    const k = getTextFieldValue(param.key).trim();
                    if (k) {
                        payloadData[k] = getTextFieldValue(param.value);
                    }
                }
            }
            catch (e) {
                // Log parsing error specifically
                console.error('Payload parsing error:', e);
                debugLog({
                    '===JSON Parsing Error': String(e),
                    'rawPayload': payloadStr
                });
                // We could return a specific error code, but FieldCode.Error is standard
                return {
                    code: block_basekit_server_api_1.FieldCode.Error
                };
            }
            if (!targetUrl) {
                throw new Error('Invalid URL');
            }
            debugLog({ targetUrl, payloadData });
            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payloadData)
            });
            return {
                code: block_basekit_server_api_1.FieldCode.Success,
                data: typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
            };
        }
        catch (e) {
            console.log('====error', String(e));
            debugLog({
                '===999 Exception': String(e)
            });
            return {
                code: block_basekit_server_api_1.FieldCode.Error,
            };
        }
    },
});
exports.default = block_basekit_server_api_1.basekit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBdUg7QUFDdkgsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLGdDQUFLLENBQUM7QUFFcEIsaUNBQWlDO0FBQ2pDLGlDQUFpQztBQUNqQywyRkFBMkY7QUFDM0Ysa0NBQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7QUFFMUMsa0NBQU8sQ0FBQyxRQUFRLENBQUM7SUFDZix3QkFBd0I7SUFDeEIsSUFBSSxFQUFFO1FBQ0osUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRSxNQUFNO2dCQUNiLGlCQUFpQixFQUFFLFNBQVM7Z0JBQzVCLFNBQVMsRUFBRSxZQUFZO2dCQUN2QixxQkFBcUIsRUFBRSx3QkFBd0I7Z0JBQy9DLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxNQUFNO2dCQUNsQixXQUFXLEVBQUUsTUFBTTtnQkFDbkIsY0FBYyxFQUFFLE1BQU07Z0JBQ3RCLGFBQWEsRUFBRSxNQUFNO2dCQUNyQix5QkFBeUIsRUFBRSxjQUFjO2dCQUN6QyxNQUFNLEVBQUUsU0FBUztnQkFDakIsUUFBUSxFQUFFLFNBQVM7Z0JBQ25CLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixRQUFRLEVBQUUsU0FBUztnQkFDbkIsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLFFBQVEsRUFBRSxTQUFTO2FBQ3BCO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRSxhQUFhO2dCQUNwQixpQkFBaUIsRUFBRSwwQkFBMEI7Z0JBQzdDLFNBQVMsRUFBRSxjQUFjO2dCQUN6QixxQkFBcUIsRUFBRSwwQkFBMEI7Z0JBQ2pELFFBQVEsRUFBRSxhQUFhO2dCQUN2QixVQUFVLEVBQUUsZUFBZTtnQkFDM0IsV0FBVyxFQUFFLFdBQVc7Z0JBQ3hCLGNBQWMsRUFBRSxpQkFB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