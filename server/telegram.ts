import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram/tl";

let apiId: number;
let apiHash: string;

// مخزن مؤقت للـ phoneCodeHash
const pendingCodes = new Map<number, { phoneCodeHash: string, phone: string }>();

export function setTelegramCredentials(id: number, hash: string) {
  apiId = id;
  apiHash = hash;
}

export async function sendCode(phone: string, accountId: number) {
  if (!apiId || !apiHash) {
    throw new Error("Telegram credentials not set");
  }

  // إنشاء عميل جديد
  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
    // إعدادات إضافية لـ Railway
    baseHash: apiHash,
    floodSleepThreshold: 60,
    deviceModel: "Railway Server",
    systemVersion: "Linux",
    appVersion: "1.0.0",
    langCode: "en",
    systemLangCode: "en",
  });

  await client.connect();

  try {
    // إرسال طلب الكود
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

    // حفظ الـ phoneCodeHash في الذاكرة
    pendingCodes.set(accountId, {
      phoneCodeHash: result.phoneCodeHash,
      phone: phone
    });

    await client.destroy();
    return { success: true };
    
  } catch (error: any) {
    await client.destroy();
    console.error("Send code error:", error);
    throw new Error(error.errorMessage || "Failed to send code");
  }
}

export async function verifyCode(
  accountId: number,
  code: string,
  password?: string
) {
  // استرجاع الـ phoneCodeHash من الذاكرة
  const pending = pendingCodes.get(accountId);
  if (!pending) {
    throw new Error("No pending verification. Please request code first.");
  }

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
    baseHash: apiHash,
    deviceModel: "Railway Server",
    systemVersion: "Linux",
    appVersion: "1.0.0",
  });

  await client.connect();

  try {
    // محاولة تسجيل الدخول بالكود
    await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: pending.phone,
        phoneCodeHash: pending.phoneCodeHash,
        phoneCode: code,
      })
    );

    // التحقق من نجاح تسجيل الدخول
    const me = await client.getMe();
    if (!me) {
      throw new Error("Login failed");
    }

    // حفظ الجلسة
    const sessionString = client.session.save() as string;
    await client.destroy();
    
    // حذف البيانات المؤقتة بعد النجاح
    pendingCodes.delete(accountId);
    
    return sessionString;

  } catch (error: any) {
    await client.destroy();
    
    // معالجة الأخطاء بدقة
    if (error.errorMessage === "SESSION_PASSWORD_NEEDED") {
      if (!password) {
        throw new Error("2FA_PASSWORD_REQUIRED");
      }
      
      // محاولة تسجيل الدخول بكلمة المرور
      const passwordClient = new TelegramClient(new StringSession(""), apiId, apiHash, {
        connectionRetries: 5,
      });
      
      await passwordClient.connect();
      
      try {
        const passwordInfo = await passwordClient.invoke(new Api.account.GetPassword());
        const hashedPassword = await passwordInfo.computeCheck(password);
        
        await passwordClient.invoke(
          new Api.auth.CheckPassword({
            password: hashedPassword,
          })
        );
        
        const me = await passwordClient.getMe();
        if (!me) {
          throw new Error("Login failed");
        }
        
        const sessionString = passwordClient.session.save() as string;
        await passwordClient.destroy();
        
        pendingCodes.delete(accountId);
        return sessionString;
        
      } catch (pwdError: any) {
        await passwordClient.destroy();
        throw new Error(pwdError.errorMessage || "Invalid 2FA password");
      }
    }
    
    if (error.errorMessage === "PHONE_CODE_INVALID") {
      throw new Error("INVALID_CODE");
    }
    
    if (error.errorMessage === "PHONE_CODE_EXPIRED") {
      throw new Error("CODE_EXPIRED");
    }
    
    throw new Error(error.errorMessage || "Verification failed");
  }
}

// دالة لمسح البيانات المؤقتة (اختياري)
export function clearPendingCode(accountId: number) {
  pendingCodes.delete(accountId);
}
