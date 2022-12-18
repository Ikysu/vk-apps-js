import qs from 'querystring';
import crypto from 'crypto';
import fs from 'fs';

const settings = JSON.parse(fs.readFileSync("settings.json", "utf-8"));

export function checkVkToken(URL_PARAMS) {
    URL_PARAMS=URL_PARAMS.split("?").slice(1).join("?").split("#")[0]
    const signKeys = Object.fromEntries(new URLSearchParams(URL_PARAMS));
    const ordered = {};
    Object.keys(signKeys).forEach((key) => {
      let value = signKeys[key]
      if (key.startsWith('vk_')) {
        ordered[key] = value;
      }
    });
    const params = qs.stringify(ordered);
    const hash = crypto
      .createHmac('sha256', settings.service_token)
      .update(params)
      .digest()
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=$/, '');
    if (hash == signKeys.sign) {
        return {statusCode: 200, data:signKeys}
    } else {
        return {statusCode: 400, error:"Не удалось проверить клиент :("}
    }
}