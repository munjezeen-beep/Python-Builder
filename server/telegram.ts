import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";

let apiId: number;
let apiHash: string;

export function setTelegramCredentials(id: number, hash: string) {
  apiId = id;
  apiHash = hash;
}

export async function sendCode(phone: string) {
  if (!apiId || !apiHash) {
    throw new Error("Telegram credentials not set");
  }

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  
  const result = await client.invoke(
    new Api.auth.SendCode({
      phoneNumber: phone,
      apiId,
      apiHash,
      settings: new Api.CodeSettings({
        allowFlashcall: false,
        currentNumber: true,
        allowAppHash: true,
      }),
    })
  );

  await client.destroy();
  
  return {
    phoneCodeHash: result.phoneCodeHash,
    timeout: result.timeout,
  };
}

export async function verifyCode(
  phone: string,
  phoneCodeHash: string,
  code: string,
  password?: string
) {
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();

  try {
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash: phoneCodeHash,
        phoneCode: code,
      })
    );
  } catch (error: any) {
    if (error.errorMessage === "SESSION_PASSWORD_NEEDED") {
      if (!password) {
        throw new Error("2FA password required");
      }
      const passwordInfo = await client.invoke(new Api.account.GetPassword());
      const hashedPassword = await passwordInfo.computeCheck(password);
      await client.invoke(
        new Api.auth.CheckPassword({
          password: hashedPassword,
        })
      );
    } else if (error.errorMessage === "PHONE_CODE_INVALID") {
      throw new Error("The code you entered is incorrect");
    } else if (error.errorMessage === "PHONE_CODE_EXPIRED") {
      throw new Error("The code has expired. Please request a new one.");
    } else {
      throw new Error(`Telegram error: ${error.errorMessage || "Unknown error"}`);
    }
  }

  const isAuthorized = await client.isUserAuthorized();
  if (!isAuthorized) {
    throw new Error("Authorization failed");
  }

  const sessionString = client.session.save() as unknown as string;
  await client.destroy();

  return sessionString;
}
