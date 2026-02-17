import { coinSettings } from "../Models/coinSettings.Model.js";
import logger from "../Utils/logger.js";

let coinsettingsCache = {};

export const loadcoinSettingsCache = async () => {
  const coinSetting = await coinSettings.find({});
  coinSetting.forEach(s => {
    coinsettingsCache[s.key] = s.value;
  });
  logger.info("Coin settings cache loaded");
};

export const getcoinSetting = (key) => {
  return coinsettingsCache[key];
};
