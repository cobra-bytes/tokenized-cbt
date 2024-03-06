import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { dclsu_backend, canisterId, createActor } from '../../../declarations/dclsu_backend';
import { LoginContext } from '../App';
import './admin.scss'
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import Swal from 'sweetalert2';
import DataTable from 'datatables.net-dt';

const Admin = () => {
  const { user, logoutIdentity } = useContext(LoginContext);
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [profile, setProfile] = useState({full_name: "", email: ""})
  const [principalTopup, setPrincipalTopup] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const buttonRef = useRef(null);
  const [isLoadingTransfer, setIsLoadingTransfer] = useState(false);

  const [transactionsForApproval, setTransactionsForApproval] = useState([]);
  const [claimedTransactions, setClaimedTransactions] = useState([]);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    const fetchAdminSide = async () => {
      await handleProfile();
      await handleHistory();
      await handleStudents();
      await handleTransactions();
      await handleClaimedTransactions();
      console.log(transactionsForApproval.length);
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
    setTransactionsForApproval(std)
  }

  async function handleClaimedTransactions() {
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    const std = await authenticatedCanister.seeAllClaimedTransaction();
    setClaimedTransactions(std);
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
  
  async function handleClaim(id, whoami) {
    const principal = Principal.fromText(whoami);
    const authClient = await AuthClient.create();
    let identity = await authClient.getIdentity();

    const authenticatedCanister = createActor(canisterId, {
      agentOptions: {
        identity
      }
    })
    const claim = await authenticatedCanister.makeClaimedTransaction(id, principal);
    handleMessage(claim.mtype, claim.msg);
    handleClaimedTransactions();
    setIsClaiming(false);
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

  const handleTable = () => {
    let table = new DataTable('#table_id', {
        responsive: true
    });
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
          <a className="navbar-brand" href="#">
              <img src="img/CTEC_Logo-nav.png" height="65" alt="CTEC Logo" />
          </a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle text-end" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <strong>Hello, Administrator</strong>
                  </a>
                  <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                  <Link className="dropdown-item" to={"/admin-profile"}>Profile</Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item btn-danger" onClick={logoutIdentity}>Logout</button>
                  </div>
              </li>
            </ul>
          </div>
      </nav>

      <div className="container-fluid">
      <div className="row align-items-center justify-content-center">
        <div className="col-sm-12 col-md-12 col-lg-8">
            <div className="card my-3">
                <div className="card-body">
                  <nav>
                    <div className="nav nav-tabs justify-content-center" id="nav-tab" role="tablist">
                      <button className="nav-link active" id="nav-student-tab" data-bs-toggle="tab" data-bs-target="#nav-student" type="button" role="tab" aria-controls="nav-home" aria-selected="true">All Students</button>
                      <button className="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Unclaimed Transactions</button>
                      <button className="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Claimed Transactions</button>
                    </div>
                  </nav>
                  <div className="tab-content" id="nav-tabContent">
                    <div className="tab-pane fade show active" id="nav-student" role="tabpanel" aria-labelledby="nav-student-tab" tabIndex="0">
                      <div className="form-floating mb-3 mt-3">
                          <input 
                            type="text" 
                            className="form-control" 
                            id="searchInput" 
                            placeholder="Search students here..." 
                          />
                          <label htmlFor="searchInput">Search students here...</label>
                      </div>
                      <div className="container p-2">
                          <table className="table">
                              <thead>
                                  <tr>
                                      <th className="text-center" scope="col">ID Number</th>
                                      <th className="text-center" scope="col">Name</th>
                                      <th className="text-center" scope="col">Topup</th>
                                  </tr>
                              </thead>
                              <tbody className="table-group-divider" id="studentTableBody">
                              {students.map((item, index) => (
                                <tr key={index}>
                                  <td className="text-center">{item.profile.student_id}</td>
                                  <td className="text-center">{item.profile.full_name}</td>
                                  <td className="col-3 text-center">
                                    <button 
                                      type="button" 
                                      className="btn btn-success fw-bold" 
                                      data-bs-toggle="modal" 
                                      data-bs-target="#exampleModal" 
                                      data-bs-whatever="@mdo"
                                      onClick={()=> setPrincipalTopup(String(item.principal))}
                                    >
                                      Topup
                                    </button>
                                  </td>
                                </tr>
                              ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
                
                  <div className="modal fade" id="exampleModal" data-controls-modal="exampleModal" data-backdrop="static" data-keyboard="false" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                      <div className="modal-content">
                        <div className="modal-header d-flex align-items-center">
                          <img src="img/star.png" width="50" alt="Coin Icon" className="mr-1" />
                          <h1 className="modal-title fs-5" id="exampleModalLabel"><strong>CBT TOPUP</strong></h1>
                          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                          <form>
                            {/* <button disabled={isDisabled} onClick={handleTransfer}>Transfer Balance</button> */}
                            <div className="mb-3">
                              <label htmlFor="recipient-name" className="col-form-label">Recipient:</label>
                              <input type="text" className="form-control" id="recipient-name" value={principalTopup} disabled />
                            </div>
                            <div className="mb-3">
                              <label htmlFor="recipient-name" className="col-form-label">Amount:</label>
                              <input type="number" className="form-control" id="recipient-name" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
                            </div>
                          </form>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" disabled={isLoadingTransfer} data-bs-dismiss="modal" ref={buttonRef} >Close</button>
                          <button type="button" className="btn btn-primary" disabled={isLoadingTransfer} onClick={handleTransfer}>{isLoadingTransfer ? "Loading..." : "Topup"}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                                
                    <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabIndex="0">
                      <div className="container mt-3 mb-3">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="text-center" scope="col">Transaction ID</th>
                              <th className="text-center" scope="col">Request</th>
                              <th className="text-center" scope="col">Date</th>
                              <th className="text-center" scope="col">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="table-group-divider">
                          {transactionsForApproval.length === 2 ? (
                            <tr>No transactions for approval.</tr>
                          ) : (
                              transactionsForApproval.map((item, index) => (
                                item.balanceHistory.history
                                    .filter(historyItem => 
                                        historyItem.status === 'Pending' &&
                                        !claimedTransactions.some(claimedItem => claimedItem[0] === String(historyItem.date_time))
                                    )
                                    .map((historyItem, historyIndex) => (
                                        <tr key={`${index}-${historyIndex}`}>
                                            <td className="text-center"><small>{String(historyItem.date_time)}</small></td>
                                            <td className="text-center">{historyItem.info}</td>
                                            <td className="text-center"><small>{convertNanoToDate(historyItem.date_time)}</small></td>
                                            <td className="d-flex gap-3 justify-content-end">
                                                <button className='btn btn-success' disabled={isClaiming} onClick={() => {
                                                  setIsClaiming(true)
                                                  handleClaim(historyItem.date_time.toString(), item.principal.toString())
                                                  }}>{isClaiming ? "Loading..." : "Mark as Claimed"}</button>
                                            </td>
                                        </tr>
                                    ))
                                ))
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab" tabIndex="0">
                      <div className="container mt-3 mb-3">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="text-center" scope="col">Request ID</th>
                              <th className="text-center" scope="col">Status</th>
                            </tr>
                          </thead>
                          <tbody className="table-group-divider">
                          {claimedTransactions.map((item, index) => (
                              <tr key={index}>
                                <td className="text-center" scope="row">{item[0]}</td>
                                <td className="text-center">
                                  <span className="badge text-bg-success">
                                    Claimed
                                  </span>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
      </div>
    </div>
   
    </div>
  )
}

export default Admin