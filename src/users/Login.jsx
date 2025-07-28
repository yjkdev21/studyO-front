import React from 'react';

function Login() {
  return (
    <main>
      <h2>로그인</h2>
      <form>
        <div>
          <label for="userId">ID</label><br />
          <input type="text" id="userId" name="userId" required />
        </div>
        <div>
          <label for="password">Password</label><br />
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">로그인</button>
        <button type="button">회원가입</button>
      </form>
    </main>
  );
}

export default Login;