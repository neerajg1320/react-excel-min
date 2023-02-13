import {debug} from "../components/config/debug";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import Select from "react-select";
import {remoteCall, remoteMonitorStart, remoteMonitorStop} from "../communication/electron";
import {setServer, setStatus, setLedgers} from "./state/tallyActions";
import TallySubmitBar from "./TallySubmitBar/TallySubmitBar";
import Connection from "./ConnectionStatus/Connection";
import {setCompanies, setCurrentCompany, setTargetCompany} from "./state/tallyActions";
import AppContext from "../AppContext";
import {listToOptions} from "../utils/options";

export const TallyMain = ({children}) => {
  if (debug.lifecycle) {
    console.log(`Rendering <TallyMain>`);
  }

  const debugTally = false;
  const debugResponse = false;
  const debugData = false;

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<TallyMain>: First render`);
    }

    remoteCall('tally:server:get', {})
        .then((config) => {
          if (debugTally) {
            console.log(`config=${JSON.stringify(config)}`);
          }
          dispatch(setServer(config));
        });

    return () => {
      if (debug.lifecycle) {
        console.log(`<TallyMain>: Destroyed`);
      }
    }
  }, []);

  const {
    data,
    onDataChange: updateData,
    onLedgersChange: updateLedgers,
    tallySaved,
    modifiedRows,
    deletedRows
  } = useContext(AppContext);

  const boxShadow = "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px";
  const dispatch = useDispatch();
  const serverAddr = useSelector((state) => state.tally.serverAddr);
  const tallyStatus = useSelector((state) => state.tally.status);
  const tallyCompanies = useSelector((state) => state.tally.companies);
  const tallyCurrentCompany = useSelector((state) => state.tally.currentCompany);
  const tallyTargetCompany = useSelector((state) => state.tally.targetCompany);
  const tallyLedgers = useSelector((state) => state.tally.ledgers);

  const [banksLedgers, setBankLedgers] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  const bankOptions = useMemo(() => {
    return banksLedgers.map((ledger) => {return {label: ledger.name, value: ledger.name}});
  }, [banksLedgers])

  const [currentBank, setCurrentBank] = useState('');

  const channelServerHealth = 'tally:server:status:health';

  const setServerSuccess = useCallback(() => {
    const channelStatus = 'tally:server:status';
    remoteCall(channelStatus)
        .then(status => {
          if (debugTally) {
            console.log(`${channelStatus}=${status}`);
          }
          dispatch(setStatus(status));
        })
        .catch(error => {
          console.log(`TallyServerStatus:useEffect[] error=${error}`);
        });


    remoteMonitorStart(channelServerHealth, (event, status) => {
      dispatch(setStatus(status));
    });
  }, []);


  // dep: serverAddr
  useEffect(() => {
    if (debugTally) {
      console.log(`TallyMain: useEffect[${JSON.stringify(serverAddr)}]`)
    }

    if (serverAddr.host !== "") {
      const serverInit = 'tally:server:set';
      remoteCall(serverInit, {serverAddr})
          .then(response => {
            // console.log(`serverInit: response=${response}`);
            setServerSuccess();
          })
          .catch(error => {
            console.error(`serverInit: error=${error}`);
          })
    }

    return () => {
      remoteMonitorStop(channelServerHealth, (event, response) => {
        console.log("Health Listener closed");
      });
    }
  }, [serverAddr]);

  // dep: tallyStatus
  useEffect(() => {
    if (tallyStatus) {
      console.log('The Tally Server is ON');
      remoteCall('tally:command:companies:list', {})
          .then(({request, response}) => {
            if (debugTally) {
              console.log(`useEffect[tallyStatus] companies=${JSON.stringify(response, null, 2)}`);
            }
            dispatch(setCompanies(response));
          });

    }
  }, [tallyStatus])

  // dep: tallyCompanies
  useEffect(() => {
    if (tallyCompanies.length) {
      setCompanyOptions(listToOptions(tallyCompanies.map(company => company.name), "Company"));

      remoteCall('tally:command:companies:current', {})
          .then(({request, response}) => {
            console.log(`currentCompany: ${JSON.stringify(response.value, null, 2)}`);
            // setCurrentCompany(response);
            dispatch(setCurrentCompany(response.value));
          })
    }
  }, [tallyCompanies])

  // dep: tallyCurrentCompany
  useEffect(() => {
    dispatch(setTargetCompany(tallyCurrentCompany))
  }, [tallyCurrentCompany]);

  const handleTargetCompanyChange = (e) => {
    dispatch(setTargetCompany(e));
  }

  // dep: tallyTargetCompany
  useEffect(() => {
    // console.log(`Need to get the ledgers`);
    if (tallyTargetCompany !== '') {
      remoteCall('tally:command:ledgers:list', {targetCompany:tallyTargetCompany})
          .then(({request, response}) => {
            // console.log('ledgers:', JSON.stringify(response));
            dispatch(setLedgers(response));
            // console.log(`Updated ledgers request=${request}`);
          })
          .catch(error => {
            console.log(`useEffect[tallyStatus]: error=${error}`);
          });
    }
  }, [tallyTargetCompany]);

  useEffect(() => {
    if (updateLedgers) {
      updateLedgers(tallyLedgers);
    }
    setBankLedgers(tallyLedgers.filter(ledger => ledger.parent === "Bank Accounts"));
  }, [tallyLedgers]);

  const deleteVouchers = useCallback((data, vouchers, targetCompany) => {
      remoteCall('tally:command:vouchers:delete', {targetCompany, vouchers})
          .then((response) => {
            // console.log(response);
            const deletedIds = response.map(item => item.id);
            const newData = data.filter(item => !deletedIds.includes(item.id));
            if (updateData) {
              const update = {action: "SET", payload:response};
              updateData(newData, [update], "dataSourceTally");
            }
          })
          .catch((error) => {
            alert("Error deleting vouchers. Make sure master Id is correct")
          });
  }, []);

  const modifyVouchers = useCallback((data, vouchers, bankLedger, targetCompany) => {
    remoteCall('tally:command:vouchers:modify', {vouchers, bank:bankLedger, targetCompany})
        .then((response) => {
          if (debugResponse) {
            console.log(`modifyVouchers:success`, response);
          }

          const modifiedIds = response.map(res => [res.id, res.status]);
          const modifiedIdsMap = Object.fromEntries(modifiedIds);

          // dispatch(editRows(ids, values));
          // TBD: We need to have a dirty flag which which should be reset when saved.
          const newData = data.map(item => {
            const status = modifiedIdsMap[item.id];
            if (status) {
              // console.log(`${item.id} status=${status}`);
              if (status === "SUCCESS") {
                item.modifyMarker = false;
              }
            }
            return item;
          });
          if (updateData) {
            const update = {action: "SET", payload:response};
            updateData(newData, [update], "dataSourceTally");
          }
        })
        .catch((error) => {
          alert(error.reason || error);
        });
  }, []);

  const addVouchers = useCallback((vouchers, bankLedger, targetCompany) => {
    remoteCall('tally:command:vouchers:add', {vouchers, bank:bankLedger, targetCompany})
        .then((response) => {
          if (debugResponse) {
            console.log(`handleResponse: response=${JSON.stringify(response, null, 2)}`);
          }
          const responseIds = response.map(res => [res.id, res.voucherId]);

          const responseIdMap = Object.fromEntries(responseIds);
          const dataWithServerIds = vouchers.map((item) => {
            return {
              ...item,
              voucherId: responseIdMap[item.id],
              modifyMarker: false,
            }
          });

          if (debugData) {
            console.log(`TallyMain: dataWithVoucherIds: ${JSON.stringify(dataWithServerIds, null, 2)}`)
          }

          if (updateData) {
            const update = {action: 'SET', payload: responseIds}
            updateData(dataWithServerIds, [update], "dataSourceTally");
          }
        })
        .catch(error => {
          alert(error.reason || error);
        });
  }, [])

  const handleSync = useCallback((data, bankLedger, targetCompany, modifiedRows, deletedRows) => {
    if (modifiedRows.length > 0) {
      const vouchers = data.filter((item, index) => modifiedRows.includes(index));
      modifyVouchers(data, vouchers, bankLedger, targetCompany);
    }

    if (deletedRows.length > 0) {
      const vouchers = data.filter((item, index) => deletedRows.includes(index));
      deleteVouchers(data, vouchers, targetCompany);
    }
  }, []);

  const handleSubmit = useCallback((data, bankLedger, targetCompany, modifiedRows) => {
    const dataWithIds = data.map((item, index) => {return {...item, id: index}});
    const update = {action: 'SET', payload: {}}
    if (updateData) {
      updateData(dataWithIds, [update], "dataSourceTally")
    }

    // We might have deleted the rows before submitting to server
    // We need to see if we need addedRows as well
    const vouchers = dataWithIds.filter((item, index) => modifiedRows.includes(index));
    addVouchers(vouchers, bankLedger, targetCompany);
  }, [updateData]);

  return (
    <div
        style={{
          display:"flex", flexDirection:"column", alignItems:"center", gap: "10px", justifyContent:"flex-start",
          // border: "2px dashed red"
        }}
    >
      <div style={{
        marginTop: "40px",
        marginBottom: "10px",
        width: "90%",
        borderRadius: "4px",
        minHeight: "60vh",
        // border: "1px dashed blue",
        boxShadow
      }}
      >
        {children}
      </div>

      <div style={{
        height: "70px", width:"100%",
        position: "fixed", bottom: "0",
        boxShadow: "0 0 3px rgba(0,0,0,0.2)",
        display: "flex", flexDirection:"row", justifyContent:"space-between",
        background:"white"
      }}
      >
        <div style={{width:"30%"}}>
          <Connection title={"Tally Server"} status={tallyStatus} />
        </div>

        <div style={{
            minWidth:"200px",
            display: "flex", flexDirection:"column", alignItems: "flex-end"
          }}
        >
          <label>
            Company
          </label>
          <div style={{width:"100%"}}>
            <Select
                menuPlacement="top"
                options={companyOptions}
                value={companyOptions.filter(opt => opt.value === tallyTargetCompany)}
                onChange={opt => handleTargetCompanyChange(opt.value)}
            />
          </div>
        </div>
        <div style={{
            minWidth:"200px",
            display: "flex", flexDirection:"column", alignItems: "flex-end"
          }}
        >
          <label>
            Bank
          </label>
          <div style={{width:"100%"}}>
          <Select
              menuPlacement="top"
              options={bankOptions}
              value={bankOptions.filter(opt => opt.value === currentBank)}
              onChange={opt => setCurrentBank(opt.value)}
          />
          </div>
        </div>

        <div style={{width:"30%"}}>
          <TallySubmitBar
              title={tallySaved ? "Sync To Tally" : "Submit To Tally"}
              disabled={modifiedRows.length < 1 && deletedRows.length < 1}
              onSubmit={e => {
                tallySaved ?
                handleSync(data, currentBank, tallyTargetCompany, modifiedRows, deletedRows) :
                handleSubmit(data, currentBank, tallyTargetCompany, modifiedRows)
              }}
          />
        </div>
      </div>
    </div>
  );
};
