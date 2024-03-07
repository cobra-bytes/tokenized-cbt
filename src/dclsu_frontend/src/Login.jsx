import React, { useContext } from 'react';
import { LoginContext } from './App';

const Login = () => {
  const { loginIdentity, isLoadingUser } = useContext(LoginContext);

  return (
    <main className="overflow-hidden">
      <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="d-flex flex-column justify-content-center align-items-center">
            <img src="img/CTEC_Logo.png" className="img-fluid" alt="CTEC_Logo" id="CTEC_Logo" />
          {isLoadingUser ? (
            <>
              <div className="spinner-border text-success" role="status"></div>
              <span className="sr-only">Loading...</span>
            </>
          ) : (
            <button
              disabled={isLoadingUser}
              onClick={loginIdentity}
              className="btn btn-success"
              style={{ backgroundColor: "#AFE3BD", width: "auto" }} // Ensuring width adjusts dynamically
            >
              <img src='favicon.ico' className="img-fluid" alt="icon" />
              <b style={{ color: "#141414" }}> Login with Internet Identity</b>
            </button>
          )}
          </div>
        </div>
    </main>
  );
}

export default Login;
