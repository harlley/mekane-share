import browser from "webextension-polyfill";
import { TabError } from "../../shared/errors/screenshot.errors";

export const getActiveTab = async () => {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tabs[0]?.id) {
      throw new TabError("No active tab found");
    }

    return tabs[0];
  } catch (error) {
    throw new TabError("Failed to get active tab", error);
  }
};

export const executeInTab = async <T>(
  tabId: number,
  func: () => T
): Promise<T> => {
  try {
    const [result] = await browser.scripting.executeScript({
      target: { tabId },
      func,
    });

    if (!result || typeof result.result === "undefined") {
      throw new TabError("Script execution failed");
    }

    return result.result as T;
  } catch (error) {
    throw new TabError("Failed to execute in tab", error);
  }
};

export const getDevicePixelRatio = async (): Promise<number> => {
  try {
    const tab = await getActiveTab();
    const dpr = await executeInTab(tab.id!, () => window.devicePixelRatio);
    return typeof dpr === "number" ? dpr : 1;
  } catch {
    return 1;
  }
};
