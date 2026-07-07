import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext.jsx';
import Login from './Login';
import Dashboard from './dashboard.jsx';
import CVUpload from './CvUpload.jsx';
import Layout from './App.jsx';
import SignUp from './SignUp.jsx';
import Profile from './Profile.jsx';
import Offres from './Offres.jsx';
import Candidats from './Candidats.jsx';
import Moffres from './Moffres.jsx';
import EspEntretien from './Espentretien.jsx';
import Welcome from './Welcome.jsx';
import Users from './Users.jsx';
import Bar from './Bar.jsx';
import EntretienRecruteur from './EntretienRecruteur.jsx';
import Statistics from './Statistics.jsx';
import Propositions from './Propositions.jsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <Welcome />
    },
    {
        path: "/signup",
        element: <SignUp />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/dashboard",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: "cvupload",
                element: <CVUpload />
            },
            {
                path: "profile",
                element: <Profile />
            },
            {
                path: "offres",
                element: <Offres />
            },
            {
                path: "candidats",
                element: <Candidats />
            },
            {
                path: "moffres",
                element: <Moffres />
            },
            {
                path: "espentretien",
                element: <EspEntretien />
            },
            {
                path: "users",
                element: <Users/>
            },
            {
                path: "offres",
                element: <Offres />
            },
            {
                path: "entretien-rec",
                element: <EntretienRecruteur />
            },
            {
                path: "statistics",
                element: <Statistics />
            },
            {
                path: "propositions",
                element: <Propositions />
            }
        ]
    }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router}/>
    </ThemeProvider>
  </StrictMode>
);