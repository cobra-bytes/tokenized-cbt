import React, { useContext, useEffect, useState } from 'react'
import './student.scss'
import '../index.scss'
import { LoginContext } from '../App'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faL, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { Link, useNavigate } from 'react-router-dom'
import { AuthClient } from '@dfinity/auth-client';
import { canisterId, createActor } from '../../../declarations/dclsu_backend';
import { Principal } from '@dfinity/principal';
import Swal from 'sweetalert2'

const Profile = () => {
    const { user, logoutIdentity } = useContext(LoginContext);
    const [userProfile, setUserProfile] = useState({});
    const [originalProfile, setOriginalProfile] = useState({});
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [program, setProgram] = useState("")
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(()=> {
        getProfile();
    }, []);
    
    const isUserProfileEmpty = Object.values(userProfile).some(value => !value);

    const addProfile = async () => {
        setIsLoading(true)
        const principal = Principal.fromText(String(user.principalID));
        const authClient = await AuthClient.create();
        let identity = await authClient.getIdentity();
    
        const authenticatedCanister = createActor(canisterId, {
          agentOptions: {
            identity
          }
        })
        const result = await authenticatedCanister.addProfile(principal, 
            {
                email: userProfile.email, 
                full_name: userProfile.full_name, 
                program: userProfile.program, 
                student_id: userProfile.student_id
            }
        )
        handleMessage(result.mtype, result.msg);
        await getProfile();
        await handleClaimFreeDCLSU();
        setIsLoading(false);
        setIsUpdating(false);
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
        setOriginalProfile(result[1]);
    }
    async function handleClaimFreeDCLSU() {
        const authClient = await AuthClient.create();
        let identity = await authClient.getIdentity();
    
        const authenticatedCanister = createActor(canisterId, {
          agentOptions: {
            identity
          }
        })
        const result = await authenticatedCanister.payOut();
        handleMessage(result.mtype, result.msg);
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
                        <Link className="dropdown-item" to={"/student"}>Student</Link>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item btn-danger" onClick={logoutIdentity}>Logout</button>
                    </div>
                </li>
            </ul>
        </div>
    </nav>
    <div className="container-fluid">
        <div className="row align-items-center justify-content-center">
            <div className="mt-5 col col-md-12 col-sm-12 col-lg-6 offset-lg-1">
                <div className="card mb-4">
                    <div className="card-header">{isUpdating ? "Update Profile" : "Profile"}</div>
                    <div className="card-body">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="mb-3">
                                <label className="small mb-1" htmlFor="principalID">Principal ID</label>
                                <input disabled className="form-control" id="principalID" type="text" value={user.principalID} placeholder="Principal ID" required/>
                            </div>
                            <div className="mb-3">
                                <label className="small mb-1" htmlFor="studentID">Student ID</label>
                                <input disabled={!isUpdating} className="form-control" 
                                    id="studentID" type="text" 
                                    value={userProfile.student_id} 
                                    placeholder="Student ID" 
                                    onChange={(e)=> setUserProfile((pval)=> {
                                        return {
                                            ...pval,
                                            student_id: e.target.value
                                        }
                                    })}
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="small mb-1" htmlFor="fullName">Full Name</label>
                                <input disabled={!isUpdating} className="form-control" 
                                    id="fullName" type="text" 
                                    value={userProfile.full_name} 
                                    placeholder="Full Name"
                                    onChange={(e)=> setUserProfile((pval)=> {
                                        return {
                                            ...pval,
                                            full_name: e.target.value
                                        }
                                    })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="small mb-1" htmlFor="email">Email</label>
                                <input disabled={!isUpdating} className="form-control" 
                                    id="email" type="email" 
                                    value={userProfile.email} 
                                    placeholder="Email"
                                    onChange={(e)=> setUserProfile((pval)=> {
                                        return {
                                            ...pval,
                                            email: e.target.value
                                        }
                                    })}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="small mb-1" htmlFor="program">PROGRAM (e.g. BSIT)</label>
                                <input disabled={!isUpdating} className="form-control" 
                                    id="program" type="text" 
                                    value={userProfile.program} 
                                    placeholder="Program"
                                    onChange={(e)=> setUserProfile((pval)=> {
                                        return {
                                            ...pval,
                                            program: e.target.value
                                        }
                                    })}
                                    required
                                />
                            </div>
                            {/* <button className="btn btn-primary" type="submit">Save</button> */}
                            {isUpdating ? (
                                <>
                                    <button disabled={isLoading || isUserProfileEmpty} type='submit'  className="mb-2 btn btn-primary w-100" onClick={addProfile}>
                                        {isLoading ? "Loading..." : "Save Profile"}
                                    </button> 
                                    <button className="btn btn-danger w-100" onClick={()=>{
                                        setIsUpdating(false)
                                        setUserProfile(originalProfile);
                                    }}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <button className="mb-2 btn btn-warning w-100" onClick={()=>setIsUpdating(true)}>Update Profile</button> 
                                    <button className="btn btn-danger w-100" onClick={logoutIdentity}>Log out</button>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default Profile