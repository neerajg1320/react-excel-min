import {
  START_PING,
  STOP_PING,
  SET_STATUS,
  SET_DEBUG,
  SET_LEDGERS,
  SET_COMPANIES,
  SET_CURRENT_COMPANY,
  SET_TARGET_COMPANY,
  SET_SERVER
} from "./tallyActionTypes";

export const startPing = () => {
  return {
    type: START_PING,
  };
};

export const stopPing = () => {
  return {
    type: STOP_PING,
  };
};

export const setStatus = (value) => {
  return {
    type: SET_STATUS,
    payload: {
      value
    }
  };
};

export const setDebug = (value) => {
  return {
    type: SET_DEBUG,
    payload: {
      value
    }
  };
};

export const setLedgers = (value) => {
  return {
    type: SET_LEDGERS,
    payload: {
      value
    }
  };
};

export const setCompanies= (value) => {
  return {
    type: SET_COMPANIES,
    payload: {
      value
    }
  };
};

export const setCurrentCompany= (value) => {
  return {
    type: SET_CURRENT_COMPANY,
    payload: {
      value
    }
  };
};

export const setTargetCompany= (value) => {
  return {
    type: SET_TARGET_COMPANY,
    payload: {
      value
    }
  };
};

export const setServer= (value) => {
  return {
    type: SET_SERVER,
    payload: {
      value
    }
  };
};
