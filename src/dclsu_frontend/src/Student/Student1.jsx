import React, { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
import { dclsu_backend, canisterId, createActor } from '../../../declarations/dclsu_backend';
import { Link } from 'react-router-dom';

function Student1() {
  const [balance, setBalance] = useState("");
  const [cryptoSymbol, setCryptoSymbol] = useState("")
  const [isHidden, setIsHidden] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [claimText, setClaimText] = useState("");
  const [feedback, setFeedback] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [whoAmI, setWhoAmI] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [history, setHistory] = useState([]);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isTransfered, setIsTransfered] = useState(false);
  const [transferStatus, setTransferStatus] = useState("");

  const marketplace = [
    { name: 'Canva Pro 1YR', cbt: 1000 },
    { name: 'Grammarly 1YR', cbt: 10000 },
    { name: 'Quilbot 1YR', cbt: 5000 },
  ];

  useEffect(() => {
    async function fetchPrincipal() {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        setIsLoggedIn(true);
        handleAuthActions();
      }
      setIsLoading(false); // Set loading to false after authentication check
    }
    fetchPrincipal();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      handleAuthActions();
    }
  }, [whoAmI]);

  async function handleAuthActions() {
    await handleWhoAmI();
    await Promise.all([handleCheckBalance(), handleHistory()]);
  }

  async function handleCheckBalance() {
    const principal = Principal.fromText(whoAmI);
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })

    const balance = await authenticatedCanister.balanceOf(principal);
    setBalance(balance.toLocaleString());
    setCryptoSymbol(await authenticatedCanister.getSymbol());
    setIsHidden(false);
  }

  async function handleHistory() {
    const principal = Principal.fromText(whoAmI);
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    const result = await authenticatedCanister.historyOf(principal);
    setHistory(result);
  }

  async function handleClaimFreeDCLSU() {
    setIsDisabled(true);
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    const result = await authenticatedCanister.payOut();
    setClaimText(result);
    setIsDisabled(false);
    handleAuthActions();
  }

  async function handleWithdrawBalance(itemToWithdraw, amountToWithdraw) {
    setIsDisabled(true);

    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    const result = await authenticatedCanister.withdraw(itemToWithdraw, parseInt(amountToWithdraw));
    setFeedback(result);
    setIsDisabled(false);
    handleAuthActions();
  }

  async function handleWhoAmI() {
    const authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      let identity = await authClient.getIdentity();

      const authenticatedCanister = createActor(canisterId, {
        agentOptions: {
          identity
        }
      })
      const whoiam = await authenticatedCanister.whoAmI();
      setWhoAmI(String(whoiam));
    }
  }

  async function handleLogin() {
    const authClient = await AuthClient.create();
    if (!await authClient.isAuthenticated()) {
      await authClient.login({
        identityProvider: "http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943/#authorize",
        onSuccess: () => {
          setWhoAmI("");
          setBalance("");
          setIsLoggedIn(true);
          handleAuthActions();
        }
      })
    }
  }

  function convertNanoToDate(nano) {
    let nanoseconds = parseInt(nano);
    let milliseconds = nanoseconds / 1000000;
    let date = new Date(milliseconds);
    let formattedDate = date.toLocaleString();

    return formattedDate
  }

  async function handleLogout() {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setWhoAmI("");
    setHistory([]);
    setIsLoggedIn(false);
  }

  async function handleTransfer() {
    setIsDisabled(true);
    const principal = Principal.fromText(transferTo);
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();
    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    let result = await authenticatedCanister.addIncentive(principal, parseInt(transferAmount));
    await handleAuthActions();
    setTransferStatus(result)
    setTransferTo("");
    setTransferAmount("");
    setIsDisabled(false);
  };
  return (
    <main>  
      <Link to="/admin">Go to Admin</Link>
      <p>Claim Free 10,000 CBT (Cobrabytes Token)</p>
      {isLoggedIn ? (
        <div>
          <button disabled={isDisabled} onClick={handleClaimFreeDCLSU}>Claim Now</button>
          <p>{claimText}</p>
          <p>
            <b>Principal ID:</b> {whoAmI ? whoAmI : "loading..."}
            <button onClick={handleLogout}>Logout</button>
          </p>
          <p>
            <b>Balance:</b> {balance ? balance : "0"} CBT
          </p>
          <br />

          <h3>History</h3>
          <ul>
            {history.length > 0 ? (
              history.map((item, index) => (
                <li key={index}>
                  {convertNanoToDate(item.date_time)} {item.info} <b>{item.sign}{item.amount.toLocaleString()} CBT</b>
                </li>
              ))
            ) : (
              <li>No History Yet</li>
            )}
          </ul>
          <h3>Redeem Your Rewards</h3>
          <p>{feedback}</p>
          <ul>
            {marketplace.map((item, index) => (
              <li key={index}>
                {item.name} {item.cbt.toLocaleString()} CBT
                <button disabled={isDisabled} onClick={() => handleWithdrawBalance(item.name, item.cbt)}>Redeem</button>
              </li>
            ))}
          </ul>
          <br />
          <h3>For ADMIN</h3>
          <p>{transferStatus}</p>
          <input name='transfer_to' placeholder='Principal ID' value={transferTo} onChange={(e) => setTransferTo(e.target.value)}/>
          <input name='amount' placeholder='Amount' value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)}/>
          <button disabled={isDisabled} onClick={handleTransfer}>Transfer Balance</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </main>
  );
}

export default Student1;
