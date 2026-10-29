import { browserLocalSpeechProvider, type LocalDictationOptions, type LocalSpeechProvider } from "@quiescent/editor";

export function localDictation(
  onStatus: (message: string) => void,
  provider = browserLocalSpeechProvider(),
): LocalDictationOptions {
  const lang = "en-US";
  if (!provider) return { lang };

  const install: LocalSpeechProvider["install"] = async (options) => {
    onStatus("Downloading the on-device dictation language pack...");
    try {
      const installed = await provider.install(options);
      onStatus(installed ? "" : "The on-device language pack was not installed. Use Install dictation to retry.");
      return installed;
    } catch (error) {
      onStatus("Could not install the on-device language pack. Reload the page to retry.");
      throw error;
    }
  };
  let checking: ReturnType<LocalSpeechProvider["available"]> | undefined;
  const available: LocalSpeechProvider["available"] = (options) => {
    if (checking) return checking;
    checking = (async () => {
      let availability = await provider.available(options);
      if (availability === "downloadable" || availability === "downloading") {
        if (await install({ langs: options.langs })) {
          availability = await provider.available(options);
        }
      }
      if (availability === "unavailable") {
        onStatus(`On-device dictation is unavailable for ${lang}.`);
      } else if (availability === "downloading") {
        onStatus("The on-device language pack is still downloading. Reload the page to check again.");
      }
      return availability;
    })().catch((error: unknown) => {
      onStatus("Could not prepare on-device dictation. Reload the page to retry.");
      throw error;
    }).finally(() => { checking = undefined; });
    return checking;
  };

  return {
    lang,
    provider: { available, install, create: () => provider.create() },
  };
}
