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
        phoneCodeHash,
        phoneCode: code,
      })
    );
  } catch (error: any) {
    if (error.errorMessage === "SESSION_PASSWORD_NEEDED") {
      if (!password) {
        throw new Error("2FA password required");
      }
      await client.invoke(
        new Api.auth.CheckPassword({
          password: await client.invoke(
            new Api.account.GetPassword()
          ).then((p) => {
            const algo = (p as any).currentAlgo;
            return (p as any).computeCheck(password, algo);
          }),
        })
      );
    } else {
      throw error;
    }
  }

  const sessionString = client.session.save() as unknown as string;
  await client.destroy();

  return sessionString;
}
