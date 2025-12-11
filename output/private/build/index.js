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
                mode: 'textarea',
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