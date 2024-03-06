import React, { useContext, useEffect } from 'react'
import './index.scss';
import { LoginContext } from './App';

const Login = () => {
  const {user, loginIdentity, logoutIdentity, isLoadingUser}= useContext(LoginContext);

  return (
    <main>
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="row login_container rounded-4 w-75 py-5 my-5">
          <div className="col">
            <div className="login_container">
              <div className="login_header d-flex justify-content-center">
                <img src="img/CTEC_Logo.png" alt="CTEC_Logo" id="CTEC_Logo" />
              </div>
              <div className="col d-flex justify-content-center align-items-center flex-column mt-3">
                {/* <button className='btn btn-sm btn-danger' onClick={logoutIdentity}>Logout</button> */}
                {isLoadingUser ? (
                  <>
                    <div className="spinner-border text-success" role="status">
                    </div>
                    <span className="sr-only">Loading...</span>
                  </>
                ) : (
                  <button disabled={isLoadingUser} onClick={loginIdentity} className="btn btn-success w-75 mb-2" style={{backgroundColor: "#AFE3BD"}}>
                    <img  src='favicon.ico' /> 
                    <b style={{color: "#141414"}}> Login with Internet Identity</b>
                  </button>
                )} 
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login