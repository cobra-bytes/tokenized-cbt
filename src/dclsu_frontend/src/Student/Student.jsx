import React, { useContext, useDebugValue, useEffect, useState } from 'react'
import './student.scss'
import { Link, useNavigate } from 'react-router-dom';
import { LoginContext } from '../App';
import Swal from 'sweetalert2';
import { AuthClient } from '@dfinity/auth-client';
import { canisterId, createActor } from '../../../declarations/dclsu_backend';
import { Principal } from '@dfinity/principal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { readUIntLE } from '@dfinity/candid';

const Student = () => {
    const { user, logoutIdentity } = useContext(LoginContext);
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [userProfile, setUserProfile] = useState({});

    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([]);

    const marketplace = [
      { name: 'Canva Pro 1YR', src: "img/canva.png", cbt: 1000 },
      { name: 'Grammarly 1YR', src: "img/Grammarly.png", cbt: 10000 },
      { name: 'Quilbot 1YR', src: "img/quillbot.png", cbt: 5000 },
    ];

    useEffect(()=> {
      handleCheckBalance();
      getProfile();
    }, []);

    async function handleClaimFreeDCLSU() {
      setIsLoading(true);
      const authClient = await AuthClient.create();
      let identity = await authClient.getIdentity();
  
      const authenticatedCanister = createActor(canisterId, {
        agentOptions: {
          identity
        }
      })
      const result = await authenticatedCanister.payOut();
      handleMessage(result.mtype, result.msg);
      await handleCheckBalance();
      setIsLoading(false);
    }
    async function getProfile() {
      const principal = Principal.fromText(String(user.principalID));
      const authClient = await AuthClient.create();
      let identity = await authClient.getIdentity();
  
      const authenticatedCanister = createActor(canisterId, {
        agentOptions: {
          identity
        }
      })
      const result = await authenticatedCanister.getProfile(principal);
      setUserProfile(result[1]);
  }
    async function handleCheckBalance() {
      setIsLoading(true);
      const principal = Principal.fromText(user.principalID);
      const authClient = await AuthClient.create();
      let identity = await authClient.getIdentity();
  
      const authenticatedCanister = createActor(canisterId, {
        agentOptions: {
          identity
        }
      })
  
      const balance = await authenticatedCanister.balanceOf(principal);
      setBalance(balance.toLocaleString());
      await handleHistory();
      setIsLoading(false);
    }

    async function handleWithdrawBalance(itemToWithdraw, amountToWithdraw) {
      setIsLoading(true)
      const authClient = await AuthClient.create();
      let identity = await authClient.getIdentity();
  
      const authenticatedCanister = createActor(canisterId, {
        agentOptions: {
          identity
        }
      })
      const result = await authenticatedCanister.withdraw(itemToWithdraw, parseInt(amountToWithdraw));
      handleMessage(result.mtype, result.msg);
      await handleCheckBalance();
      setIsLoading(false);
    }

    async function handleHistory() {
      const principal = Principal.fromText(user.principalID);
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

    const handleMessage = (type, message)=> {
      var Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      Toast.fire({
          icon: type,
          title: message,
      })
    }

    function convertNanoToDate(nano) {
      let nanoseconds = parseInt(nano);
      let milliseconds = nanoseconds / 1000000;
      let date = new Date(milliseconds);
      let formattedDate = date.toLocaleString();
  
      return formattedDate
    }
  
    return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url(${"img/siever.png"})`, backgroundPosition: "center", backgroundSize: "cover"}}>
      <Link className="navbar-brand" to={"/student"}>
            <img src="img/CTEC_Logo-nav.png" height="65" alt="CTEC Logo" />
        </Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
                <li className="nav-item dropdown">
                    <button className="nav-link dropdown-toggle text-end" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <strong>Hello, {userProfile.full_name}</strong>
                    </button>
                    <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                        <Link className="dropdown-item" to={"/profile"}>Profile</Link>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item btn-danger" onClick={logoutIdentity}>Logout</button>
                    </div>
                </li>
            </ul>
        </div>
    </nav>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-6 offset-lg-1 col-sm-12">
          <div className="card mt-3 mb-5">
            <div className="card-body">
              <h5 className="text-muted">Hello,</h5>
              {userProfile.full_name ? (
                <>
                <h4>
                  {userProfile.full_name}
                </h4>
                <h6> 
                {userProfile.student_id} | {userProfile.program}
                </h6>
                </>
              ) : (
                <>
                  <h4>{userProfile.full_name || ("CLSU Student, please ")}<Link to={"/profile"}> update your profile</Link></h4>
                </>
              )}
            </div>
            <div className="card-footer d-flex justify-content-end">
                <p className='mb-0 mt-2'>Update your profile to Claim Free 10,000 <b>CBT</b> (<b>Cobrabytes Token</b>)</p>
            </div>
          </div>

          <div className="px-2 my-3">
            <div className="d-sm-flex align-items-center justify-content-between mb-3">
              <h3 className="h3 mb-3">Exchange your Token</h3>
              {/* <a href="marketplace.html" className="">View all</a> */}
            </div>
            <div className="row row-cols-xl-3 row-cols-lg-3 row-cols-sm-2">
              {marketplace.map((item, index) => (
                    <div className="col mb-2" key={index}>
                    <div className="card">
                      <div className="card-body text-center">
                        <img src={item.src} className="card-img-top market-item img-fluid" alt="Grammarly" />
                        <h6 className="bold pt-3">{item.name}</h6>
                        <p>{item.cbt.toLocaleString()} CBT</p>
                      </div>
                      <div style={{cursor: "pointer"}} className="card-footer text-center" onClick={() => handleWithdrawBalance(item.name, item.cbt)}>
                        Redeem
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-sm-12">
          <div className="card my-3">
            <div className="card-body">
              <img src="img/balance-card.png" className="card-img" alt="" />
              <div className="card-img-overlay">
                  <h5 className="text-muted px-5 pt-5">Available Balance:</h5>
                  <h2 className="px-5">{isLoading ? "Loading..." : (balance + " CBT")}</h2>
              </div>
                <div className="mt-3">
                  <h4>Wallet History</h4>
                  <small className="text-muted">Redeem Transactions can be claimed to Office of Admission</small>
                  <ul className="list-group list-group-flush pt-3 scrollspy-example" data-bs-offset="0" >
                    {history.slice().reverse().map((item, index) => (
                      <li className="list-group-item">
                        <div className="row d-flex justify-content-between">
                          <div className="col-8">
                          <b>Transaction ID</b> {String(item.date_time)}
                            <div><small className="text-muted"><b className='text-success fs-6'>{item.info}</b></small></div>
                            <div>{convertNanoToDate(item.date_time)}</div>
                          </div>
                          <div className="col">
                            <div className="d-flex justify-content-end">
                            <span className={`fs-6 badge ${item.sign === "+" ? "text-bg-success" : "text-bg-danger"}`}>
                                {item.sign}{item.amount.toLocaleString()} CBT
                            </span>
                            </div>
                            <div className="d-flex justify-content-end">
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
            </div>
            {/* <div className="card-footer">
              <a href="history.html" className="d-flex justify-content-center">See all</a>
            </div>  */}
          </div>
        </div>
      <div>
      </div>
      </div>
    </div>
    </>
  )
}

export default Student