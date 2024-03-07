import React, { Profiler, createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Student from './Student/Student';
import Admin from './Admin/Admin';
import NotFound from './NotFound';
import { AuthClient } from '@dfinity/auth-client';
import { canisterId, createActor } from '../../declarations/dclsu_backend';
import { Principal } from '@dfinity/principal';
import Profile from './Student/Profile';
import AdminProfile from './Admin/AdminProfile';

export const LoginContext = createContext();

const App = () => {
    const [user, setUser] = useState({ principalID: '', isAuthenticated: false, isAdmin: false });
    const [userProfile, setUserProfile] = useState({});

    const [isLoadingUser, setIsLoadingUser] = useState(false);
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const storedProfile = JSON.parse(localStorage.getItem('profile'));
        if (storedUser && storedProfile) {
            setIsLoadingUser(true);
            setUser(storedUser);
            setUserProfile(storedProfile)
            setIsLoadingUser(false);
        } 
    }, []);

    const loginIdentity = async () => {
        const authClient = await AuthClient.create();
        if (!(await authClient.isAuthenticated())) {
            await authClient.login({
                // identityProvider: 'https://identity.ic0.app/#authorize', 
                identityProvider: 'http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943/#authorize',
                onSuccess: fetchUser,
            });
        }
    };

    const fetchUser = async () => {
        try {
            setIsLoadingUser(true);
            const authClient = await AuthClient.create();
            const identity = await authClient.getIdentity();

            const authenticatedCanister = createActor(canisterId, {
                agentOptions: {
                    identity,
                },
            });
            const whoIAm = await authenticatedCanister.whoAmI();
            const principal = Principal.fromText(String(whoIAm));
            const isAdmin = await authenticatedCanister.isAdmin(principal);
            const profile = await authenticatedCanister.getProfile(principal);
            setUserProfile(profile[1]);
            const newUser = { principalID: String(whoIAm), isAuthenticated: true, isAdmin };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            localStorage.setItem('profile', JSON.stringify(profile));
            setIsLoadingUser(false);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const logoutIdentity = async () => {
        try {
            const authClient = await AuthClient.create();
            await authClient.logout();
            setUser({ principalID: '', isAuthenticated: false, isAdmin: false });
            setUserProfile({});
            localStorage.removeItem('user');
            localStorage.removeItem('profile');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div>
            <LoginContext.Provider value={{ user, userProfile, loginIdentity, logoutIdentity, isLoadingUser }}>
                <BrowserRouter>
                    <Routes>
                        <Route key={location.key} path="/" element={<PublicElement />} />
                        <Route key={location.key}  path="/student" element={<StudentElement />} />
                        <Route key={location.key}  path="/profile" element={<StudentProfileElement />} />
                        <Route key={location.key}  path="/admin" element={<AdminElement />} />
                        <Route key={location.key}  path="/admin-profile" element={<AdminProfileElement />} />
                        <Route key={location.key}  path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </LoginContext.Provider>
        </div>
    );
};

function PublicElement() {
    const { user } = useContext(LoginContext);

    if (user.isAuthenticated && !user.isAdmin) {
        return <Navigate to="/student" />;
    } else if (user.isAuthenticated && user.isAdmin) {
        return <Navigate to="/admin" />;
    } else {
        return <Login />;
    }
}

function StudentElement() {
    const { user } = useContext(LoginContext);

    if (!user.isAdmin && user.isAuthenticated) {
        return <Student />;
    } else {
        return <Navigate to="/" />;
    }
}
function StudentProfileElement() {
    const { user } = useContext(LoginContext);

    if (user.isAuthenticated && !user.isAdmin) {
        return <Profile />;
    } else {
        return <Navigate to="/" />;
    }
}

function AdminElement() {
    const { user } = useContext(LoginContext);

    if (user.isAdmin && user.isAuthenticated) {
        return <Admin />;
    } else {
        return <Navigate to="/" />;
    }
}

function AdminProfileElement() {
    const { user } = useContext(LoginContext);

    if (user.isAdmin && user.isAuthenticated) {
        return <AdminProfile />;
    } else {
        return <Navigate to="/" />;
    }
}

export default App;
