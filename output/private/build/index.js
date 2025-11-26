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
                'payload': '请求参数',
                'payload_placeholder': '支持 JSON 或 key=value 格式',
                'status': '状态码',
                'response': '响应结果',
                'timestamp': '请求时间',
            },
            'en-US': {
                'url': 'Request URL',
                'url_placeholder': 'Please enter request URL',
                'payload': 'Payload',
                'payload_placeholder': 'JSON or key=value format',
                'status': 'Status Code',
                'response': 'Response Body',
                'timestamp': 'Timestamp',
            },
            'ja-JP': {
                'url': 'リクエストURL',
                'url_placeholder': 'リクエストURLを入力してください',
                'payload': 'リクエスト内容',
                'payload_placeholder': 'JSON または key=value 形式',
                'status': 'ステータスコード',
                'response': 'レスポンス結果',
                'timestamp': 'タイムスタンプ',
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
                required: true,
            }
        },
    ],
    // Define return result type
    resultType: {
        type: block_basekit_server_api_1.FieldType.Text,
    },
    // Execute function
    execute: async (formItemParams, context) => {
        const { url, payload } = formItemParams;
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
        // Fetch wrapper
        const fetch = async (url, init, authId) => {
            try {
                const res = await context.fetch(url, init, authId);
                const resText = await res.text();
                debugLog({
                    [`===fetch res： ${url}`]: {
                        status: res.status,
                        resText: resText.slice(0, 4000),
                    }
                });
                // Try to parse JSON, if fails return text
                try {
                    return {
                        status: res.status,
                        data: JSON.parse(resText),
                        raw: resText
                    };
                }
                catch {
                    return {
                        status: res.status,
                        data: resText,
                        raw: resText
                    };
                }
            }
            catch (e) {
                debugLog({
                    [`===fetch error： ${url}`]: {
                        error: e
                    }
                });
                throw e;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBNEc7QUFDNUcsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLGdDQUFLLENBQUM7QUFFcEIsaUNBQWlDO0FBQ2pDLGlDQUFpQztBQUNqQywyRkFBMkY7QUFDM0Ysa0NBQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7QUFFMUMsa0NBQU8sQ0FBQyxRQUFRLENBQUM7SUFDZix3QkFBd0I7SUFDeEIsSUFBSSxFQUFFO1FBQ0osUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRSxNQUFNO2dCQUNiLGlCQUFpQixFQUFFLFNBQVM7Z0JBQzVCLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixxQkFBcUIsRUFBRSx3QkFBd0I7Z0JBQy9DLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxNQUFNO2dCQUNsQixXQUFXLEVBQUUsTUFBTTthQUNwQjtZQUNELE9BQU8sRUFBRTtnQkFDUCxLQUFLLEVBQUUsYUFBYTtnQkFDcEIsaUJBQWlCLEVBQUUsMEJBQTBCO2dCQUM3QyxTQUFTLEVBQUUsU0FBUztnQkFDcEIscUJBQXFCLEVBQUUsMEJBQTBCO2dCQUNqRCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsVUFBVSxFQUFFLGVBQWU7Z0JBQzNCLFdBQVcsRUFBRSxXQUFXO2FBQ3pCO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRSxVQUFVO2dCQUNqQixpQkFBaUIsRUFBRSxtQkFBbUI7Z0JBQ3RDLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixxQkFBcUIsRUFBRSx1QkFBdUI7Z0JBQzlDLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixVQUFVLEVBQUUsU0FBUztnQkFDckIsV0FBVyxFQUFFLFNBQVM7YUFDdkI7U0FDRjtLQUNGO0lBQ0QsMEJBQTBCO0lBQzFCLFNBQVMsRUFBRTtRQUNUO1lBQ0UsR0FBRyxFQUFFLEtBQUs7WUFDVixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNmLFNBQVMsRUFBRSx5Q0FBYyxDQUFDLEtBQUs7WUFDL0IsS0FBSyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUM7YUFDbEM7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLElBQUk7YUFDZjtTQUNGO1FBQ0Q7WUFDRSxHQUFHLEVBQUUsU0FBUztZQUNkLEtBQUssRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ25CLFNBQVMsRUFBRSx5Q0FBYyxDQUFDLEtBQUs7WUFDL0IsS0FBSyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxDQUFDLENBQUMscUJBQXFCLENBQUM7YUFDdEM7WUFDRCxTQUFTLEVBQUU7Z0JBQ1QsUUFBUSxFQUFFLElBQUk7YUFDZjtTQUNGO0tBQ0Y7SUFDRCw0QkFBNEI7SUFDNUIsVUFBVSxFQUFFO1FBQ1YsSUFBSSxFQUFFLG9DQUFTLENBQUMsSUFBSTtLQUNyQjtJQUNELG1CQUFtQjtJQUNuQixPQUFPLEVBQUUsS0FBSyxFQUFFLGNBQTBDLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDckUsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxjQUFjLENBQUM7UUFFeEMsdUJBQXVCO1FBQ3ZCLFNBQVMsUUFBUSxDQUFDLEdBQVEsRUFBRSxXQUFXLEdBQUcsS0FBSztZQUM3QyxhQUFhO1lBQ2IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNqRSxPQUFPO1lBQ1QsQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDekIsY0FBYztnQkFDZCxPQUFPO2dCQUNQLEdBQUc7YUFDSixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDWixDQUFDO1FBRUQsMENBQTBDO1FBQzFDLFNBQVMsaUJBQWlCLENBQUMsVUFBZTtZQUN0QyxJQUFJLFVBQVUsS0FBSyxJQUFJLElBQUksVUFBVSxLQUFLLFNBQVM7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFDL0QsSUFBSSxPQUFPLFVBQVUsS0FBSyxRQUFRO2dCQUFFLE9BQU8sVUFBVSxDQUFDO1lBQ3RELElBQUksT0FBTyxVQUFVLEtBQUssUUFBUTtnQkFBRSxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUU5RCxxRUFBcUU7WUFDckUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDekIsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQzt3QkFDM0IsK0VBQStFO3dCQUMvRSxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ3hDLENBQUM7b0JBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoQixDQUFDO1lBRUQsa0RBQWtEO1lBQ2xELElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ2hDLE9BQU8sVUFBVSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDN0UsQ0FBQztZQUVELE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFFRCxxREFBcUQ7UUFDckQsU0FBUyxZQUFZLENBQUMsS0FBYTtZQUMvQixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFBRSxPQUFPLEVBQUUsQ0FBQztZQUV2Qyw0QkFBNEI7WUFDNUIsSUFBSSxDQUFDO2dCQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDVCxtQ0FBbUM7Z0JBQ25DLGdDQUFnQztnQkFDaEMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkMsTUFBTSxNQUFNLEdBQXdCLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO2dCQUVsQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO29CQUN2QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxXQUFXO3dCQUFFLFNBQVM7b0JBRTNCLHdDQUF3QztvQkFDeEMsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDNUMsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDO3dCQUFFLFNBQVM7b0JBRWhDLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN4RCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFOUQsSUFBSSxDQUFDLEdBQUc7d0JBQUUsU0FBUztvQkFFbkIsS0FBSyxHQUFHLElBQUksQ0FBQztvQkFFYixpQkFBaUI7b0JBQ2pCLElBQUksS0FBSyxHQUFRLFFBQVEsQ0FBQztvQkFDMUIsSUFBSSxRQUFRLEtBQUssTUFBTTt3QkFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDO3lCQUNqQyxJQUFJLFFBQVEsS0FBSyxPQUFPO3dCQUFFLEtBQUssR0FBRyxLQUFLLENBQUM7eUJBQ3hDLElBQUksUUFBUSxLQUFLLE1BQU07d0JBQUUsS0FBSyxHQUFHLElBQUksQ0FBQzt5QkFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxRQUFRLEtBQUssRUFBRSxFQUFFLENBQUM7d0JBQ2xELEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzlCLENBQUM7b0JBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDeEIsQ0FBQztnQkFFRCw4RkFBOEY7Z0JBQzlGLDJEQUEyRDtnQkFDM0Qsd0ZBQXdGO2dCQUN4RixJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO29CQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLG1FQUFtRSxDQUFDLENBQUM7Z0JBQ3RGLENBQUM7Z0JBRUQsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQztRQUNMLENBQUM7UUFFRCxRQUFRLENBQUMsOEJBQThCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFL0MsZ0JBQWdCO1FBQ2hCLE1BQU0sS0FBSyxHQUEwSCxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUMvSixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVqQyxRQUFRLENBQUM7b0JBQ1AsQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUMsRUFBRTt3QkFDeEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO3dCQUNsQixPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO3FCQUNoQztpQkFDRixDQUFDLENBQUM7Z0JBRUgsMENBQTBDO2dCQUMxQyxJQUFJLENBQUM7b0JBQ0QsT0FBTzt3QkFDSCxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU07d0JBQ2xCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQzt3QkFDekIsR0FBRyxFQUFFLE9BQU87cUJBQ1IsQ0FBQztnQkFDYixDQUFDO2dCQUFDLE1BQU0sQ0FBQztvQkFDTCxPQUFPO3dCQUNILE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTt3QkFDbEIsSUFBSSxFQUFFLE9BQU87d0JBQ2IsR0FBRyxFQUFFLE9BQU87cUJBQ1IsQ0FBQztnQkFDYixDQUFDO1lBQ0gsQ0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxDQUFDO29CQUNQLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDLEVBQUU7d0JBQzFCLEtBQUssRUFBRSxDQUFDO3FCQUNUO2lCQUNGLENBQUMsQ0FBQztnQkFDSCxNQUFNLENBQUMsQ0FBQztZQUNWLENBQUM7UUFDSCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUM7WUFDSCwyRUFBMkU7WUFDM0UsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFaEQsaURBQWlEO1lBQ2pELE1BQU0sVUFBVSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTlDLElBQUksV0FBZ0IsQ0FBQztZQUNyQixJQUFJLENBQUM7Z0JBQ0QsV0FBVyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDVCxpQ0FBaUM7Z0JBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLFFBQVEsQ0FBQztvQkFDUCx1QkFBdUIsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxZQUFZLEVBQUUsVUFBVTtpQkFDekIsQ0FBQyxDQUFDO2dCQUNILHlFQUF5RTtnQkFDekUsT0FBTztvQkFDSCxJQUFJLEVBQUUsb0NBQVMsQ0FBQyxLQUFLO2lCQUN4QixDQUFDO1lBQ04sQ0FBQztZQUVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDYixNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ25DLENBQUM7WUFFRCxRQUFRLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUVyQyxNQUFNLEdBQUcsR0FBUSxNQUFNLEtBQUssQ0FBQyxTQUFTLEVBQUU7Z0JBQ3RDLE1BQU0sRUFBRSxNQUFNO2dCQUNkLE9BQU8sRUFBRTtvQkFDTCxjQUFjLEVBQUUsa0JBQWtCO2lCQUNyQztnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7YUFDbEMsQ0FBQyxDQUFDO1lBRUgsT0FBTztnQkFDTCxJQUFJLEVBQUUsb0NBQVMsQ0FBQyxPQUFPO2dCQUN2QixJQUFJLEVBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO2FBQ3pFLENBQUE7UUFFSCxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLFFBQVEsQ0FBQztnQkFDUCxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2FBQzlCLENBQUMsQ0FBQztZQUNILE9BQU87Z0JBQ0wsSUFBSSxFQUFFLG9DQUFTLENBQUMsS0FBSzthQUN0QixDQUFBO1FBQ0gsQ0FBQztJQUNILENBQUM7Q0FDRixDQUFDLENBQUM7QUFDSCxrQkFBZSxrQ0FBTyxDQUFDIn0=