import { basekit, FieldType, field, FieldComponent, FieldCode } from '@lark-opdev/block-basekit-server-api';
const { t } = field;

// Add the domain for the request
// 注意：如果你需要访问其他域名的接口，必须在此处添加域名白名单
// Note: If you need to access APIs from other domains, you must add them to this whitelist
basekit.addDomainList(['open.feishu.cn']);

basekit.addField({
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
      component: FieldComponent.Input,
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
      component: FieldComponent.Input,
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
    type: FieldType.Text,
  },
  // Execute function
  execute: async (formItemParams: { url: any, payload: any }, context) => {
    const { url, payload } = formItemParams;

    // Debug logging helper
    function debugLog(arg: any, showContext = false) {
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
    function getTextFieldValue(fieldValue: any): string {
        if (fieldValue === null || fieldValue === undefined) return '';
        if (typeof fieldValue === 'string') return fieldValue;
        if (typeof fieldValue === 'number') return String(fieldValue);
        
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
    function parsePayload(input: string): any {
        if (!input || !input.trim()) return {};

        // 1. Try JSON parsing first
        try {
            return JSON.parse(input);
        } catch (e) {
            // 2. Fallback to Key-Value parsing
            // Split by newline or semicolon
            const lines = input.split(/[\n;]/);
            const result: Record<string, any> = {};
            let hasKV = false;

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                // Find first '=' to split key and value
                const equalIndex = trimmedLine.indexOf('=');
                if (equalIndex === -1) continue;

                const key = trimmedLine.substring(0, equalIndex).trim();
                const valueStr = trimmedLine.substring(equalIndex + 1).trim();
                
                if (!key) continue;

                hasKV = true;
                
                // Type inference
                let value: any = valueStr;
                if (valueStr === 'true') value = true;
                else if (valueStr === 'false') value = false;
                else if (valueStr === 'null') value = null;
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
    const fetch: <T = Object>(...arg: Parameters<typeof context.fetch>) => Promise<T | { code: number, error: any, [p: string]: any }> = async (url, init, authId) => {
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
            } as any;
        } catch {
            return {
                status: res.status,
                data: resText,
                raw: resText
            } as any;
        }
      } catch (e) {
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
      
      let payloadData: any;
      try {
          payloadData = parsePayload(payloadStr);
      } catch (e) {
          // Log parsing error specifically
          console.error('Payload parsing error:', e);
          debugLog({
            '===JSON Parsing Error': String(e),
            'rawPayload': payloadStr
          });
          // We could return a specific error code, but FieldCode.Error is standard
          return {
              code: FieldCode.Error
          };
      }
      
      if (!targetUrl) {
          throw new Error('Invalid URL');
      }

      debugLog({ targetUrl, payloadData });

      const res: any = await fetch(targetUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadData)
      });

      return {
        code: FieldCode.Success,
        data: typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
      }

    } catch (e) {
      console.log('====error', String(e));
      debugLog({
        '===999 Exception': String(e)
      });
      return {
        code: FieldCode.Error,
      }
    }
  },
});
export default basekit;
