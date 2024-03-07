import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { dclsu_backend, canisterId, createActor } from '../../../declarations/dclsu_backend';
import { LoginContext } from '../App';
import './admin.scss'
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import Swal from 'sweetalert2';

const AdminProfile = () => {
  const { user, logoutIdentity } = useContext(LoginContext);
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [profile, setProfile] = useState({full_name: "", email: ""})
  const [principalTopup, setPrincipalTopup] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const buttonRef = useRef(null);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);

  const [transactionsForApproval, setTransactionsForApproval] = useState([]);

  useEffect(()=> {
    const fetchAdminSide = async () => {
      handleProfile();
      handleHistory();
      handleStudents();
      handleTransactions();
    }
    fetchAdminSide();
  }, []);

  const handleClickButton = () => {
    buttonRef.current.click(); 
  };

  async function handleProfile() {
    const principal = Principal.fromText(String(user.principalID));
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    const result = await authenticatedCanister.getAdminProfile(principal);
    setProfile(result[1]);
  }

  async function handleHistory() {
    const principal = Principal.fromText(String(user.principalID));
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
  
  async function handleStudents() {
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    const std = await authenticatedCanister.seeAllStudents();
    setStudents(std)
  }

  async function handleTransactions() {
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    const std = await authenticatedCanister.seeAllTransactions();
    console.log(std);
    setTransactionsForApproval(std)
  }

  async function handleTransfer() {
    setIsLoadingTransfer(true);
    const principal = Principal.fromText(principalTopup);
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();
    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    let result = await authenticatedCanister.addIncentive(principal, parseInt(transferAmount));
    handleMessage(result.mtype, result.msg);
    setTransferAmount("");
    await handleHistory();
    setIsLoadingTransfer(false);
    handleClickButton();
  };
  
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
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url(${"img/siever.png"})`, backgroundPosition: "center", backgroundSize: "cover"}}>
        <Link className="navbar-brand" to={"/admin-profile"}>
          <img src="img/CTEC_Logo-nav.png" height="65" alt="CTEC Logo" />
        </Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ml-auto">
                  <li className="nav-item dropdown">
                      <button className="nav-link dropdown-toggle text-end" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <strong>Hello, {profile.full_name}</strong>
                      </button>
                      <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                          <Link className="dropdown-item" to={"/admin"}>Home</Link>
                          <div className="dropdown-divider"></div>
                          <button className="dropdown-item btn-danger" onClick={logoutIdentity}>Logout</button>
                      </div>
                  </li>
              </ul>
          </div>
      </nav>
      <div className="container-fluid">
      <div className="row align-items-center justify-content-center">
        <div className="col col-md-12 col-sm-12 col-lg-6 offset-lg-1">
          <div className="card my-3">
            <div className="card-body">
                <h4>Welcome,</h4>
                <h1><strong>Administrator</strong></h1>
                <div className="mb-3">
                    <label className="small mb-1" htmlFor="principalID"><b>Principal ID</b></label>
                    <input disabled className="form-control" id="principalID" value={user.principalID} type="text" placeholder="Principal ID" required/>
                </div>
                <div className="mb-3">
                    <label className="small mb-1" htmlFor="principalID"><b>Principal ID</b></label>
                    <input disabled className="form-control" id="principalID" value={profile.full_name} type="text" placeholder="Principal ID" required/>
                </div>
                <div className="mb-3">
                    <label className="small mb-1" htmlFor="principalID"><b>Principal ID</b></label>
                    <input disabled className="form-control" id="principalID" value={profile.email} type="text" placeholder="Principal ID" required/>
                </div>
              <div className="pt-3"> <a href="" className="btn btn-danger w-100" onClick={logoutIdentity}>Log out</a></div>
            </div>
          </div>
          <div className="card">
              <div className="card-body">
                  <h4>Transaction History</h4>
                  <ul className="list-group list-group-flush pt-3">
                  {history.slice().reverse().map((item, index) => (
                    <li className="list-group-item" key={index}>
                      <div className="row d-flex justify-content-between">
                        <div className="col-8">
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
                            {item.status}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
          </div>
        </div>
      </div>
    </div>
   
    </div>
  )
}

export default AdminProfile