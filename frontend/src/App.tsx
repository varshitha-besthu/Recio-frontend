import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import SelfRecording from "./pages/SelfRecording"; 
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import { RecoilRoot } from "recoil";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

export default function App() {
    return (
        <Router>

          <Routes>
            <Route path="/self" element={<SelfRecording />}/>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />

            <Route
             path="/dashboard" 
             element={
              <ProtectedRoute>
                  <Dashboard />
              </ProtectedRoute>
            } />

          </Routes>

        </Router>
      
    )
}
