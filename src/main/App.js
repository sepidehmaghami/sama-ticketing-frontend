import Login from "../components/login/login";
import Profile from "../components/profile/profile";
import Guide from "../components/guide/guide";
import Dashboard from "../components/dashboard/dashboard";
import Forgot from "../components/forgot/forgot";
import Register from "../components/register/register";
import Admin from "../components/admin/admin";
import Email from "../components/Result/email";
import "antd/dist/antd.css";
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/forgot">
            <Forgot />
          </Route>
          <Route path="/guide">
            <Guide />
          </Route>
          <Route path="/email">
            <Email />
          </Route>
          <PrivateRoute path="/profile">
            <Profile />
          </PrivateRoute>
          <PrivateRoute path="/admin">
            <Admin />
          </PrivateRoute>
          <PrivateRoute path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <Route path="/"> 
            {JSON.parse(localStorage.getItem("auth")) ? (
              <Dashboard />
            ) : (
              <Redirect to="/guide" />
            )}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;

function PrivateRoute({ children, ...rest }) { //... set other props in rest
  let variable = localStorage.getItem("auth");
  return (
    <Route
      {...rest} // show props
      render={({ location }) =>
        JSON.parse(variable) ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/guide",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
