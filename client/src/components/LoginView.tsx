import { useState } from "react";

function LoginView() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <>
      { !isAuth ? (
        <>
          <h1>Login</h1>
          <input />
        </>
      ) : (
        <h3>Logged in!</h3>
      )
      }
    </>
  )
}

export default LoginView;