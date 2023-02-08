import { useState } from "react";

import logo from "./logo.svg";
import "./App.css";

import {
  CosmosDidStore,
  SaoKeplrAccountProvider,
  SidManager,
} from "@sao-js-sdk/sid";
import { ModelManager } from "@sao-js-sdk/model";

function App() {
  const [dataId, setDataId] = useState("");
  const [modelManager, setModelManager] = useState(null);
  const [profile, setProfile] = useState({
    name: undefined,
    age: undefined,
    city: undefined,
  });

  const chainId = "sao";

  const GetModelManager = async (ownerDid, sidManager) => {
    const chainId = "sao";
    await window.keplr.enable(chainId);
    const offlineSigner = await window.getOfflineSigner(chainId);

    const manager = new ModelManager(
      {
        ownerDid,
        chainApiUrl: "http://127.0.0.1:1317",
        chainApiToken: "TOKEN",
        chainRpcUrl: "http://127.0.0.1:26657",
        chainPrefix: "cosmos",
        signer: offlineSigner,
        nodeApiUrl: "http://127.0.0.1/rpc/v0",
        nodeApiToken: "TOKEN",
        platformId: "30293f0f-3e0f-4b3c-aff1-890a2fdf063b",
      },
      sidManager
    );
    await manager.init();

    try {
      await manager.loadModel("0");
    } catch {
      // return null
    }

    return manager;
  };

  const GetSidManager = async () => {
    if (window.keplr) {
      await suggestSaoNetworkChain();
      await window.keplr.enable(chainId);
      const offlineSigner = await window.getOfflineSigner(chainId);

      const didStore = new CosmosDidStore(
        offlineSigner,
        "http://127.0.0.1:1317",
        "http://127.0.0.1:26657"
      );
      const accountProvider = await SaoKeplrAccountProvider.new(window.keplr);
      const manager = await SidManager.createManager(accountProvider, didStore);

      return manager;
    } else {
      throw new Error("Keplr wallet not found.");
    }
  };

  const suggestSaoNetworkChain = async () => {
    await window.keplr.experimentalSuggestChain({
      chainId: "sao",
      chainName: "Sao-Network",
      rpc: "http://127.0.0.1:26657",
      rest: "http://127.0.0.1:1317",
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: "cosmos",
        bech32PrefixAccPub: "cosmospub",
        bech32PrefixValAddr: "cosmosvaloper",
        bech32PrefixValPub: "cosmosvaloperpub",
        bech32PrefixConsAddr: "cosmosvalcons",
        bech32PrefixConsPub: "cosmosvalconspub",
      },
      stakeCurrency: {
        coinDenom: "stake",
        coinMinimalDenom: "stake",
        coinDecimals: 1,
      },
      currencies: [
        {
          coinDenom: "stake",
          coinMinimalDenom: "stake",
          coinDecimals: 1,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "stake",
          coinMinimalDenom: "stake",
          coinDecimals: 6,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        },
      ],
    });
  };

  const handleConnect = async () => {
    console.log("Clicked...");
    const sm = await GetSidManager();
    const provider = await sm.getSidProvider();
    const modelManager = await GetModelManager(provider.sid, sm);
    setModelManager(modelManager);
  };

  const handleChangeName = async (e) => {
    profile.name = e.target.value;
    setProfile(profile);
  };

  const handleChangeAge = async (e) => {
    profile.age = e.target.value;
    setProfile(profile);
  };

  const handleChangeCity = async (e) => {
    profile.city = e.target.value;
    setProfile(profile);
  };

  const handleSave = async () => {
    if (dataId === "") {
      const id = await modelManager.createModel({
        alias: "profile",
        data: profile,
      });
      setDataId(id);
      console.log("created data model profile with dataId", id);
    } else {
      const data = await modelManager.loadModel(dataId);
      if (data === null) {
        alert("invalid dataId:", dataId);
      } else {
        await modelManager.updateModel({
          alias: "profile",
          data: profile,
        });
        console.log("updated data model profile with dataId", dataId);
      }
    }
  };

  const handleLoad = async () => {
    const data = await modelManager.loadModel("profile");
    if (data !== null) {
      console.log("loaded data model:", data);
    }
  };

  const handleDelete = async () => {
    if (dataId !== "") {
      const data = await modelManager.loadModel(dataId);
      if (data === null) {
        alert("invalid dataId:", dataId);
      } else {
        await modelManager.deleteModel(dataId);
        console.log("deleted data model profile with dataId", dataId);
      }
    } else {
      alert("profile data model not found");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={(e) => handleConnect(e)}>Connect Wallet</button>
        Name:
        <input
          type="text"
          onChange={(e) => handleChangeName(e)}
          value={profile.name}
        />
        Age:
        <input
          type="number"
          onChange={(e) => handleChangeAge(e)}
          value={profile.age}
        />
        City:
        <input
          type="text"
          onChange={(e) => handleChangeCity(e)}
          value={profile.city}
        />
        <button onClick={() => handleSave()}>Save Data</button>
        <button onClick={() => handleLoad()}>Load Data</button>
        <button onClick={() => handleDelete()}>Delete Data</button>
      </header>
    </div>
  );
}

export default App;
