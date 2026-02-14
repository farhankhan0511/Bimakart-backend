import { coinSettings } from "../Models/coinSettings.Model.js";

let coinsettingsCache = {};

export const loadcoinSettingsCache = async () => {
  const coinSetting = await coinSettings.find({});
  coinSetting.forEach(s => {
    coin[s.key] = s.value;
  });
};

export const getcoinSetting = (key) => {
  return coinsettingsCache[key];
};
